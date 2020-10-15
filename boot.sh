#!/bin/bash
set -e

printf "creating network --->\n"
docker network create blog-app-network;
printf "network created --->\n"

printf "\n"

printf "starting db container --->\n"
docker container run \
    --detach \
    --name=db \
    --env MONGO_INITDB_ROOT_USERNAME=$MONGO_USERNAME \
    --env MONGO_INITDB_ROOT_PASSWORD=$MONGO_PASSWORD \
    --network=blog-app-network \
    mongo:4.1.8-xenial;
printf "db container started --->\n"

printf "\n"

printf "creating app image --->\n"
docker image build . --tag blog-app;
printf "app image created --->\n"
printf "starting app container --->\n"
docker container run \
    --detach \
    --name=blog-app \
    --env-file .env \
    --publish=3000:3000 \
    --network=blog-app-network \
    blog-app;
printf "app container started --->\n"

printf "\n"

printf "all containers are up and running"