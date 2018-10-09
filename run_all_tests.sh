#!/bin/sh

set -e

gulp lint
gulp test
gulp test-integration
npm run cypress
cd pace-pdf/
gulp test
gulp test-integration
