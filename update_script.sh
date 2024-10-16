#!/bin/bash
 

cd /root/workspace/flexdock-dev/api/flexdok-api
git pull origin dev

cd /root/workspace/flexdock-dev

docker compose kill backend 
docker compose up -d --no-deps --build backend