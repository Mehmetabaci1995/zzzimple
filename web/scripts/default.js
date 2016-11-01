/**
 * Created by Chamberlain on 21/10/2016.
 */
window.ZZZ = window.ZZZ || {};

var trace = console.log.bind(console);
var traceClear = console.clear.bind(console);

function extendJQuery() {
	$.fn.extend({
		ajaxReplace: function(url) {
			var _this = this;
			$.ajax({
				url: url,
				success: function(data) {
					_this.html(data);
					//_this
				},
				error: function(err) {
					trace("Error! " + err);
				}
			})
		}
	});
}