/**
 * Created by Chamberlain on 17/10/2016.
 */
const express = require('express');
const APP = express();

var _this, PATHS, WHEN;

module.exports = {
	preinit() {
		_this = this;
		ZZZ.app = APP;
		PATHS = this.paths;
		WHEN = this.when;

		/*
		APP.use(function(req, res,next){
			res.on('finish', function(){
				WHEN.serverRequest.dispatch();
				//when.serverSend;
			});
			next();
		});
		
		*/
		
		APP.use(express.static(PATHS.zzzweb));
		
		trace("Serving project on: " + PATHS.public);
		APP.use('/project', express.static(PATHS.public));
	},
	
	start() {
		APP.listen(3333, (err) => {
			if(err) throw err;
			trace('Server started.\nCTRL+C to stop anytime.');

			WHEN.serverStarted.dispatch();
		})
	}
};