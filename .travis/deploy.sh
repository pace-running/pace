#!/bin/bash

set -e # Abort script at first error
set -u # Disallow unset variables



# Only run when not part of a pull request and on the master branch
if [ $TRAVIS_BRANCH = "master" ]
then

  curl -s "https://raw.githubusercontent.com/kubernetes-sigs/kustomize/master/hack/install_kustomize.sh"  | bash
  curl -LO https://storage.googleapis.com/kubernetes-release/release/`curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt`/bin/linux/amd64/kubectl
  chmod 755 ./kubectl
  export PATH=$PWD:$PATH
  export KUBECONFIG=$(pwd)/.travis/kubeconfig 

  docker login -u="$DOCKER_USERNAME" -p="$DOCKER_PASSWORD"
  docker tag pace_pace-app pacerunning/pace-app:latest
  docker tag pace_pace-app pacerunning/pace-app:$TRAVIS_COMMIT
  docker push pacerunning/pace-app
  docker tag pace_pace-pdf pacerunning/pace-pdf:latest
  docker tag pace_pace-pdf pacerunning/pace-pdf:$TRAVIS_COMMIT
  docker push pacerunning/pace-pdf
  cd kustomize/base && kustomize edit set image "pacerunning/pace-app=pacerunning/pace-app:$TRAVIS_COMMIT" 
  cd .. && kubectl --token $KUBE_TOKEN apply --namespace dev -k overlays/dev   
fi
