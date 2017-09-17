#!/bin/bash

echo "Unblocking access for IP: ${BASH_ARGV[0]}"
iptables -t mangle -I chain -s ${BASH_ARGV[0]} -j RETURN
