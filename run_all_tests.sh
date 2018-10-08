#!/bin/sh

set -e

gulp test
gulp test-integration
npm run cypress
cd pace-pdf/
gulp test
gulp test-integration
