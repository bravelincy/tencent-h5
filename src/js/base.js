function $(selector) {
	var elements = document.querySelectorAll(selector);
	return elements.length > 1 ? elements : elements[0]; 
}

$.on = function (element, evtName, fn, useCapture) {
	element.addEventListener(evtName, fn, useCapture);
};