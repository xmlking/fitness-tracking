import UIKit
import SocketIOClientSwift

class ViewController: UIViewController, MSBClientManagerDelegate {
    
    //MARK: Properties
    @IBOutlet weak var labelStatusServer: UILabel!
    @IBOutlet weak var labelStatusBand: UILabel!
    @IBOutlet weak var labelStatusHeartRate: UILabel!
    @IBOutlet weak var labelStatusSkinTemp: UILabel!
    @IBOutlet weak var labelStatusHeartRateSensor: UILabel!

    let socket = SocketIOClient(socketURL: NSURL(string: "http://sumanths-mbp.fritz.box:3010")!, options: [.Nsp("/iot")]);
    //let socket = SocketIOClient(socketURL: NSURL(string: "http://172.20.10.5:3010")!, options: [.Nsp("/iot")]);
    let hrTag = ["user":"sumo", "device":"mband", "sensor":"hr"]
    let stTag = ["user":"sumo", "device":"mband", "sensor":"st"]
    
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
            self.labelStatusServer.text = "Connected";
        }
        
        socket.on("haptic") {data, ack in
            // let color = data[0] as? String
            // self.labelStatusServer.text = color;
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
            self.labelStatusHeartRateSensor.text =  "Getting access..."
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
        self.labelStatusHeartRate.text = NSString(format: "%0.2d", heartRateData.heartRate) as String
        
        if (heartRateData.quality == MSBSensorHeartRateQuality.Locked) {
            self.labelStatusHeartRateSensor.text = "Locked"
            //socket.emit("heartRate", heartRateData.heartRate)
            socket.emit("data",["values": ["value": heartRateData.heartRate], "tags":hrTag ])
            
        } else if (heartRateData.quality == MSBSensorHeartRateQuality.Acquiring)
        {
            self.labelStatusHeartRateSensor.text = "Acquiring"
        }
    }
    
    func reportSkinTemp(skinTempData: MSBSensorSkinTemperatureData!, error: NSError!) {
        self.labelStatusSkinTemp.text = NSString(format: "%0.2f", skinTempData.temperature*9/5+32) as String
        //socket.emit("skinTemp", skinTempData.temperature)
        socket.emit("data",["values": ["value": skinTempData.temperature], "tags":stTag ])
    }
    
    //MARK: UI Actions
    @IBAction func buttonStartRead(sender: UIButton) {
        MSBClientManager.sharedManager().delegate = self
        if let client = MSBClientManager.sharedManager().attachedClients().first as? MSBClient {
            self.client = client
            self.labelStatusBand.text = "Connecting...";
            MSBClientManager.sharedManager().connectClient(self.client)
        } else {
            self.labelStatusBand.text = "Can't connect";
        }
    }
    
    // Mark - MSBand Client Manager Delegates
    func clientManager(clientManager: MSBClientManager!, clientDidConnect client: MSBClient!) {
         self.labelStatusBand.text =  "Connected"
        
         self.getBandHeartRateConsent() {
            (result: Bool) in
            
            if (result) {
                self.labelStatusHeartRateSensor.text =  "Access granted"

                do {
                    try client.sensorManager.startHeartRateUpdatesToQueue(nil, withHandler: self.reportHeartRate)
                    try client.sensorManager.startSkinTempUpdatesToQueue(nil, withHandler: self.reportSkinTemp)
                } catch let error as NSError {
                    print("Error: \(error.localizedDescription)")
                }
            } else {
                self.labelStatusHeartRateSensor.text =  "Access denied"
            }
        }
    }

    
    func clientManager(clientManager: MSBClientManager!, clientDidDisconnect client: MSBClient!) {
         self.labelStatusBand.text = "Disconnected"
    }
    
    func clientManager(clientManager: MSBClientManager!, client: MSBClient!, didFailToConnectWithError error: NSError!) {
        self.labelStatusBand.text = "Can't connect"
    }

}

