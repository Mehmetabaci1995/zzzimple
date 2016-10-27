/**
 * Created by Chamberlain on 21/10/2016.
 */
window.addEventListener('load', function() {
	TweenMax.from('#title', 1.0, {alpha: 0, y: "-=10", ease: Cubic.easeOut});

	ZZZ.host = window.location.host;
	ZZZ.ws = new WS();
	
	ZZZ.$frame = $("#myFrame");
	ZZZ.$frame.attr("src", "http://"+ZZZ.host+"/project");
});