#!/bin/bash

# Start the MySQL service
service mysql start

# Start the Redis service
service redis-server start

mysql -e "CREATE USER 'eos'@'localhost' IDENTIFIED BY 'admin123'; GRANT ALL PRIVILEGES ON *.* TO 'eos'@'localhost'; CREATE DATABASE eos;"

yarn typeorm:run
# pm2 start "yarn console crawler" --name "crawler"
# node dist/main.js
yarn start:dev