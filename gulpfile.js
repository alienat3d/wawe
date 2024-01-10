const { src, dest, watch, parallel, series } = require('gulp');

const scss = require('gulp-sass')(require('sass')),
  concat = require('gulp-concat'),
  autoprefixer = require('gulp-autoprefixer'),
  uglify = require('gulp-uglify'),
  imagemin = require('gulp-imagemin'),
  del = require('del'),
  browserSync = require('browser-sync').create();

function browsersync() {
  browserSync.init({
    server: {
      baseDir: 'app/',
    },
    notify: false,
  });
}

function styles() {
  return (
    src('app/scss/**/*.scss')
      .pipe(scss({ outputStyle: 'compressed' }))
      .pipe(concat("style.min.css"))
      .pipe(
        autoprefixer({
          overrideBrowserslist: ['last 10 versions'],
          grid: true,
        })
      )
      .pipe(dest('app/css'))
      .pipe(browserSync.stream())
  );
}

function scripts() {
  return src('app/js/main.js')
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('app/js/'))
    .pipe(browserSync.stream());
}

function images() {
  return src('app/images/**/*')
    .pipe(imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.mozjpeg({ quality: 75, progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [
            { removeViewBox: true }, 
            { cleanupIDs: false }
          ],
        }),
      ])
    )
    .pipe(dest('docs/images'));
}

function build() {
  return src([
    'app/**/*.html', 
    'app/css/style.min.css', 
    'app/js/main.min.js',
    'app/favicons/**',
    'app/fonts/**/*'
  ], 
  {
    base: 'app',
  })
    .pipe(dest('docs'));
}

function cleanDocs() {
  return del('docs');
}

function watching() {
  watch(['app/scss/*.scss'], styles);
  watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts);
  watch(['app/**/*.html']).on('change', browserSync.reload);
}

exports.styles = styles;
exports.scripts = scripts;
exports.browsersync = browsersync;
exports.watching = watching;
exports.images = images;
exports.cleanDocs = cleanDocs;

exports.default = parallel(styles, scripts, browsersync, watching);

exports.build = series(cleanDocs, images, build);
