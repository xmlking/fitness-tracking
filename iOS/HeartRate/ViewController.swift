import UIKit
import SocketIOClientSwift

class ViewController: UIViewController, MSBClientManagerDelegate {
    
    //MARK: Properties
    @IBOutlet weak var serverStatusLabel: UILabel!
    @IBOutlet weak var bandStatusLabel: UILabel!
    @IBOutlet weak var hrLockStatusLabel: UILabel!
    
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
    @IBOutlet weak var distanceLabel: UILabel!
    
    @IBOutlet weak var stepsAscendedLabel: UILabel!
    @IBOutlet weak var stepsDescendedLabel: UILabel!
    
    @IBOutlet weak var baroPressureLabel: UILabel!
    @IBOutlet weak var baroTempLabel: UILabel!
 
    @IBOutlet weak var lightLabel: UILabel!
    @IBOutlet weak var resistanceLabel: UILabel!
    @IBOutlet weak var wornStateLabel: UILabel!

    
    let socket = SocketIOClient(socketURL: NSURL(string: "http://sumanths-mbp.fritz.box:3010")!, options: [.Nsp("/iot")]);
    //let socket = SocketIOClient(socketURL: NSURL(string: "http://172.20.10.5:3010")!, options: [.Nsp("/iot")]);
    let hrTag = ["user":"sumo", "device":"mband", "sensor":"hr"]
    
    weak var client: MSBClient?

    
    override func viewDidLoad() {
        super.viewDidLoad()
        initSocket();
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
    }
    
    // Mark - Init
    func initSocket() {

        socket.on("connect") {data, ack in
            self.serverStatusLabel.text = "Connected";
        }
        
        socket.on("haptic") {data, ack in
            // let color = data[0] as? String
            // self.serverStatusLabel.text = color;
        }
        
        socket.connect()
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
    
    func reportHeartRate(heartRateData: MSBSensorHeartRateData!, error: NSError!) {
        self.hrLabel.text = NSString(format: "%0.2d", heartRateData.heartRate) as String
        
        if (heartRateData.quality == MSBSensorHeartRateQuality.Locked) {
            self.hrLockStatusLabel.text = "Locked"
            socket.emit("data",["values": ["value": heartRateData.heartRate], "tags":hrTag ])
            
        } else if (heartRateData.quality == MSBSensorHeartRateQuality.Acquiring)
        {
            self.hrLockStatusLabel.text = "Acquiring"
        }
    }
 
    
    //MARK: UI Actions
    @IBAction func buttonStartRead(sender: UIButton) {
        MSBClientManager.sharedManager().delegate = self
        if let client = MSBClientManager.sharedManager().attachedClients().first as? MSBClient {
            self.client = client
            self.bandStatusLabel.text = "Connecting...";
            MSBClientManager.sharedManager().connectClient(self.client)
        } else {
            self.bandStatusLabel.text = "Can't connect";
        }
    }
    
    // Mark - MSBand Client Manager Delegates
    func clientManager(clientManager: MSBClientManager!, clientDidConnect client: MSBClient!) {
         self.bandStatusLabel.text =  "Connected"
        
         self.getBandHeartRateConsent() {
            (result: Bool) in
            
            if (result) {
                self.hrLockStatusLabel.text =  "Access granted"

                do {
                    try client.sensorManager.startHeartRateUpdatesToQueue(nil, withHandler: self.reportHeartRate)
                    try! client.sensorManager.startSkinTempUpdatesToQueue(nil, withHandler: { (skinTempData: MSBSensorSkinTemperatureData!, error:NSError!) -> Void in
                        self.skinTempLabel.text = NSString(format: "%0.2f", skinTempData.temperature*9/5+32) as String
                        self.socket.emit("data",
                            ["values": ["value": skinTempData.temperature, "time":NSDate().timeIntervalSince1970 as AnyObject],
                                "tags": ["user":"sumo", "device":"mband", "sensor":"st"] ])
                        
                    })
                    
                    try! client.sensorManager.startCaloriesUpdatesToQueue(nil, withHandler: { (caloriesData:MSBSensorCaloriesData!, error:NSError!) -> Void in
                        let calories = caloriesData.calories
                        let caloriesToday = caloriesData.caloriesToday
                        self.caloriesLabel.text = String(format: "%0.1d", calories)
                        self.caloriesTodayLabel.text = String(format: "%0.1d", caloriesToday)
                        self.socket.emit("data",
                            ["values": [
                                "calories": Int(calories) as AnyObject,
                                "caloriesToday": Int(caloriesToday) as AnyObject,
                                "time":NSDate().timeIntervalSince1970 as AnyObject],
                             "tags": ["user":"sumo", "device":"mband", "sensor":"cl"] ])
                        
                        
                    })
                    
                    try! client.sensorManager.startPedometerUpdatesToQueue(nil, withHandler: { (stepsData:MSBSensorPedometerData!, error:NSError!) -> Void in
                        self.totalStepsLabel.text = NSString(format:"%0.1d", stepsData.totalSteps) as String
                        self.stepsTodayLabel.text = NSString(format:"%0.1d", stepsData.stepsToday) as String
                        self.socket.emit("data",
                            ["values": [
                                "totalSteps": Int(stepsData.totalSteps) as AnyObject ,
                                "stepsToday": Int(stepsData.stepsToday) as AnyObject ,
                                "time": NSDate().timeIntervalSince1970 as AnyObject],
                             "tags": ["user":"sumo", "device":"mband", "sensor":"steps"] ])
                        
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
                        self.socket.emit("data",
                            ["values": [
                                "value": uv_string as AnyObject,
                                "time": NSDate().timeIntervalSince1970 as AnyObject],
                             "tags": ["user":"sumo", "device":"mband", "sensor":"uv"] ])
                        
                    })

                        
                    try! client.sensorManager.startDistanceUpdatesToQueue(nil, withHandler: { (distanceData:MSBSensorDistanceData!, error:NSError!) -> Void in
                    
                        let pace = distanceData.pace
                        let speed = distanceData.speed
                        let distance = distanceData.totalDistance
                        self.paceLabel.text = NSString(format:"%0.1d", pace) as String
                        self.speedLabel.text = NSString(format:"%0.1d", speed) as String
                        self.distanceLabel.text = NSString(format:"%0.1d", distance) as String
                        self.socket.emit("data",
                            ["values": [
                                "pace": pace as AnyObject ,
                                "speed": speed as AnyObject ,
                                "distance": distance as AnyObject ,
                                "time": NSDate().timeIntervalSince1970 as AnyObject],
                             "tags": ["user":"sumo", "device":"mband", "sensor":"position"] ])
                        
                    })

                    try client.sensorManager.startBandContactUpdatesToQueue(nil, withHandler: { (contactData:MSBSensorBandContactData!, error:NSError!) -> Void in
                        var wornState = ""
                        print(contactData.wornState)
                        switch contactData.wornState {
                        case .NotWorn:
                            wornState = "NotWorn"
                        case .Worn:  //MSBSensorBandContactState.Worn
                            wornState = "Worn"
                            print("Worn")
                        case MSBSensorBandContactState.Unknown:
                            wornState = "Unknown"
                            print("Unknown")
                        }
                        
                        self.wornStateLabel.text =  wornState
                        
                        self.socket.emit("data",
                            ["values": [
                                "value": wornState as AnyObject,
                                "time":NSDate().timeIntervalSince1970 as AnyObject],
                                "tags": ["user":"sumo", "device":"mband", "sensor":"contact"] ])
                    })
                    
                    /**
                    try! client.sensorManager.startAltimeterUpdatesToQueue(nil, withHandler: { (altimeterData:MSBSensorAltimeterData!, error:NSError!) -> Void in
                    let stepsAscended = altimeterData.stepsAscended
                    let stepsDescended = altimeterData.stepsDescended
                    self.stepsAscendedLabel.text = NSString(format:"%0.1f", stepsAscended) as String
                    self.stepsDescendedLabel.text = NSString(format:"%0.1f", stepsDescended) as String
                    self.socket.emit("data",
                    ["values": [
                    "stepsAscended": stepsAscended as AnyObject ,
                    "stepsDescended": stepsDescended as AnyObject ,
                    "time": NSDate().timeIntervalSince1970 as AnyObject],
                    "tags": ["user":"sumo", "device":"mband", "sensor":"altimeter"] ])
                    })
                    
                    
                    
                    try! client.sensorManager.startBarometerUpdatesToQueue(nil, withHandler: { (barometerData:MSBSensorBarometerData!, error:NSError!) -> Void in
                    let pressure = barometerData.airPressure
                    let temp = barometerData.temperature
                    self.baroPressureLabel.text = NSString(format:"%0.1f", pressure) as String
                    self.baroTempLabel.text = NSString(format:"%0.1f", temp) as String
                    self.socket.emit("data",
                    ["values": [
                    "pressure": pressure as AnyObject ,
                    "temp": temp as AnyObject ,
                    "time": NSDate().timeIntervalSince1970 as AnyObject],
                    "tags": ["user":"sumo", "device":"mband", "sensor":"barometer"] ])
                    })
                    
                    
                    try! client.sensorManager.startAmbientLightUpdatesToQueue(nil, withHandler: { (lightData:MSBSensorAmbientLightData!, error:NSError!) -> Void in
                    let light = lightData.brightness
                    self.lightLabel.text = NSString(format:"%0.1d", Int(light)) as String
                    self.socket.emit("data",
                    ["values": [
                    "value": Int(light) as AnyObject,
                    "time":NSDate().timeIntervalSince1970 as AnyObject],
                    "tags": ["user":"sumo", "device":"mband", "sensor":"light"] ])
                    
                    })
                    
                    
                    try! client.sensorManager.startGSRUpdatesToQueue(nil, withHandler: { (gsrData:MSBSensorGSRData!, error:NSError!) -> Void in
                    let resistance = gsrData.resistance
                    self.resistanceLabel.text = NSString(format:"%0.1f", resistance) as String
                    self.socket.emit("data",
                    ["values": [
                    "value": resistance as AnyObject,
                    "time":NSDate().timeIntervalSince1970 as AnyObject],
                    "tags": ["user":"sumo", "device":"mband", "sensor":"GSR"] ])
                    })
                    
                    try! client.sensorManager.startRRIntervalUpdatesToQueue(nil, withHandler: { (rrIntervalData:MSBSensorRRIntervalData!, error:NSError!) -> Void in
                    let rrInterval = rrIntervalData.interval
                    self.rrIntervalLabel.text = NSString(format:"%0.1f", rrInterval) as String
                    self.socket.emit("data",
                    ["values": [
                    "value": rrInterval as AnyObject,
                    "time":NSDate().timeIntervalSince1970 as AnyObject],
                    "tags": ["user":"sumo", "device":"mband", "sensor":"rrInterval"] ])
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

    
    func clientManager(clientManager: MSBClientManager!, clientDidDisconnect client: MSBClient!) {
         self.bandStatusLabel.text = "Disconnected"
    }
    
    func clientManager(clientManager: MSBClientManager!, client: MSBClient!, didFailToConnectWithError error: NSError!) {
        self.bandStatusLabel.text = "Can't connect"
    }

}

