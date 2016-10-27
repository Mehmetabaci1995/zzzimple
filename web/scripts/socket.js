/**
 * Created by Chamberlain on 21/10/2016.
 */
window.ZZZ = window.ZZZ || {};

if ("WebSocket" in window) {
	function WS() {
		var ws = this._ws = new WebSocket("ws://"+ZZZ.host+"/socket");

		ws.onopen = function() {
			ws.send("Message to send");
			trace("Message is sent...");
		};

		ws.onmessage = function (evt) {
			var received_msg = evt.data;
			trace("Message is received... " + received_msg);
		};

		ws.onclose = function() {
			trace("Connection is closed...");
		};
	}
} else {
	trace("WebSocket NOT supported by your Browser!");
}