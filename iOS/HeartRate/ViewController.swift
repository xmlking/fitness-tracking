import UIKit
import SocketIOClientSwift

class ViewController: UIViewController, MSBClientManagerDelegate {
    
    //MARK: Properties
    @IBOutlet weak var serverStatusLabel: UILabel!
    @IBOutlet weak var bandStatusLabel: UILabel!
    @IBOutlet weak var hrLockStatusLabel: UILabel!
    
    @IBOutlet weak var connectSpinner: UIActivityIndicatorView!
    
    @IBOutlet weak var hrLabel: UILabel!
    @IBOutlet weak var rrIntervalLabel: UILabel!
    @IBOutlet weak var skinTempLabel: UILabel!
    @IBOutlet weak var totalStepsLabel: UILabel!
    @IBOutlet weak var stepsTodayLabel: UILabel!
    @IBOutlet weak var caloriesLabel: UILabel!
    @IBOutlet weak var caloriesTodayLabel: UILabel!
    @IBOutlet weak var uvLabel: UILabel!
    
    @IBOutlet weak var paceLabel: UILabel!
    @IBOutlet weak var speedLabel: UILabel!
    @IBOutlet weak var totalDistanceLabel: UILabel!
    @IBOutlet weak var distanceTodayLabel: UILabel!
    @IBOutlet weak var motionTypeLabel: UILabel!
    
    @IBOutlet weak var stepsAscendedLabel: UILabel!
    @IBOutlet weak var stepsDescendedLabel: UILabel!
    
    @IBOutlet weak var baroPressureLabel: UILabel!
    @IBOutlet weak var baroTempLabel: UILabel!
 
    @IBOutlet weak var lightLabel: UILabel!
    @IBOutlet weak var resistanceLabel: UILabel!
    @IBOutlet weak var wornStateLabel: UILabel!

    @IBOutlet weak var sensorState: UISwitch!
    
    let tileID:NSUUID = NSUUID(UUIDString: "DCBABA9F-12FD-47A5-83A9-E7270A4399BB")!
    
    let subscriber = ["type": "wearables" , "userid":"sumo", "device":"msband"]
    
    let socket = SocketIOClient(socketURL: NSURL(string: "http://sumanths-mbp.fritz.box:3010")!, options: [.Nsp("/iot")]);
    //let socket = SocketIOClient(socketURL: NSURL(string: "http://172.20.10.5:3010")!, options: [.Nsp("/iot")]);
    
    weak var client: MSBClient?

    
    override func viewDidLoad() {
        super.viewDidLoad()
        initSocket();
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
    }
    
    // Mark - Util
    func getCurrentMillis()->NSInteger {
        return NSInteger(NSDate().timeIntervalSince1970 * 1000)
    }
    
    func sendHaptic() {
        print("sendHaptic");
        if let band = self.client {
            band.notificationManager.vibrateWithType(MSBNotificationVibrationType.OneTone, completionHandler: {(error) in
            })
        }
    }
    
    func sendMessage(title: String, body: String) {
        print("sendMessage");
        if let band = self.client {
            band.notificationManager.sendMessageWithTileID(tileID, title: title, body: body, timeStamp: NSDate(), flags: MSBNotificationMessageFlags.ShowDialog, completionHandler: { (error) -> Void in
            })
        }
    }
    
    
    // Mark - Init
    func initSocket() {

        socket.on("connect") {data, ack in
            self.serverStatusLabel.text = "Connected";
        }
        
        socket.on("haptic") {data, ack in
            self.sendHaptic()
            // self.serverStatusLabel.text = data.body;
        }
        
        socket.on("message") {data, ack in
            // self.sendMessage(data.title, data.body)
            // self.serverStatusLabel.text = data.body;
        }
        
        socket.connect()
    }
  
    //MARK: UI Actions
    @IBAction func toggleSensorRead(sender: AnyObject) {
        if sensorState.on {
            MSBClientManager.sharedManager().delegate = self
            if let client = MSBClientManager.sharedManager().attachedClients().first as? MSBClient {
                self.client = client
                self.bandStatusLabel.text = "Connecting to Band...";
                self.connectSpinner.startAnimating()
                
                MSBClientManager.sharedManager().connectClient(self.client)
            } else {
                self.bandStatusLabel.text = "No Bands attached";
            }
        } else {
            disconnectBand()
        }
        
    }
    

    // Mark - Heart rate helpers
    func getBandHeartRateConsent(completion: (result: Bool) -> Void) {
        let consent:MSBUserConsent? = self.client?.sensorManager.heartRateUserConsent()
        
        switch (consent) {
        case .Granted?:
            completion(result: true)
            break
        case .NotSpecified?, .Declined?:
            self.hrLockStatusLabel.text =  "Getting access..."
            client?.sensorManager.requestHRUserConsentWithCompletion({ (consent:Bool, error:NSError!) -> Void in
                completion(result: consent)
            })
            break;
        default:
            completion(result: false)
            break;
        }
    }
    
    
    // Mark - MSBand Client Manager Delegates
    func clientManager(clientManager: MSBClientManager!, clientDidConnect client: MSBClient!) {
        self.bandStatusLabel.text =  "Connected"
        self.connectSpinner.stopAnimating()
        
         self.getBandHeartRateConsent() {
            (result: Bool) in
            
            if (result) {
                self.hrLockStatusLabel.text =  "Access granted"
                
                print("subscribeing...")
                self.socket.emit("subscribe", self.subscriber);
                
                do {
                    try client.sensorManager.startHeartRateUpdatesToQueue(nil, withHandler: { (heartRateData: MSBSensorHeartRateData!, error:NSError!) -> Void in
                        self.hrLabel.text = NSString(format: "%0.2d", heartRateData.heartRate) as String
                    
                        if (heartRateData.quality == MSBSensorHeartRateQuality.Locked) {
                            self.hrLockStatusLabel.text = "Locked"
                            self.socket.emit("point",
                                ["values": [
                                    "heartRate": heartRateData.heartRate as AnyObject,
                                    "time": self.getCurrentMillis()],
                                 "tags": [ "sensor":"heartRate"] ])
                        
                        } else if (heartRateData.quality == MSBSensorHeartRateQuality.Acquiring)
                        {
                            self.hrLockStatusLabel.text = "Acquiring"
                        }
                    })
                    
                    try! client.sensorManager.startSkinTempUpdatesToQueue(nil, withHandler: { (skinTempData: MSBSensorSkinTemperatureData!, error:NSError!) -> Void in
                        self.skinTempLabel.text = NSString(format: "%0.2f", skinTempData.temperature*9/5+32) as String
                        self.socket.emit("point",
                            ["values": [
                                "skinTemp": skinTempData.temperature as AnyObject,
                                "time": self.getCurrentMillis()],
                             "tags": [ "sensor":"skinTemp"] ])
                        
                    })
                    
                    try! client.sensorManager.startCaloriesUpdatesToQueue(nil, withHandler: { (caloriesData:MSBSensorCaloriesData!, error:NSError!) -> Void in
                        let calories = caloriesData.calories
                        let caloriesToday = caloriesData.caloriesToday
                        self.caloriesLabel.text = String(format: "%0.1d", calories)
                        self.caloriesTodayLabel.text = String(format: "%0.1d", caloriesToday)
                        self.socket.emit("point",
                            ["values": [
                                "calories": calories as AnyObject,
                                "caloriesToday": caloriesToday as AnyObject,
                                "time": self.getCurrentMillis()],
                             "tags": [ "sensor":"calories"] ])
                        
                        
                    })
                    
                    try! client.sensorManager.startPedometerUpdatesToQueue(nil, withHandler: { (stepsData:MSBSensorPedometerData!, error:NSError!) -> Void in
                        self.totalStepsLabel.text = NSString(format:"%0.1d", stepsData.totalSteps) as String
                        self.stepsTodayLabel.text = NSString(format:"%0.1d", stepsData.stepsToday) as String
                        self.socket.emit("point",
                            ["values": [
                                "totalSteps": stepsData.totalSteps as AnyObject ,
                                "stepsToday": stepsData.stepsToday as AnyObject ,
                                "time": self.getCurrentMillis()],
                             "tags": [ "sensor":"pedometer"] ])
                        
                    })
                    
                    try! client.sensorManager.startUVUpdatesToQueue(nil, withHandler: { (uvData:MSBSensorUVData!, error:NSError!) -> Void in
                        let uv = uvData.uvIndexLevel
                        var uv_string = ""
                        if uv == MSBSensorUVIndexLevel.Low {
                            uv_string = "low"
                        }else if uv == MSBSensorUVIndexLevel.Medium {
                            uv_string = "medium"
                        }else if uv == MSBSensorUVIndexLevel.None {
                            uv_string = "none"
                        }else if uv == MSBSensorUVIndexLevel.High {
                            uv_string = "high"
                        }
                        self.uvLabel.text = uv_string
                        self.socket.emit("point",
                            ["values": [
                                "uv": uv_string as AnyObject,
                                "time": self.getCurrentMillis()],
                             "tags": [ "sensor":"uv"] ])
                        
                    })

                        
                    try! client.sensorManager.startDistanceUpdatesToQueue(nil, withHandler: { (distanceData:MSBSensorDistanceData!, error:NSError!) -> Void in
                    
                        let pace = distanceData.pace
                        let speed = distanceData.speed
                        let totalDistance = distanceData.totalDistance
                        let distanceToday = distanceData.distanceToday
                        var motionType = "";
                        switch distanceData.motionType {
                        case .Unknown:
                            motionType = "Unknown"
                        case .Idle:
                            motionType = "Idle"
                        case .Walking:
                            motionType = "Walking"
                        case .Jogging:
                            motionType = "Jogging"
                        case .Running:
                            motionType = "Running"
                        }
                        self.paceLabel.text = NSString(format:"%0.1d", pace) as String
                        self.speedLabel.text = NSString(format:"%0.1d", speed) as String
                        self.totalDistanceLabel.text = NSString(format:"%0.1d", totalDistance) as String
                        self.distanceTodayLabel.text = NSString(format:"%0.1d", distanceToday) as String
                        self.motionTypeLabel.text = motionType
                        
                        self.socket.emit("point",
                            ["values": [
                                "pace": pace as AnyObject ,
                                "speed": speed as AnyObject ,
                                "totalDistance": totalDistance as AnyObject ,
                                "distanceToday": distanceToday as AnyObject ,
                                "motionType": motionType as AnyObject ,
                                "time": self.getCurrentMillis()],
                             "tags": [ "sensor":"distance"] ])
                        
                    })

                    try client.sensorManager.startBandContactUpdatesToQueue(nil, withHandler: { (contactData:MSBSensorBandContactData!, error:NSError!) -> Void in
                        var wornState = ""
                        print(contactData.wornState)
                        switch contactData.wornState {
                        case .NotWorn:
                            wornState = "NotWorn"
                        case .Worn:
                            wornState = "Worn"
                            print("Worn")
                        case MSBSensorBandContactState.Unknown:
                            wornState = "Unknown"
                            print("Unknown")
                        }
                        
                        self.wornStateLabel.text =  wornState
                        
                        self.socket.emit("point",
                            ["values": [
                                "wornState": wornState as AnyObject,
                                "time": self.getCurrentMillis()],
                                "tags": [ "sensor":"contact"] ])
                    })
                    
                    /**
                    try! client.sensorManager.startAltimeterUpdatesToQueue(nil, withHandler: { (altimeterData:MSBSensorAltimeterData!, error:NSError!) -> Void in
                    let stepsAscended = altimeterData.stepsAscended
                    let stepsDescended = altimeterData.stepsDescended
                    self.stepsAscendedLabel.text = NSString(format:"%0.1f", stepsAscended) as String
                    self.stepsDescendedLabel.text = NSString(format:"%0.1f", stepsDescended) as String
                    self.socket.emit("point",
                    ["values": [
                    "stepsAscended": stepsAscended as AnyObject ,
                    "stepsDescended": stepsDescended as AnyObject ,
                    "time": self.getCurrentMillis()],
                    "tags": [ "sensor":"altimeter"] ])
                    })
                    
                    
                    
                    try! client.sensorManager.startBarometerUpdatesToQueue(nil, withHandler: { (barometerData:MSBSensorBarometerData!, error:NSError!) -> Void in
                    let pressure = barometerData.airPressure
                    let temp = barometerData.temperature
                    self.baroPressureLabel.text = NSString(format:"%0.1f", pressure) as String
                    self.baroTempLabel.text = NSString(format:"%0.1f", temp) as String
                    self.socket.emit("point",
                    ["values": [
                    "pressure": pressure as AnyObject ,
                    "temp": temp as AnyObject ,
                    "time": self.getCurrentMillis()],
                    "tags": [ "sensor":"barometer"] ])
                    })
                    
                    
                    try! client.sensorManager.startAmbientLightUpdatesToQueue(nil, withHandler: { (lightData:MSBSensorAmbientLightData!, error:NSError!) -> Void in
                    let brightness = lightData.brightness
                    self.lightLabel.text = NSString(format:"%0.1d", Int(brightness)) as String
                    self.socket.emit("point",
                    ["values": [
                    "brightness": brightness as AnyObject,
                    "time": self.getCurrentMillis()],
                    "tags": [ "sensor":"light"] ])
                    
                    })
                    
                    
                    try! client.sensorManager.startGSRUpdatesToQueue(nil, withHandler: { (gsrData:MSBSensorGSRData!, error:NSError!) -> Void in
                    let resistance = gsrData.resistance
                    self.resistanceLabel.text = NSString(format:"%0.1f", resistance) as String
                    self.socket.emit("point",
                    ["values": [
                    "resistance": resistance as AnyObject,
                    "time": self.getCurrentMillis()],
                    "tags": [ "sensor":"GSR"] ])
                    })
                    
                    try! client.sensorManager.startRRIntervalUpdatesToQueue(nil, withHandler: { (rrIntervalData:MSBSensorRRIntervalData!, error:NSError!) -> Void in
                    let rrInterval = rrIntervalData.interval
                    self.rrIntervalLabel.text = NSString(format:"%0.1f", rrInterval) as String
                    self.socket.emit("point",
                    ["values": [
                    "rr": rrInterval as AnyObject,
                    "time": self.getCurrentMillis()],
                    "tags": [ "sensor":"rrInterval"] ])
                    })
                    **/

                } catch let error as NSError {
                    print("Error: \(error.localizedDescription)")
                }
            } else {
                self.hrLockStatusLabel.text =  "Access denied"
            }
        }
    }

    
    func disconnectBand() {
        if let client = self.client {
            if (!client.isDeviceConnected) {
                return;
            }
            do {
                try client.sensorManager.stopHeartRateUpdatesErrorRef()
                try client.sensorManager.stopSkinTempUpdatesErrorRef()
                try client.sensorManager.stopCaloriesUpdatesErrorRef()
                try client.sensorManager.stopPedometerUpdatesErrorRef()
                try client.sensorManager.stopUVUpdatesErrorRef()
                try client.sensorManager.stopDistanceUpdatesErrorRef()
                try client.sensorManager.stopBandContactUpdatesErrorRef()
                
            } catch let error as NSError {
                print("Error: \(error.localizedDescription)")
            }
            MSBClientManager.sharedManager().cancelClientConnection(client)
            self.client = nil
            print("unsubscribeing...")
            self.socket.emit("unsubscribe", self.subscriber);
        }

    }
    
    func clientManager(clientManager: MSBClientManager!, clientDidDisconnect client: MSBClient!) {
         self.bandStatusLabel.text = "Disconnected"
    }
    
    func clientManager(clientManager: MSBClientManager!, client: MSBClient!, didFailToConnectWithError error: NSError!) {
        self.bandStatusLabel.text = "Can't connect"
    }

}

