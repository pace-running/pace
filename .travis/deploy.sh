#!/bin/bash

set -e # Abort script at first error
set -u # Disallow unset variables



# Only run when not part of a pull request and on the master branch
if [ $TRAVIS_BRANCH = "master" ]
then
  set -e
  curl -LO https://storage.googleapis.com/kubernetes-release/release/`curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt`/bin/linux/amd64/kubectl
  chmod 755 ./kubectl
  export PATH=$PWD:$PWD/.travis/:$PATH
  export KUBECONFIG=$(pwd)/.travis/kubeconfig 

  docker login -u="$DOCKER_USERNAME" -p="$DOCKER_PASSWORD"
  docker tag pace_pace-app pacerunning/pace-app:latest
  docker tag pace_pace-app pacerunning/pace-app:$TRAVIS_COMMIT
  docker push pacerunning/pace-app
  docker tag pace_pace-pdf pacerunning/pace-pdf:latest
  docker tag pace_pace-pdf pacerunning/pace-pdf:$TRAVIS_COMMIT
  docker push pacerunning/pace-pdf
  echo "DATABASE_URL=$DATABASE_URL_DEV" > k8s/base/secrets.env
  echo "REDIS_URL=$REDIS_URL" >> k8s/base/secrets.env
  cd k8s/base && kustomize edit set image "pacerunning/pace-app=pacerunning/pace-app:$TRAVIS_COMMIT" 
  cd .. && kustomize build overlays/dev | kubectl --token $KUBE_TOKEN apply --namespace dev -f - 
fi
