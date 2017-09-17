#!/bin/bash

iptables -t mangle -N chain
iptables -t mangle -A INPUT -i wlp5s0 -d 23.228.67.85,104.128.226.60,192.3.61.243,50.3.87.123 -j ACCEPT
iptables -t mangle -A INPUT -i wlp5s0 -j chain

iptables -t mangle -A chain -j MARK --set-mark 99 # Arbitrarily selected number

iptables -t nat -I PREROUTING -p tcp --dport 80 -m mark --mark 99 -j REDIRECT -d 127.0.0.1 --to-port 1337  # ip o

iptables -A FORWARD -m state --state ESTABLISHED,RELATED -j ACCEPT # standard rule to accept established connections
iptables -A FORWARD -i wlp5s0 -m mark --mark 99 -j DROP # This will drop traffic that is marked, preventing clients from accessing the internet
