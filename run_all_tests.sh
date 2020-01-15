#!/bin/sh

set -e

GULP='npx gulp'

$GULP lint
$GULP test
$GULP test-integration
npx cypress install
$GULP test-functional
cd pace-pdf/
$GULP test
$GULP test-integration
