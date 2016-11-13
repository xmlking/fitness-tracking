InfluxDB
========
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

### Setup
```bash
mkdir /Developer/Applications/inflexdb
cd /Developer/Applications/inflexdb
influxd config > conf/influxdb.conf
mkdir db
```

#### Setup to auto rotate logs
```bash
sudo logrotate  conf/logrotate.d/influxdb
```

#### Starting InfluxDB
```bash
# run fourground
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
http://localhost:8083/

#### Kill background process
```bash
kill -9 $(cat logs/influxdb.pid)
```

#### Configuration
Enable authentication as documented [here](https://docs.influxdata.com/influxdb/v1.0/query_language/authentication_and_authorization/#admin-users)
 
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


# Downsampling and Data Retention (only if needed)
CREATE RETENTION POLICY two_hours ON iotdb DURATION 2h REPLICATION 1 DEFAULT
SHOW RETENTION POLICIES ON iotdb
CREATE CONTINUOUS QUERY cq_30m ON iotdb BEGIN SELECT mean(category), mean(device), mean(sensorId), mean(userid), mean(value) INTO iotdb."default".downsampled_heartRate FROM heartRate GROUP BY time(30m) END
SHOW CONTINUOUS QUERIES
SELECT * FROM iotdb."default".downsampled_heartRate LIMIT 5

# select wearables
use iotdb
SELECT * FROM heartRate WHERE time > now() - 5s
SELECT * FROM skinTemp WHERE time > now() - 10m
SELECT * FROM contact WHERE time > now() - 5s
SELECT * FROM  heartRate WHERE category =  'wearables' LIMIT 5
# how to purge data? 
DROP MEASUREMENT heartRate
# show tag keys
SHOW TAG KEYS FROM "wearables"
# show tag values
SHOW TAG VALUES FROM "wearables" WITH KEY = "sensor"
# show server stats
SHOW STATS
SHOW DIAGNOSTICS
````