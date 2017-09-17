#!/bin/bash

echo "Blocking access for IP: ${BASH_ARGV[0]}"
iptables -t mangle -D chain -s ${BASH_ARGV[0]} -j RETURN
