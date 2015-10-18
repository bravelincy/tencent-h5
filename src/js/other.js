var PAGE_INIT_TIME = Date.now();

$.on($('html'), 'touchstart', function(){});
$.on(window, 'load', function () {
	var pages = $('.pages');
	var height = pages.offsetHeight;
	var pageAmount = $('.page').length;
	var bottomThreshold = -(pageAmount - 1) * height;
	var touch = null;
	var curIndex = 0;
	var curPos = 0;
	var events = {
		'touchstart': function (e) {
			e.preventDefault();
			e.stopPropagation();

			if (!pages.moveLock) {
				var coords = e.touches[0];
				touch = {
					beginX: coords.pageX,
					beginY: coords.pageY,
					beginT: Date.now()
				}
			}
		},
		'touchmove': function (e) {
			e.preventDefault();
			e.stopPropagation();

			if (touch) {
				var y = e.touches[0].pageY;
				var dis = y - touch.beginY;

				//第一屏不能往上滚，最后一屏不能往下滚
				if ((curPos === 0 && dis > 0) || (curPos === bottomThreshold && dis < 0)) {
					return false;
				} else {
					touch.dis = dis;
					scrollAnimation(curPos + dis);
				}
			}
		},
		'touchend': function (e) {
			e.preventDefault();
			e.stopPropagation();

			var oldIndex = curIndex;

			if (touch && touch.dis) {
				scrollPage(touch.dis, Date.now() - touch.beginT, function(time) {
					setTimeout(function () {
						$('.page')[oldIndex].classList.remove('active');
						$('.page')[curIndex].classList.add('active');
					}, time);
				});
				touch = null;
			}
		}
	};

	loadedInit();
	$.on(window, 'resize', resizePage);
	$.on(pages, 'touchstart', events.touchstart);
	$.on(pages, 'touchmove', events.touchmove);
	$.on(pages, 'touchend', events.touchend);
	$.on(pages, 'touchcancel', events.touchend);

	function loadedInit() {
		var now = Date.now();
		var cost = now - PAGE_INIT_TIME;

		setTimeout(function () {
			$('#loading').style.display = 'none';
			$('.page')[0].classList.add('active');
		}, 999 - cost);
	}

	function scrollPage(dis, cost, callback) {
		var dir = dis > 0 ? 'down' : 'up';
		var time = 300;
		pages.moveLock = true;

		if (Math.abs(dis) > height / 7) {
			var targetPos;
			if (dir === 'up') {
				targetPos = curPos - height;
				curIndex++;
			} else {
				targetPos = curPos + height;
				curIndex--;
			}
			curPos = targetPos;

			callback.call(this, time);
			scrollAnimation(targetPos, time);
		} else {
			scrollAnimation(curPos, time);
		}

		setTimeout(function () {
			pages.moveLock = false;
		}, time);
	}

	function resizePage() {
		height = pages.offsetHeight;
		curPos = -curIndex * height;
		bottomThreshold = -(pageAmount - 1) * height;
		scrollAnimation(curPos);
	}

	function scrollAnimation(target, duration) {
		var styles = [
			'-webkit-transform:translate3d(0,' + target + 'px,0)',
			'transform:translate3d(0,' + target + 'px,0)'
		];

		if (duration) {
			styles = styles.concat([
				'-webkit-transition:transform ' + duration + 'ms',
				'transition:transform ' + duration + 'ms'
			]);
		}

		pages.style.cssText = styles.join(';');
	}

	//查看评语
	(function () {
		var prop = $('.page4 .prop');
		var content = Array.prototype.slice.call($('.remark-list .content p'), 0);

		function ellipsis(elem, limitLine, whitespace) {
			var style = getStyle(elem);
			var lineHeight = parseInt(style.lineHeight);
			var fontSize = parseInt(style.fontSize);
			var isOverflow = function () {
				return elem.clientHeight > lineHeight * limitLine;
			};

			elem.originalText = elem.innerHTML;

			if (isOverflow()) {
				while (isOverflow()) {
					elem.innerHTML = elem.innerHTML.slice(0, -1);
				}

				if (whitespace) {
					var cutSize = parseInt(whitespace) / fontSize;
					elem.innerHTML = elem.innerHTML.slice(0, -cutSize);
				}
				elem.innerHTML = elem.innerHTML.replace(/.{3}$/, '......');
			}
		}

		function getStyle(elem) {
			return window.getComputedStyle(elem, null);
		}


		content.forEach(function (elem) {
			ellipsis(elem, 3, $('.show-all')[0].offsetWidth);
		});

		$.on($('.remark-list'), 'touchend', function (e) {
			var target = e.target;

			if (target.classList.contains('show-all')) {
				var parent = target.parentNode;
				var oldHead = $('.hd', prop);
				var oldContent = $('.content', prop);

				while (parent.tagName !== 'LI') {
					parent = parent.parentNode;
				}

				oldHead.innerHTML = $('.hd', parent).innerHTML;
				oldContent.innerHTML = $('.content p', parent).originalText;
				prop.style.display = 'block';
			}
		});

		$.on($('.page4 .close'), 'touchend', function (e) {
			prop.style.display = 'none';
		});
	})();
});