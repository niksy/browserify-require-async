require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var inject = require('./node_modules/cssify');
var css = "body {\n\tcolor: pink;\n}\n\n.foobar {\n\tbackground: green;\n}\n";
inject(css, undefined, '_1t3bsfb');
module.exports = css;

},{"./node_modules/cssify":2}],2:[function(require,module,exports){
'use strict'

function injectStyleTag (document, fileName, cb) {
  var style = document.getElementById(fileName)

  if (style) {
    cb(style)
  } else {
    var head = document.getElementsByTagName('head')[0]

    style = document.createElement('style')
    if (fileName != null) style.id = fileName
    cb(style)
    head.appendChild(style)
  }

  return style
}

module.exports = function (css, customDocument, fileName) {
  var doc = customDocument || document
  /* istanbul ignore if: not supported by Electron */
  if (doc.createStyleSheet) {
    var sheet = doc.createStyleSheet()
    sheet.cssText = css
    return sheet.ownerNode
  } else {
    return injectStyleTag(doc, fileName, function (style) {
      /* istanbul ignore if: not supported by Electron */
      if (style.styleSheet) {
        style.styleSheet.cssText = css
      } else {
        style.innerHTML = css
      }
    })
  }
}

module.exports.byUrl = function (url) {
  /* istanbul ignore if: not supported by Electron */
  if (document.createStyleSheet) {
    return document.createStyleSheet(url).ownerNode
  } else {
    var head = document.getElementsByTagName('head')[0]
    var link = document.createElement('link')

    link.rel = 'stylesheet'
    link.href = url

    head.appendChild(link)
    return link
  }
}

},{}],"jquery":[function(require,module,exports){
var css = require('./index1.css');

require('browserify-require-async/loader')(require)([{"name":"underscore","hash":"40dc88361b","url":"17f9714fe6.js","__requireAsync":true}], function () {
	console.log(1);
	require('browserify-require-async/loader')(require)([{"name":"plugin","hash":"56daded895","url":"8e269ab1b2.js","__requireAsync":true}], function () {
		console.log(2);
	});
});

module.exports = 'a';

},{"./index1.css":1,"browserify-require-async/loader":"browserify-require-async/loader"}]},{},[]);
