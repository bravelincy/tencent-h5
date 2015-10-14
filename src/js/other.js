var PAGE_INIT_TIME = Date.now();

$.on($('html'), 'touchstart', function(){});
$.on(window, 'load', function () {
	var pages = $('.pages');
	var height = pages.offsetHeight;
	var bottomThreshold = -($('.page').length - 1) * height;
	var touch = null;
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
				pages.curPos = pages.curPos || 0;
			}
		},
		'touchmove': function (e) {
			e.preventDefault();
			e.stopPropagation();

			if (touch) {
				var y = e.touches[0].pageY;
				var dis = y - touch.beginY;

				//第一屏不能往上滚，最后一屏不能往下滚
				if ((pages.curPos === 0 && dis > 0) || (pages.curPos === bottomThreshold && dis < 0)) {
					return false;
				} else {
					touch.dis = dis;
					pages.style.cssText = '-webkit-transform:translate3d(0,' + (pages.curPos + dis) + 'px,0)';
				}
			}
		},
		'touchend': function (e) {
			e.preventDefault();
			e.stopPropagation();

			if (touch && touch.dis) {
				var index = Math.abs(pages.curPos / height);
				console.log('touchend');
				console.log(touch.dis);
				scrollPage(touch.dis, Date.now() - touch.beginT, function(targetIndex, time) {
					setTimeout(function () {
						$('.page')[index].classList.remove('active');
						$('.page')[targetIndex].classList.add('active');
					}, time);
				});
				touch = null;
			}
		}
	};

	loadedInit();
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
		var time;
		pages.moveLock = true;

		if (Math.abs(dis) > height / 7) {
			var targetPos = pages.curPos = (dir === 'up') ? pages.curPos - height : pages.curPos + height;
			var targetIndex = Math.abs(pages.curPos / height);
			time = 300;

			callback.call(this, targetIndex, time);
			scrollAnimation(targetPos, time);
		} else {
			time = 300;
			scrollAnimation(pages.curPos, time);
		}

		setTimeout(function () {
			pages.moveLock = false;
		}, time);
	}

	function scrollAnimation(target, duration) {
		var styles = [
			'-webkit-transform:translate3d(0,' + target + 'px,0)',
			'transform:translate3d(0,' + target + 'px,0)'
		];

		if (duration) {
			styles = styles.concat([
				'-webkit-transition: all ' + duration + 'ms',
				'transition: all ' + duration + 'ms'
			]);
		}

		console.log(styles.join(';'))

		pages.style.cssText = styles.join(';');
	}

	//查看评语
	(function () {
		var prop = $('.page4 .prop');

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
				oldContent.innerHTML = $('.content', parent).innerHTML;
				prop.style.display = 'block';
			}
		});

		$.on($('.page4 .close'), 'touchend', function (e) {
			prop.style.display = 'none';
		});
	})();
});