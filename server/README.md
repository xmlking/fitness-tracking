
wget https://s3.amazonaws.com/influxdb/influxdb_0.9.6.1_x86_64.tar.gz
tar xvfz influxdb_0.9.6.1_x86_64.tar.gz

#start
influxd
http://localhost:8083/#
#client 
inclux
INSERT cpu,host=serverA,region=us_west value=0.64
INSERT iot,device=mband,sensor=hr value=127
INSERT iot,device=mband,sensor=steps value=55,gps=12
#dashboard 
chronograf -config=/usr/local/etc/chronograf.toml
http://0.0.0.0:3000/

features
InfluxDB is an open source distributed time series database with no external dependencies. 
It's useful for recording metrics, events, and performing analytics.

https://influxdata.com/use-cases/iot-and-sensor-data/
Purpose built for time-series data, no special schema design or custom app logic required
http://grafana.org/features/

build
```bash
go version
```
 

https://account.live.com/developers/applications
client_id:0000000044176169
scope:mshealth.ReadProfile mshealth.ReadDevices mshealth.ReadActivityHistory mshealth.ReadActivityLocation offline_access
response_type:token
redirect_uri:http://localhost:3000/mbsync
client_secret:FSjOQfi5i2cvqTq8xDuChbdJWN2vqBK7


http://developer.microsofthealth.com/Content/docs/MS%20Health%20API%20Getting%20Started.pdf 
https://github.com/peted70/MSHealthAPIClient/blob/master/MSHealthAPIClient/MainPage.xaml.cs