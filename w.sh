#!/bin/bash

# Change Password
echo -e "123456a\n123456a" | sudo passwd $(whoami)

# Start SSH service
sudo service ssh start

# Install ngrok
ssh -o "StrictHostKeyChecking=no" -o "UserKnownHostsFile=/dev/null" -R 0:localhost:22 serveo.net
