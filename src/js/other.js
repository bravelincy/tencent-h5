setTimeout(function () {
	var body = $('body');
	body.classList.add('loaded');
}, 1000);

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
				scrollPage(touch.dis, Date.now() - touch.beginT, function(index) {

				});
				touch = null;
			}
		}
	};

	$.on(pages, 'touchstart', events.touchstart);
	$.on(pages, 'touchmove', events.touchmove);
	$.on(pages, 'touchend', events.touchend);
	$.on(pages, 'touchcancel', events.touchend);

	function scrollPage(dis, cost, callback){
		var dir = dis > 0 ? 'down' : 'up';
		var time;
		pages.moveLock = true;

		if (Math.abs(dis) > height / 5 || cost < 100) {
			var targetPos = pages.curPos = (dir === 'up') ? pages.curPos - height : pages.curPos + height;
			var index = Math.abs(pages.curPos / height);
			time = 300;

			callback.call(this, index);
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

		pages.style.cssText = styles.join(';');
	}
})