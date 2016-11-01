/**
 * Created by Chamberlain on 17/10/2016.
 */
const express = require('express');
const APP = express();
var exphbs  = require('express-handlebars');

var _this, PATHS, WHEN;

module.exports = {
	preinit() {
		_this = this;
		ZZZ.app = APP;
		PATHS = this.paths;
		WHEN = this.when;

		var viewPath = PATHS.zzzweb + "/hbs/";

		var hbs = exphbs.create({
			defaultLayout: 'main',
			extname: '.hbs',
			layoutsDir: viewPath + "layouts/",
			partialsDir: viewPath
		});

		APP.engine('.hbs', hbs.engine);
		APP.set('view engine', '.hbs');
		APP.set('views', viewPath);

		/*	APP.use(function(req, res,next){
			res.on('finish', function(){
				WHEN.serverRequest.dispatch();
				//when.serverSend;
			});
			next();
		});	*/

		//First, serve the local project files
		trace("Serving project on: \"{0}\"".format(PATHS.public).yellow);
		APP.use('/project', express.static(PATHS.public));

		//2nd, attempt to serve ZZZ library's /web/ files.
		//APP.use(express.static(PATHS.zzzweb));

		APP.get('/', (req, res) => {
			res.render('test2', {layout: false});
		});

		ZZZUtils.routes(ZZZ.app, {
			build() {
				trace("Building...");
			},

			toolbar() {
				return "<i>this is the builder toolbar.</i>";
			}
		}, _this);
	},
	
	start() {
		APP.listen(3333, (err) => {
			if(err) throw err;
			trace('Server started.\nCTRL+C to stop anytime.');

			WHEN.serverStarted.dispatch();
		})
	},

	createProject(structure, input) {

	},
};