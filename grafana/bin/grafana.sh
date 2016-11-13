
#!/usr/bin/env bash
DAEMON=grafana-server
EXECUTABLE=/usr/local/bin/grafana-server
CONFIG=./conf/grafana.ini
HOMEPATH=/usr/local/share/grafana
LOGPATH=./logs
DATAPATH=./data
PLUGINPATH=./plugins

case "$1" in
start)
  $EXECUTABLE --config=$CONFIG --pidfile=$LOGPATH/grafana.pid --homepath=$HOMEPATH cfg:default.paths.logs=$LOGPATH cfg:default.paths.data=$DATAPATH cfg:default.paths.plugins=$PLUGINPATH 2> /dev/null &
  [ $? -eq 0 ] && echo "$DAEMON started"
;;
stop)
  killall $DAEMON
  [ $? -eq 0 ] && echo "$DAEMON stopped"
;;
restart)
  $0 stop
  $0 start
;;
*)
  echo "Usage: $0 (start|stop|restart)"
;;
esac