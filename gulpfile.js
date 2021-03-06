// Define all gulp variables witch is needed
var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var autoPrefixer = require('gulp-autoprefixer');
var clean = require('gulp-clean');
var concat = require('gulp-concat');
var browserify = require('gulp-browserify');
var merge = require('merge-stream');
var newer = require('gulp-newer');
var imagemin = require('gulp-imagemin');
var injectPartials = require('gulp-inject-partials');
var minify = require('gulp-minify');
var rename = require('gulp-rename');
var cssmin = require('gulp-cssmin');
var htmlmin = require('gulp-htmlmin');

// Object for source folder paths
var SOURCEPATHS = {
    sassSource: 'src/scss/*.scss',
    htmlSource: 'src/*.html',
    htmlPartialSourse: 'src/partial/*.html',
    jsSource: 'src/js/**',
    imgSource: 'src/img/**'
};

// Object for app folder paths
var APPPATH = {
    root: 'app/',
    css: 'app/css',
    js: 'app/js',
    fonts: 'app/fonts',
    img: 'app/img'
};

// Creating all tesk we need here 

// Task for cleaning html files - If html file is deleted form src folder it will deleted for app folder too.
gulp.task('clean-html', function() {
    return gulp.src(APPPATH.root + '/*.html', { read: false, force: true })
        .pipe(clean());
});
// Task for cleaning js files - If html file is deleted form src folder it will deleted for app folder too.
gulp.task('clean-scripts', function() {
    return gulp.src(APPPATH.js + '/*.js', { read: false, force: true })
        .pipe(clean());
});

// 1. Gulp sass - This task is for compile scss files to css files
gulp.task('sass', function() {
    var bootstrapCSS = gulp.src('./node_modules/bootstrap/dist/css/bootstrap.css');
    var sassFiles;
    sassFiles = gulp.src(SOURCEPATHS.sassSource)
        .pipe(autoPrefixer())
        .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError));
    return merge(bootstrapCSS, sassFiles)
        .pipe(concat('app.css'))
        .pipe(gulp.dest(APPPATH.css));
});

// 2. Task for minification of images useing in project
gulp.task('images', function() {
    gulp.src(SOURCEPATHS.imgSource)
        .pipe(newer(APPPATH.img))
        .pipe(imagemin())
        .pipe(gulp.dest(APPPATH.img));
});

// 3. Moving bootstrap fonts from bootstrap to app folder
gulp.task('moveFonts', function() {
    gulp.src('./node_modules/bootstrap/fonts/*.{eot,svg,ttf,woff,woff2}')
        .pipe(gulp.dest(APPPATH.fonts));
});

// 4. Copy task - this task is for creating copies of html files form srs folder to app folder.
gulp.task('scripts', ['clean-scripts'], function() {
    gulp.src(SOURCEPATHS.jsSource)
        .pipe(concat('main.js'))
        .pipe(browserify())
        .pipe(gulp.dest(APPPATH.js));
});

/*----- Production task -----*/

// minify java script files
gulp.task('compress', function() {
    gulp.src(SOURCEPATHS.jsSource)
        .pipe(concat('main.js'))
        .pipe(minify())
        .pipe(gulp.dest(APPPATH.js));
});

//minify css files
gulp.task('compresscss', function() {
    var bootstrapCSS = gulp.src('./node_modules/bootstrap/dist/css/bootstrap.css');
    var sassFiles;
    sassFiles = gulp.src(SOURCEPATHS.sassSource)
        .pipe(autoPrefixer())
        .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError));
    return merge(bootstrapCSS, sassFiles)
        .pipe(concat('app.css'))
        .pipe(cssmin())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(APPPATH.css));
});

// minify html files
gulp.task('minifyHtml', function() {
    return gulp.src(SOURCEPATHS.htmlSource)
        .pipe(injectPartials())
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest(APPPATH.root));
});

/*----- end of production task -----*/

// 5. This task allows two things - to create modules of html files (header.html;footer.html;navigation.html), and creating copies of html files form src folder to app folder.
gulp.task('html', function() {
    return gulp.src(SOURCEPATHS.htmlSource)
        .pipe(injectPartials())
        .pipe(gulp.dest(APPPATH.root));
});

// 6. Copy task - this task is for creating copies of html files form src folder to app folder.
// gulp.task('copy', ['clean-html'], function() {
//     gulp.src(SOURCEPATHS.htmlSource)
//         .pipe(gulp.dest(APPPATH.root));
// });

// 7. Browser sync task - this task is for automaticly update all changes in css, html and js files. Also create a localhost path and automaticly added in browser.
gulp.task('serve', ['sass'], function() {
    browserSync.init([APPPATH.css + '/*.css', APPPATH.root + '/*.html', APPPATH.js + '/*.js'], {
        server: {
            baseDir: APPPATH.root
        }
    });
});

// 8. Gulp watch task - this task is for looking if there any changes in scss or js files of html files. If there are the watch task automaticly updated and refreshed in browser.
gulp.task('watch', ['serve', 'sass', 'clean-html', 'clean-scripts', 'scripts', 'moveFonts', 'images', 'html'], function() {
    gulp.watch([SOURCEPATHS.sassSource], ['sass']);
    // gulp.watch([SOURCEPATHS.htmlSource], ['copy']);
    gulp.watch([SOURCEPATHS.jsSource], ['scripts']);
    gulp.watch([SOURCEPATHS.htmlSource, SOURCEPATHS.htmlPartialSourse], ['html']);
});

// N. Gulp default task
gulp.task('default', ['watch']);

// N. Gulp production task - when all site is ready this task compress all files - html, css and js.
gulp.task('production', ['minifyHtml', 'compresscss', 'compress']);
