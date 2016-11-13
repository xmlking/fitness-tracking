#!/usr/bin/env bash
nohup influxd -pidfile logs/influxdb.pid -config conf/influxdb.conf > /dev/null  2>logs/influxdb.log &