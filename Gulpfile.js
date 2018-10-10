/* jshint node: true */
'use strict';


const gulp = require('gulp');
const jasmine = require('gulp-jasmine');
const jshint = require('gulp-jshint');
const shell = require('gulp-shell');
const argv = require('yargs').argv;
const Q = require('q');
const fs = require('fs');

function runTests(allFilesPatterns) {
  if (argv.singleT) {
    return gulp.src([argv.singleT]).pipe(jasmine({verbose: true}));
  } else {
    return gulp.src(allFilesPatterns).pipe(jasmine({verbose: true}));
  }
}

gulp.task('test', () => {
  return runTests(['spec/**/*.js', '!spec/**/*IT*.js', '!spec/**/*Journey.js', '!spec/journey/*.js'])
});

gulp.task('test-integration', () => {
  return runTests('spec/**/*IT*.js')
});

gulp.task('test-api', () => {
  return runTests('spec/apiJourney.js')
});

gulp.task('test-functional', (done) => {
  shell.task('npx cypress run --config video=false')(done)
})

gulp.task('create-version-sha', (done) => {
  const sha = process.env.TRAVIS_COMMIT || "local-dev";
  fs.writeFile('version.sha',JSON.stringify({sha}), () => {
    console.log(`File with version: ${sha} written`);
    done();
  });
});

gulp.task('create-pace-db', (done) => {
  if (argv.ci) {
    shell.task('npx db-migrate -e ci up')(done);
  } else {
    shell.task('npx db-migrate up')(done);
  }
});

gulp.task('lint', () => {
  return gulp.src(['app.js', './spec/**/*.js', './service/**/*.js', './routes/**/*.js', './domain/**/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter(require("jshint-stylish")))
    .pipe(jshint.reporter('fail'));
});

gulp.task('default', shell.task(["npm start"]));

gulp.task('start-db', shell.task(["docker run -p 5432:5432 -d --name 'pace-postgres' -e POSTGRES_PASSWORD='pgtester' -e POSTGRES_DB='pace' -e POSTGRES_USER='pgtester' postgres:alpine"]));

