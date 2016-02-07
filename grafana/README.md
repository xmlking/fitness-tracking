Grafana
-------
Open source dashboard builder for visualizing time series metrics, IoT data.

### Install 
This project includes Grafana pre-build for Mac using [steps](http://docs.grafana.org/project/building_from_source/)
For other platforms, download from [grafana](http://grafana.org/download/)

### Start
```bash
./bin/grafana-server --pidfile=logs/grafana.pid
# Run background
nohup ./bin/grafana-server --pidfile=logs/grafana.pid > /dev/null 2>&1 &
```

### Web Access

http://localhost:3000
