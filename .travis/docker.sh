#!/bin/bash

set -e # Abort script at first error
set -u # Disallow unset variables


docker login -u="$DOCKER_USERNAME" -p="$DOCKER_PASSWORD"
docker tag pace_pace-app pacerunning/pace-app:latest
docker tag pace_pace-app pacerunning/pace-app:$TRAVIS_COMMIT
docker push pacerunning/pace-app
docker tag pace_pace-pdf pacerunning/pace-pdf:latest
docker tag pace_pace-pdf pacerunning/pace-pdf:$TRAVIS_COMMIT
docker push pacerunning/pace-pdf
