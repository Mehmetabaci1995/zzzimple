/**
 * Created by Chamberlain on 21/10/2016.
 */
var sockets, app;

module.exports = {
	init() {
		require('express-ws')(app = ZZZ.app);
		sockets = this.sockets = [];
		
		function sendAll(msg) {
			sockets.forEach(ws => ws.send(msg));
		}

		function sendOthers(wsSender, msg) {
			sockets.forEach(ws => {
				if(ws==wsSender) return;
				ws.send(msg);
			});
		}

		app.ws('/socket', (ws, req) => {
			sockets.push(ws);

			ws.on('message', (msg) => {
				ws.send(msg); ///////// SEND
			});

			ws.on('close', () => {
				sockets.remove(ws); ////// CLOSE / DISCONNECTED

				sendAll('Closed connection. Down to: ' + sockets.length);
			});
			
			/////////////////////// SEND 1st MESSAGE (to all?)
			sendAll('New Connection Everybody: ' + sockets.length);
		});
	}
};