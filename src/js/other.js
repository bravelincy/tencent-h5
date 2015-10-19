var PAGE_INIT_TIME = Date.now();

function pageScroll(options) {
    var opts = {
        container         : $(options.container),
        direction         : options.direction || 'vertical',
        effect            : options.effect || '',
        start             : options.start || function(){},
        end               : options.end || function(){},
        scrollDuration    : 300,
        springbackDuration: 200
    };
    var touch = null;
    var child = opts.container.children;
    var maxIndex = child.length - 1;
    var onceDistance = opts.direction === 'vertical' ? document.documentElement.clientHeight: document.documentElement.clientWidth;
    var current = {
        index: 0,
        position: 0
    };
    var evts = {
        'touchstart': function (e) {
            e.preventDefault();
            e.stopPropagation();
            //touch被销毁或第一次触摸才响应，否则页面还在动画中不响应
            if (!touch) {
                initTouch(e);
                opts.start.call(child[current.index], current.index);
            }
        },
        'touchmove': function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (touch) {
                touch.distance = e.touches[0].pageY - touch.startY;
                touch.direction = touch.distance < 0 ? 'forward' : 'backward';
                
                if (touch.direction === 'backward' && current.index === 0 || touch.direction === 'forward' && current.index === maxIndex) {
                    initTouch(e);
                } else {
                    setCssText(touch.distance + current.position);
                }
            }
        },
        'touchend': function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (touch && touch.distance) {
                touch.costTime = Date.now() - touch.startTime;
                upliftHandler();
            }

            touch = null;
        }
    };
    //防止在滑动过程中失去焦点导致停止
    evts.touchcancel = evts.touchend;

    bindEvents(evts);

    //初始化touch信息
    function initTouch(e) {
        touch = {
            distance: 0,
            startX: e.touches[0].pageX,
            startY: e.touches[0].pageY,
            startTime: Date.now()
        };
    }

    //滑动后抬起的处理
    function upliftHandler() {
        if (Math.abs(touch.distance) > onceDistance/6) {
            scroll();
        } else {
            springback();
        }
    }

    //翻页
    function scroll() {
        var oldIndex = current.index;

        if (touch.direction === 'forward') {
            current.index += 1;
        } else {
            current.index -= 1;
        }

        current.position = -current.index * onceDistance;
        setCssText(current.position, opts.scrollDuration);
        setTimeout(function () {
            opts.end.apply(child[current.index], [current.index, oldIndex, child[oldIndex]]);
        }, opts.scrollDuration);
    }

    //不满足翻页条件页面回弹
    function springback() {
        setCssText(current.position, opts.springbackDuration);
    }

    function setCssText(position, duration) {
        var prefix  = ['webkit', 'moz', 'o', 'ms'];
        var cssText = [];
        var addText = function (text) {
            for (var i = 0, len = prefix.length; i < len; i++) {
                cssText.push('-' + prefix[i] + '-' + text);
            }
            cssText.push(text);
        };

        if (opts.direction === 'vertical') {
            addText('transform:translate3d(0,' + position +'px,0)');
        } else {
            addText('transform:translate3d(' + position +'px,0,0)');
        }

        duration && addText('transition:' + ['transform', opts.effect, duration + 'ms'].join(' '));
        opts.container.style.cssText = cssText.join(';');
    }

    function bindEvents(events) {
        //TODO:safari出现滚动条
        $('html').addEventListener('touchstart', function(){});
        //页面调整自适应
        window.addEventListener('resize', function () {
            onceDistance = opts.direction === 'vertical' ? document.documentElement.clientHeight: document.documentElement.clientWidth;
            current.position = -current.index * onceDistance;
            setCssText(current.position);
        });
        for (var name in events) {
            if (events.hasOwnProperty(name)) {
                opts.container.addEventListener(name, events[name], false);
            }
        }
    }
}

$.on(window, 'load', function () {
	loadedInit();
	pageScroll({
	    container: '.pages',
	    direction: 'vertical',
	    effect: 'ease',
	    start: function (index) {
	        console.log('start', this, index);
	    },
	    end: function (index, prevIndex, prevPage) {
	        console.log('end', this, index, prevIndex, prevPage);
	        this.classList.add('active');
	        prevPage.classList.remove('active');
	    }
	});

	function loadedInit() {
		var now = Date.now();
		var cost = now - PAGE_INIT_TIME;

		setTimeout(function () {
			$('#loading').style.display = 'none';
			$('.page')[0].classList.add('active');
		}, 999 - cost);
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