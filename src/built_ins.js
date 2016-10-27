///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////

// First, checks if it isn't implemented yet.
if (!"".format) {
	String.prototype.format = function() {
		var args = arguments;
		return this.replace(/{(\d+)}/g, function(match, id) {
			return typeof args[id] != 'undefined' ? args[id] : match;
		});
	};
}

if(!"".fixSlashes) {
	String.prototype.fixSlashes = function() {
		return this.replace(/\\/g, '/');
	};
}

if(!"".endsWith) {
	String.prototype.endsWith = function(suffix) {
		return this.indexOf(suffix, this.length - suffix.length) !== -1;
	};
}

if(!"".mustEndWith) {
	String.prototype.mustEndWith = function(suffix) {
		if(this.endsWith(suffix)) return this;
		return this + suffix;
	};
}

if(!"".contains) {
	String.prototype.contains = function(str) {
		return this.indexOf(str)>-1;
	};
}

if(![].remove) {
	Array.prototype.remove = function(item) {
		var id = this.indexOf(item);
		if(id==-1) return null;
		this.splice(id, 1);
		return item;
	};
}