#!/bin/sh

set -e

gulp test
gulp test-integration
gulp test-api
npm run cypress
cd pace-pdf/
gulp test
gulp test-integration
