var gulp        = require('gulp');
var browserSync = require('browser-sync');
var sass        = require('gulp-sass');
var jade        = require('gulp-jade');
var bourbon     = require("node-bourbon").includePaths;
var useref      = require('gulp-useref');
var uglify      = require('gulp-uglify');
var gulpIf      = require('gulp-if');
var cssnano     = require('gulp-cssnano');
var imagemin    = require('gulp-imagemin');
var cache       = require('gulp-cache');
var del         = require('del');
var runSequence = require('run-sequence');
var autoprefixer = require('gulp-autoprefixer');


var reload      = browserSync.reload;

var paths = {
    app: "./app/",
    bower: "./bower_components/",
    lib: "./app/lib/"
};

// Task to copy bower_components
gulp.task("copy", function () {
    var bower = {
        "skeleton": "skeleton/**/*.css",
        "font-awesome": "font-awesome/**/*.{css,eot,svg,ttf,woff,woff2,otf}"
    }
    for (var destinationDir in bower) {
        gulp.src(paths.bower + bower[destinationDir])
          .pipe(gulp.dest(paths.lib + destinationDir));
    }
});

// Compile jade files into HTML
gulp.task('jade', function() {
    var YOUR_LOCALS = {};
    return gulp.src('./app/jade/**/*.jade')
        .pipe(jade({
            locals: YOUR_LOCALS,
            pretty: true
        }))
        .pipe(gulp.dest('./app/'))
});

// Separate task for the reaction to `.jade` files
gulp.task('jade-watch', ['jade'], reload);

// Sass task for live injecting into all browsers
gulp.task('sass', function () {
    return gulp.src('./app/scss/*.sass')
        .pipe(sass({
        includePaths: bourbon}))
        .pipe(autoprefixer({
          browsers: ['last 2 versions'],
          cascade: false
        }))
        .pipe(gulp.dest('./app/css'))
        .pipe(reload({stream: true}));
});

// Minifies user references in html for js and css
gulp.task('useref', function(){
  return gulp.src('./app/*.html')
    .pipe(useref())
    // Minifies only if it's a JavaScript file
    .pipe(gulpIf('*.js', uglify()))
    // Minifies only if it's a CSS file
    .pipe(gulpIf('*.css', cssnano()))
    .pipe(gulp.dest('./dist'))
});

// Optimizing images
gulp.task('images', function(){
  return gulp.src('./app/images/**/*.+(png|jpg|jpeg|gif|svg)')
  // Caching images that ran through imagemin
  .pipe(cache(imagemin({
      interlaced: true
    })))
  .pipe(gulp.dest('./dist/images'))
});

// Copy fonts from app to dist
gulp.task('fonts', function() {
  return gulp.src('./app/fonts/**/*')
  .pipe(gulp.dest('./dist/fonts'))
})

// Copy fonts from font-awesome to app/fonts
gulp.task('font-awesome', function() {
  return gulp.src('./app/lib/font-awesome/fonts/**/*.{eot,svg,ttf,woff,woff2,otf}')
  .pipe(gulp.dest('./app/fonts'))
})

// Clean dist
gulp.task('clean:dist', function() {
  return del.sync('./dist');
})

// Copy html
gulp.task('html', function(){
  return gulp.src("./app/*.html")
  .pipe(gulp.dest('./dist'))
})

// Build Task
gulp.task('build', function (callback) {
  runSequence('clean:dist', 'copy', 'font-awesome' , ['sass', 'jade'],
    ['useref', 'images', 'fonts'],
    callback
  )
})

//Task to serve dist for final test
gulp.task('serve:dist', function (callback) {
  browserSync({server: './dist/'});
})

// Serve and watch the scss/jade files for changes
gulp.task('default', ['sass', 'jade'], function () {
    browserSync({server: './app/'});
    gulp.watch('./app/scss/**/*.sass', ['sass']);
    gulp.watch('./app/jade/**/*.jade', ['jade-watch']);
});

// Created from examples in https://css-tricks.com/gulp-for-beginners/
