(function () {
	var caclFontSize = function () {
		var screenWidth = document.documentElement.offsetWidth;
		var deviceSizeRatio = window.devicePixelRatio;
		var baseWidth = 320;
		var htmlFontSize = (screenWidth / baseWidth) * 10;
		document.documentElement.style.fontSize = htmlFontSize + 'px';
	};

	caclFontSize();
	window.addEventListener('resize', caclFontSize);
})();

function $(selector, parent) {
	var parent = parent || document;
	var elements = parent.querySelectorAll(selector);
	return elements.length > 1 ? elements : elements[0]; 
}

$.on = function (element, evtName, fn, useCapture) {
	element.addEventListener(evtName, fn, useCapture);
};