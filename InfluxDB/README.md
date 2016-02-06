InfluxDB
--------
time-series datastore for metrics, events, and real-time sensor data.


#### Install via Homebrew
```bash
brew update
brew install influxdb
```

#### System Configuration 
```bash
# Increase ulimit
ulimit -n 63536
cat /proc/sys/fs/file-max
```

#### Setup to auto rotate logs
```bash
sudo logrotate  conf/logrotate.d/influxdb
```

#### Starting InfluxDB
```bash
influxd -config conf/influxdb.conf
# or run background
nohup influxd -pidfile logs/influxdb.pid -config conf/influxdb.conf > /dev/null  2>logs/influxdb.log &
```


By default, InfluxDB uses the following network ports:
```
TCP port 8083 is used for InfluxDB’s Admin panel
TCP port 8086 is used for client-server communication over InfluxDB’s HTTP API
TCP ports 8088 and 8091 are required for clustered InfluxDB instances
```

#### Kill background process
```bash
kill -9 $(cat logs/influxdb.pid)
```

#### Configuration
Enable authentication as documented [here](https://influxdb.com/docs/v0.9/administration/authentication_and_authorization.html#admin-users)
 
##### Open Command Shell
```bash
influx
```

````sql
CREATE USER admin WITH PASSWORD 'admin123'  WITH ALL PRIVILEGES
 
CREATE DATABASE iotdb
CREATE USER grafana WITH PASSWORD 'grafana123'
GRANT READ ON iotdb TO grafana
CREATE USER collectd WITH PASSWORD 'collectd123'
GRANT WRITE ON iotdb TO collectd
SHOW USERS
````