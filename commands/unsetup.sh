#!/bin/bash

iptables -t mangle -D FORWARD -i wlp5s0 -m mark --mark 99 -j DROP # This will drop traffic that is marked, preventing clients from accessing the internet
iptables -t mangle -D FORWARD -m state --state ESTABLISHED,RELATED -j ACCEPT # standard rule to accept established connections

iptables -t nat -D PREROUTING -p tcp --dport 80 -m mark --mark 99 -j REDIRECT -d 127.0.0.1 --to-port 1337  # ip o

iptables -t mangle -D INPUT -i wlp5s0 -j chain
iptables -t mangle -D INPUT -i wlp5s0 -d 23.228.67.85,104.128.226.60,192.3.61.243,50.3.87.123 -j ACCEPT

iptables -t mangle -F chain
iptables -t mangle -X chain
