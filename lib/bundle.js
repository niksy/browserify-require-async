var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var hasha = require('hasha');
var isRelativePath = require('is-relative-path');
var browserify = require('browserify');
var mkdirp = require('mkdirp');
var isStream = require('is-stream');

function hasher ( str ) {
	return hasha(str, { algorithm: 'md5' }).slice(0, 10);
}

function Bundle ( opts ) {

	var file = opts.file;

	this.expose = opts.expose;
	this.config = opts.config || {};

	this.inputDir = path.dirname(file);
	this.inputFile = path.basename(file);
	this.input = path.join(this.inputDir, this.inputFile);

	this.outputDir = path.resolve(process.cwd(), this.config.outputDir);
	this.outputFile = this.getOutputFile();
	this.output = path.join(this.outputDir, this.outputFile);

	this.hash = hasher(this.input);

}

_.extend(Bundle.prototype, {

	getOutputFile: function () {
		var file = this.input;
		var modified = fs.statSync(file).mtime.getTime();
		var ext = '.js';
		var hash = hasher(modified + file);
		if ( this.config.setOutputFile ) {
			return this.config.setOutputFile(path.basename(file), hash);
		}
		return hash + ext;
	},

	create: function () {

		var hash = this.hash;
		var expose = this.expose;
		var outputDir = this.outputDir;
		var outputFile = this.outputFile;
		var b = browserify(_.pick(this.config._flags, 'debug'));

		this.b = this.config.setup ?
			this.config.setup(b, {
				inputDir: this.inputDir,
				inputFile: this.inputFile,
				outputDir: outputDir,
				outputFile: outputFile
			}) : b;

		if ( isRelativePath(expose) ) {
			expose = hash;
		}

		this.b.require(this.input, { expose: expose });

	},

	write: function () {

		var b = this.b;
		var outputDir = this.outputDir;
		var outputFile = this.outputFile;
		var bundle;

		if ( !this.b ) {
			throw new Error('Bundle instance is not created.');
		}

		if ( this.config.bundle ) {
			bundle = this.config.bundle(b, {
				inputDir: this.inputDir,
				inputFile: this.inputFile,
				outputDir: outputDir,
				outputFile: outputFile
			});
			if ( !isStream(bundle) ) {
				return;
			}
		} else {
			bundle = b.bundle();
		}

		mkdirp(outputDir, function ( err ) {
			if ( err ) {
				throw new Error(err);
			}
			bundle.pipe(fs.createWriteStream(path.join(outputDir, outputFile)));
		});

	},

	getConfig: function () {

		return {
			name: this.expose,
			hash: this.hash,
			url: this.outputFile,
			__requireAsync: true
		};

	}

});

module.exports = Bundle;
