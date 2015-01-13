(function(){
  var setViewPort = function(){
		var ratio = 1 / window.devicePixelRatio,
		rootSize = document.documentElement.clientWidth / 10,
		meta = document.head.querySelector('[name=viewport]') || function(){
			var el = document.createElement('meta');
			el.name = 'viewport';
			document.head.appendChild(el);
			return el;
		}
		meta.content = "width=device-width,initial-scale={ratio},maximum-scale={ratio},minimum-scale={ratio},user-scalable=no".replace(/\{ratio\}/ig, ratio);
		document.documentElement.style.fontSize = rootSize + 'px';
	};

	var resizeDelay = null;
	window.onresize = function(){
		clearTimeout(resizeDelay);
		resizeDelay = setTimeout(setViewPort, 300)
	};
	setViewPort();
})();
