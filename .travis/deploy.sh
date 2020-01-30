#!/bin/bash

set -e # Abort script at first error
set -u # Disallow unset variables

DEPLOY_ENV=${1:-dev}


curl -LO https://storage.googleapis.com/kubernetes-release/release/`curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt`/bin/linux/amd64/kubectl
chmod 755 ./kubectl
export PATH=$PWD:$PWD/.travis/:$PATH
export KUBECONFIG=$(pwd)/.travis/kubeconfig 

case $DEPLOY_ENV in 
  dev)
    echo "DATABASE_URL=$DATABASE_URL_DEV" > k8s/base/secrets.env;;
  prod)
    echo "DATABASE_URL=$DATABASE_URL_PROD" > k8s/base/secrets.env;;
esac

echo "REDIS_URL=$REDIS_URL" >> k8s/base/secrets.env
echo "ADMIN_PASSWORD=$ADMIN_PASSWORD" >> k8s/base/secrets.env
echo "ADMIN_TOKEN=$ADMIN_TOKEN" >> k8s/base/secrets.env
echo "COOKIE_SECRET=$COOKIE_SECRET" >> k8s/base/secrets.env
echo "MAILSERVER_URL=$MAILSERVER_URL" >> k8s/base/secrets.env

cd k8s/base && kustomize edit set image "pacerunning/pace-app=pacerunning/pace-app:$TRAVIS_COMMIT" 
cd .. && kustomize build overlays/$DEPLOY_ENV | kubectl --token $KUBE_TOKEN apply --namespace $DEPLOY_ENV -f - 
kubectl --token $KUBE_TOKEN rollout status deployment $DEPLOY_ENV-pace-app-deployment --timeout=30s -w  --namespace $DEPLOY_ENV
