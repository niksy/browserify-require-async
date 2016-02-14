require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"f6e2af6be8":[function(require,module,exports){
module.exports={
  "name": "scriptjs-test",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "build": "node build.js",
    "browserify": "browserify"
  },
  "browser": {
    "browserify-require-async/loader": "./loader.js",
    "nunjucks": "nunjucksify/node_modules/nunjucks/browser/nunjucks-slim",
    "plugin": "./b.js",
    "jquery": "./a.js"
  },
  "author": "Ivan Nikolić <niksy5@gmail.com> (http://ivannikolic.com/)",
  "license": "ISC",
  "devDependencies": {
    "browserify": "^13.0.0",
    "browserify-transform-tools": "^1.5.0",
    "bundle-collapser": "niksy/bundle-collapser#custom-replacements",
    "cssify": "^1.0.2",
    "falafel": "^1.2.0",
    "gulp-uglify": "^1.5.1",
    "is-stream": "^1.0.1",
    "lodash": "^3.10.1",
    "nunjucksify": "^0.2.2",
    "pkg-conf": "^1.0.1",
    "string-to-stream": "^1.0.1",
    "through2": "^2.0.0",
    "underscore": "^1.8.3",
    "vinyl-buffer": "^1.0.0",
    "vinyl-source-stream": "^1.1.0",
    "vinyl-to-stream": "^1.0.1",
    "watchify": "^3.6.1"
  },
  "dependencies": {
    "add-event-listener": "0.0.1",
    "browser-resolve": "^1.11.0",
    "component-event": "^0.1.4",
    "deep-assign": "^2.0.0",
    "dom-on": "^1.0.6",
    "es3ify": "^0.1.4",
    "gulp": "^3.9.1",
    "hasha": "^2.2.0",
    "indexof": "0.0.1",
    "is-relative-path": "^1.0.0",
    "isstream": "^0.1.2",
    "lie": "^3.0.1",
    "little-loader": "^0.1.0",
    "loadjs": "muicss/loadjs",
    "mkdirp": "^0.5.1",
    "object-assign": "^4.0.1",
    "onetime": "^1.1.0",
    "pyrsmk-toast": "^1.2.7",
    "scriptjs": "^2.5.8"
  },
  "browserify-require-async": {
    "url": "http://root.loc/projects/scriptjs-test/out",
    "outputDir": "./out"
  },
  "browserify": {
    "transform": [
      "es3ify",
      "nunjucksify"
    ]
  }
}

},{}]},{},[]);
