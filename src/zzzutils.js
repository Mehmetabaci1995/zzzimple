require('./built_ins'); //Apply String/Number/Array/... extensions.

global.trace = console.log.bind(console);
global.traceClear = function() {
	process.stdout.write('\033c');
};

const ZZZUtils = {};
const process = ZZZUtils.process = global.process;
const spawn = require('child_process').spawn;
const anymatch = ZZZUtils.anymatch = require('anymatch');
const colors = ZZZUtils.colors = require('colors');
const mkdirp  = ZZZUtils.mkdirp = require('mkdirp');
const async = ZZZUtils.async = require('async');
const path = ZZZUtils.path = require('path');
const pad = ZZZUtils.pad = require('pad');
const fs = ZZZUtils.fs = require('fs');
const __ = ZZZUtils.__ = global.__ = require('lodash');

const FILE_ENCODING = {encoding: 'utf8'};

ZZZUtils.isDir = function(path) {
	var stat = fs.statSync(path);
	return stat.isDirectory();
};

ZZZUtils.isDirEmpty = function(fullpath) {
	var files = fs.readdirSync(fullpath);
	return files.length==0;
};

ZZZUtils.fileRead = function(file, cb) {
	if(cb==null) return fs.readFileSync(file, FILE_ENCODING);

	fs.readFile(file, FILE_ENCODING, (err, content) => {
		cb(err, content, file);
	});
};

ZZZUtils.fileWrite = function(file, content, cb) {
	file = file.fixSlashes();
	var dirname = file.substr(0, file.lastIndexOf('/') );
	
	if(cb==null) {
		mkdirp.sync(dirname);
		return fs.writeFileSync(file, content, FILE_ENCODING);
	}
	
	mkdirp(dirname, (err) => {
		if(err) throw err;
		fs.writeFile(file, content, FILE_ENCODING, cb);
	});
};

ZZZUtils.fileExists = function(path){
	try {
		fs.accessSync(path, fs.F_OK);
		return true;
	} catch (e) {
		return false;
	}
};

ZZZUtils.fileDateModified = function(path) {
	return fs.statSync(path).mtime;
};

ZZZUtils.fileFind = function(dir, fileToSearch) {
	if(!fileToSearch) return;
	var found = null, fileToSearchLow = fileToSearch.toLowerCase();

	//var path
	function _readDir(subdir) {
		var files = fs.readdirSync(subdir);

		for(var f=0; f<files.length; f++) {
			if(found) return;

			var file = files[f];
			var fullpath = path.resolve(subdir + '/' + file);
			if(ZZZUtils.isDir(fullpath)) {
				_readDir(fullpath);
				continue;
			}
			var fileLow = file.toLowerCase();
			if(fileToSearchLow==fileLow) {
				return found = fullpath;
			}
		}
	} _readDir(dir);

	return found;
};

ZZZUtils.checkFilesSum = function(ad, prop, files) {
	if(files.length==0) return false;

	var sum = 0;
	files.forEach(file => {
		sum += (ZZZUtils.fileDateModified(file).getTime() * 0.001) | 0;
	});

	var propSum = '_{0}FilesSum'.format(prop);
	if(!ad[propSum] || ad[propSum]!=sum) {
		ad[propSum] = sum;
		return true;
	}
	return false;
};

ZZZUtils.fileFilter = function(dir, filterFunc) {
	if(!filterFunc) return;
	var found = [];

	function _readDir(subdir) {
		var files = fs.readdirSync(subdir);

		files.forEach(file => {
			var fullpath = path.resolve(subdir + '/' + file).fixSlashes();

			if(ZZZUtils.isDir(fullpath)) {
				_readDir(fullpath);
				return;
			}

			if(filterFunc(file, fullpath)) {
				found.push(fullpath);
			}
		});

	} _readDir(dir);

	return found;
};

ZZZUtils.fileMerge = function(files, withHeaders) {
	var output = [];

	files.forEach( file => {
		if(withHeaders) {
			output.push("/** File merged: " + file + " **/");
		}

		output.push( ZZZUtils.fileRead(file) );
	});

	return output.join('\n\n');
};

ZZZUtils.getDirs = function(rootdir) {
	var files = fs.readdirSync(rootdir);
	var dirs = [];

	files.forEach(file => {
		var fullpath = path.resolve(rootdir + '/' + file);
		if(ZZZUtils.isDir(fullpath)) dirs.push(fullpath.fixSlashes());
	});

	return dirs;
};

ZZZUtils.asyncDir = (dirs, pattern) => {
	if(typeof(dirs)=='string') dirs = [dirs];

	var requiredFiles = [];
	var matcher = anymatch(pattern);

	function _async() {
		var requiredFuncs = requiredFiles.map((file) => require(file));
		async.series(requiredFuncs);
	}

	function _collectFiles() {
		if(dirs.length==0) {
			_async();
			return;
		}

		var dir = dirs.shift();
		fs.readdir(dir, function(err, files) {
			if(err) throw err;
			files = files.filter(matcher).map((file) => dir+'/'+file).sort();

			requiredFiles.push.apply(requiredFiles, files);

			_collectFiles();
		});
	} _collectFiles();
};

ZZZUtils.requireDir = function(dir, result) {
	if(!result) result = {};
	
	var nodeFiles = ZZZUtils.fileFilter(dir, file => file.endsWith('.js'));
	
	nodeFiles.forEach( file => {
		var shortname = file.split('/').pop().replace('.js','');
		result[shortname] = require(file);
	});
	
	return result;
};

ZZZUtils.tryFileContent = function tryFileContent(files, cb) {
	var done=false;
	files.forEach( file => {
		if(done || !ZZZUtils.fileExists(file)) return;

		ZZZUtils.fileRead(file, cb);
		done = true;
	});

	if(done) return;

	cb(new Error("No File Content Found"), null, null);
};

ZZZUtils.mergeRequires = function mergeRequires(files, result) {
	if(!result) result = {};
	var validRequires = files
		.filter((file)=>ZZZUtils.fileExists(file))
		.map((file)=>require(file));
	return __.merge.apply(__, [result].concat(validRequires));
};

ZZZUtils.replaceBrackets = function(arr, ad) {
	if(__.isString(arr)) arr = [arr];

	for(var i=arr.length; --i>=0;) {
		var str = arr[i];

		__.keys(ad).forEach(key => {
			var regex = new RegExp('\\{\\{' + key + '\\}\\}', 'g');
			str = str.replace(regex, ad[key]);
		});

		arr[i] = str;
	}

	return arr;
};

ZZZUtils.jsonTry = function(file, defaultContent) {
	if(!ZZZUtils.fileExists(file)) return defaultContent;
	var jsonStr = ZZZUtils.fileRead(file);
	return JSON.parse(jsonStr);
};

ZZZUtils.jsonWrite = function(file, content, isPretty) {
	if(isPretty==null) isPretty = "  ";
	ZZZUtils.fileWrite(file, JSON.stringify(content, null, isPretty));
};

ZZZUtils.imageminBuffer = function( buffer, quality, options ) {
	const imagemin = require('imagemin');
	const imageminPngquant = require('imagemin-pngquant');
	if(!quality) quality = '65-80';

	options = __.merge(options, {
		plugins: [imageminPngquant({quality: quality})]
	});

	return imagemin.buffer( buffer, options );
};

ZZZUtils.wrapKeysWith = function(obj, prefix, suffix) {
	if(!prefix) prefix = '';
	if(!suffix) suffix = '';

	function recursive(o) {
		var ret = {};

		for(var prop in o) {
			if(!o.hasOwnProperty(prop)) continue;
			var oValue = o[prop];
			switch(typeof(oValue)) {
				case 'object':
					ret[prop] = recursive(oValue);
					break;
				case 'string':
					ret[prop] = prefix + oValue + suffix;
					break;
				default:
					ret[prop] = oValue;
					break;
			}
		}

		return ret;
	}

	return recursive(obj);
};

ZZZUtils.remapKeys = function(obj, cb) {
	var result = {};
	__.keys(obj).forEach(key => {
		result[cb(key)] = obj[key];
	});

	return result;
};

ZZZUtils.exec = function(command, args, callbacks, doTrace) {
	var exe = require('child_process').exec;

	doTrace && trace(command + ":\n  " + args.join(' '));

	exe(command + " " + args.join(' '), (err, out, stderr) => {
		if(err) throw err;
		if(out!='') trace(out);
		if(stderr!='') trace(out);

		callbacks && callbacks();
	});
};

////////////////////////////////////////////////////
////////////////////////////////////////////////////
////////////////////////////////////////////////////

module.exports = ZZZUtils;