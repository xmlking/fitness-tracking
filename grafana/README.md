Grafana
=======
Open source dashboard builder for visualizing time series metrics, IoT data.

### Install 
```bash
brew update
brew install grafana
# to update use the reinstall command
brew update
brew reinstall grafana
```

### Start
```bash
# To have launchd start grafana now and restart at login:
  brew services start grafana
# Or, if you don't want/need a background service you can just run:
cd grafana
grafana-server \
    --config=./conf/grafana.ini \
    --pidfile=logs/grafana.pid \
    --homepath /usr/local/share/grafana \
    cfg:default.paths.logs=./logs \
    cfg:default.paths.data=./data \
    cfg:default.paths.plugins=./plugins
# or, use bin/grafana.sh 
./bin/grafana.sh start
./bin/grafana.sh stop
# or, Run background
nohup grafana-server --pidfile=logs/grafana.pid > /dev/null 2>&1 &
```

### Web Access
http://localhost:3000/