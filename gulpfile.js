'use strict';

var gulp = require('gulp');
var gulpif = require('gulp-if');
var plumber = require('gulp-plumber');
var stylish = require('jshint-stylish');
var jscs = require('gulp-jscs');
var jshint = require('gulp-jshint');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');

var env = process.env.NODE_ENV;
var distFolder = 'dist';
var isProduction = (env === 'production') ? true : false;
var jsFiles = [
  'src/**/*.js',
  '!src/lib/**/*.js'
];

gulp.task('uglify', function() {
  return gulp.src('src/*.js')
    .pipe(plumber())
    .pipe(gulp.dest(distFolder))
    .pipe(gulpif(isProduction, uglify({
      mangle: false,
      compress: {
        drop_console: true,
        global_defs: {
          DEBUG: false
        }
      }
    })))
    .pipe(rename({extname: '.min.js'}))
    .pipe(gulp.dest(distFolder));
});

gulp.task('lint', function() {
  var lintFiles = jsFiles.concat('gulpfile.js');
  return gulp.src(lintFiles)
    .pipe(plumber())
    .pipe(jscs())
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});

gulp.task('watch', function() {
  gulp.watch(jsFiles, ['lint', 'build']);
});

gulp.task('build', ['lint', 'uglify']);
gulp.task('default', ['lint', 'build', 'watch']);
