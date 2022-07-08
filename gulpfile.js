const { src, dest, parallel, series, watch } = require('gulp'); // npm i gulp --save
const sass = require('gulp-sass')(require('sass')); // npm i gulp-sass –save + npm i sass --save

// Plugin for formatting pretty:true [npm i gulp-pug --save]
const pug = require('gulp-pug');

// Plugin for cleaing the build folder before the new build [npm i gulp-rimraf]
const rimraf = require('rimraf');

// Plugin for minification js files [npm i gulp-uglify-es --save]
const uglify = require('gulp-uglify-es').default;

// Plugin for adding prefixes to css styles for better cross-browser display [npm i gulp-autoprefixer --save]
const autoprefixer = require('gulp-autoprefixer');

// Plugin for CSS minification [npm i gulp-cssmin --save]
const cssmin = require('gulp-cssmin');

// Plugin for caching the pictures so they are shown faster and the work is optimized [npm i gulp-cache --save]
const cache = require('gulp-cache');

// Plugin kind of live-server - MUSTHAVE [npm i browser-sync --save]
const browserSync = require('browser-sync').create();

// Plugin for old versions of browser to render new versions of js-code correctly [npm install gulp-babel --save]
const babel = require('gulp-babel');

// Plugin for images minification [npm i gulp-imagemin --save]
const imagemin = require('gulp-imagemin'); // ! not working

// Plugin for png minification [npm install imagemin-pngquant --save]
const pngquant = require('imagemin-pngquant');

// The path (location) for main development files (FROM)
const srcPath = 'src';
// The path for production files - should be created auto (WHERE TO)
const destPath = 'build';

const log = (error) => {
  console.log(
    [
      '',
      'Your ERROR message: ',
      '[' + error.name + ' in ' + error.plugin + ']',
      error.message,
      ':(',
      '',
    ].join('\n')
  );
  this.end();
};

// pug watching f to re-build pug to html
const html = () => {
  return src(`${srcPath}/dev/*.pug`)
    .pipe(pug({ pretty: true }))
    .on('error', log)
    .pipe(dest(`${destPath}/`))
    .pipe(browserSync.stream());
};

// scss watching f to re-build sccs to css
const css = () => {
  return (
    src(`${srcPath}/scss/index.scss`) // we mention here which MAIN scss file to watch
      // return src(`${srcPath}/scss/*.scss`) // it will watch ALL scss files in the scss folder - not recommended
      .pipe(
        sass().on('error', function (error) {
          console.log(error);
        })
      )
      .pipe(sass().on('error', sass.logError))
      .pipe(
        autoprefixer({
          overrideBrowserslist: ['> 1%', 'ie 11'],
        })
      )
      .pipe(cssmin())
      .pipe(dest(destPath))
      .pipe(browserSync.stream())
  );
};

const js = () => {
  return src(`${srcPath}/js/index.js`, { sourcemaps: true }) // script.js ?
    .pipe(
      babel({
        presets: [
          [
            '@babel/preset-env',
            {
              targets: '> 1%, not dead',
            },
          ],
        ],
      })
    )
    .pipe(uglify())
    .pipe(dest(`${destPath}/js/`, { sourcemaps: true }))
    .pipe(browserSync.stream());
};

const img = () => {
  return src(`${srcPath}/assets/img/**/*.*`)
    .pipe(
      cache(
        imagemin({
          progressive: true,
          svgoPlugins: [{ removeViewBox: false }],
          use: [pngquant()],
          interlaced: true,
        })
      )
    )
    .pipe(dest(`${destPath}/img/`))
    .pipe(browserSync.stream());
};

const fonts = () => {
  return src(`${srcPath}/fonts/**/*.*`)
    .pipe(dest(`${destPath}/fonts/`))
    .pipe(browserSync.stream());
};

const server = () => {
  browserSync.init({
    server: destPath,

    browser: 'chrome',
    notify: false,
  });
};

// gulp command
const watcher = () => {
  server();
  watch(`${srcPath}/assets/img/**/*.*`, img);
  watch(`${srcPath}/dev/**/*.pug`, html); // watch any level (all levels) and all files
  watch(`${srcPath}/scss/**/*.scss`, css); // watch any level (all levels) and all files
  watch(`${srcPath}/js/**/*.js`, js);
};

const clean = (cb) => {
  return rimraf(destPath, cb);
};

// Commands to start the project. Ex: gulp js, gulp build, gulp (def command = watcher)
exports.js = js; // arthur deleted
exports.css = css;
exports.html = html;
exports.img = img; // arthur deleted
exports.server = server;
exports.build = series(clean, parallel(html, css, js, img, fonts));
exports.default = watcher;
