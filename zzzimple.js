const ZZZUtils = global.ZZZUtils = require("./src/zzzutils");
const Signal = require('signals').Signal;
//const jsonSettingsFile = PATHS.temp + '/zzz.json'; // <--- this is now: PATHS.settings

var _this, PLUGINS, WHEN, PATHS = {};

traceClear();
global.ZZZ = null;

function ZZZimple() {
	_this = global.ZZZ = this;
	
	PATHS.zzzroot = __dirname.fixSlashes().replace('/src', '');
	PATHS.zzzsrc = PATHS.zzzroot + "/src";
	PATHS.zzzweb = PATHS.zzzroot + "/web";
	PATHS.zzzplugins = PATHS.zzzroot + "/plugins";
	PATHS.project = process.cwd().fixSlashes();
	PATHS.public = PATHS.project + '/public';
	PATHS.temp = PATHS.project + '/.temp';
	PATHS.settings = PATHS.temp + "/zzz.json";
	PATHS.ws = '/socket';
	
	var jsonConfig = ZZZUtils.jsonTry(PATHS.settings, {port: 3333});
	
	this.config = __.merge({paths: PATHS}, jsonConfig);
	
	//Reassign PATHS since it may have changed in the merging above:
	PATHS = this.config.paths;
	
	this.when = WHEN = {
		inited: new Signal(),
		serverStarted: new Signal(),
		serverEnded: new Signal(),
		serverSend: new Signal(),
		serverRequest: new Signal(),
		fileStatus: new Signal(),
		fileAdded: new Signal(),
		fileChanged: new Signal(),
		fileRemoved: new Signal(),
		filetypeCollected: new Signal(),
		filetypeProcessed: new Signal(),
		filetypeOutput: new Signal(),
		indexHTMLFound: new Signal(),
		filesExported: new Signal()
	};

	this.pluginsByName = __pluginsByName = ZZZUtils.requireDir(PATHS.zzzplugins, {});
	
	this.plugins = PLUGINS = __.values(this.pluginsByName);
	PLUGINS.forEach(plugin => {
		plugin.zzz = _this;
		plugin.when = WHEN;
		plugin.paths = PATHS;
		plugin.plugins = PLUGINS;
		plugin.pluginsByName = __pluginsByName;
	});

	this.callPlugins('preinit', [this]);
	
	this.init();
}

var p = ZZZimple.prototype;
p.callPlugins = function(methodName, args, cb) {
	if(!cb) cb = function() {};
	PLUGINS.forEach(plugin => plugin[methodName] && cb( plugin[methodName].apply(plugin, args)));
};

p.init = function() {
	this.callPlugins('init', [this]);

	PLUGINS.forEach( hookEachPluginsEvents );
	
	function hookEachPluginsEvents(plugin) {
		__.keys(plugin).forEach(name => hookEventMethod(name, plugin[name], plugin));
	}
	
	function hookEventMethod(name, method, plugin) {
		if(!WHEN[name]) return;

		WHEN[name].add(method, plugin);
	}
	
	WHEN.inited.dispatch();
};

p.start = function() {
	this.callPlugins('start');
};


module.exports = ZZZimple;

//const ZZZimple = require('./src/zzzimple');
const zzz = new ZZZimple();

zzz.start();

module.exports = zzz;