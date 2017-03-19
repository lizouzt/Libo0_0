define(['c/widget/wipe/wipe'], function (wipe) {
    var Slider = function(opts){
        var wipeEL = opts.arrEL,
            wrapperEL = opts.wrapperEL,
            DOMVW = document.documentElement.clientWidth,
            cardCName = opts.cardCName,
            qstr = '.'+cardCName,
            _isDuration = true,
            TRANX = 111,
            TRANZ = -40,
            SCALE = 0.1,
            TRANTPL = 'scale(@{scale}, @{scale}) translate3d(@{tranx}%,0,@{tranz}px)';

        var el_p = el_n = el_t = null;
        var _tLeft = _tRight = false;

        var STYLE_NEXT = '-webkit-transform: scale('+(1-SCALE)+') translate3d('+TRANX+'%, 0, '+TRANZ+'px)',
            STYLE_PREV = '-webkit-transform: scale('+(1-SCALE)+') translate3d(-'+TRANX+'%, 0, '+TRANZ+'px)';

        var cardList = wipeEL.querySelectorAll(qstr);
            el_cur = cardList[opts.activeCardSeq], 
            el_prev = cardList[(cardList.length + (opts.activeCardSeq - 1))% cardList.length] || cardList.slice(-1), 
            el_next = cardList[(cardList.length + (opts.activeCardSeq + 1))% cardList.length] || cardList[0];
        el_cur.classList.add('active');
        el_prev.classList.add('prev-s');
        el_next.classList.add('next-s');
        
        var setExtraProperty = function(){
            el_next.tranx = TRANX, el_next.scale = (1-SCALE);
            el_prev.tranx = -TRANX, el_prev.scale = (1-SCALE);
        },

        setImage = function(el){
            var _img = el.querySelector('img');
            _img.setAttribute('src', _img.dataset['lazyload']);
        },

        render = function(el, tranx, tranz, scale){
            var style = TRANTPL.replace(/\@\{scale\}/gi, scale).replace(/\@\{tranx\}/i, tranx).replace(/\@\{tranz\}/i, tranz);
            el.style.webkitTransform = style;
            return 1;
        },

        render_opacity = function(el, o){
            el.style.opacity = o;
            return 1;
        },

        getFlag = function(x){
            var ret = {t: 1, r: 1, s: 1};
            if(x < 0){
                el_p = el_prev;
                el_n = el_next;

                ret = {t: -1, r: 1, s: -1};
            } else if(x > 0) {
                el_p = el_next;
                el_n = el_prev;
                ret = {t: 1, r: -1, s: 1};
            }

            return ret;
        },
// rotatey
// skewy
        animateHandler = function(args){
            var x = args[0] > 320 ? 320 : args[0];
            var _proto = Math.abs(x) / DOMVW,
                _proto = _proto > 1 ? 1 : _proto;
                tranx = (TRANX * _proto).toFixed(0),
                tranz = (TRANZ * _proto).toFixed(0),
                scale = 1*((SCALE * _proto).toFixed(2));

            flag = getFlag(x);
            _isDuration ? wipeEL.classList.remove('nduring') : wipeEL.classList.add('nduring');
            render(el_cur, tranx*flag.t, tranz, (1-scale));
            if(!!el_p ){
                render_opacity(el_p, (1-_proto));
                render(el_n, (el_n.tranx + tranx*flag.t), TRANZ-tranz, (el_n.scale + scale));
            }
        };

        var init = function(){
            setExtraProperty();
            wipe.init({
                wapperEl: wrapperEL,
                tarEl: wipeEL,
                needTransition: true,
                wipeTransition: function(){
                    _isDuration = false;
                    animateHandler(arguments);
                },
                rollback: function(){
                    _isDuration = true;
                    animateHandler([0]);
                    _tLeft = _tRight = false;
                    el_p = el_n = el_t = null;
                },
                wipeRight: function(obj){
                    wipeEL.classList.remove('nduring')
                    var style_p = '-webkit-transform: scale(1, 1);';
                    el_cur.setAttribute('style', STYLE_NEXT);
                    el_prev.setAttribute('style', style_p);
                    el_cur.className = cardCName+' next-s';
                    el_prev.className = cardCName+' active';
                    el_next.classList.remove('next-s');
                    el_next.style['-webkit-transform'] = '';
                    render_opacity(el_next, 1);
                    
                    var temp = el_cur;
                    el_cur = el_prev;
                    el_next = temp;
                    el_prev = el_prev.previousElementSibling || wipeEL.querySelector(qstr+':last-child');
                    el_prev.classList.add('prev-s');
                    
                    if (!el_prev.tranx) {
                        _prev = el_prev.querySelector('img')
                        _prev.setAttribute('src', _prev.dataset['lazyload']);
                    }

                    setExtraProperty();
                    return obj.dis;
                },
                wipeLeft: function(obj){
                    wipeEL.classList.remove('nduring')
                    var style_n = '-webkit-transform: scale(1, 1);';
                    el_cur.setAttribute('style', STYLE_PREV);
                    el_next.setAttribute('style', style_n);
                    el_cur.className = cardCName+' prev-s';
                    el_next.className = cardCName+' active';
                    el_prev.classList.remove('prev-s');
                    el_prev.style['-webkit-transform'] = '';
                    render_opacity(el_prev, 1);

                    var temp = el_cur;
                    el_cur = el_next;
                    el_prev = temp;
                    el_next = el_next.nextElementSibling || wipeEL.querySelector(qstr+':first-child');
                    el_next.classList.add('next-s');
                    
                    if (!el_next.tranx) {
                        _next = el_next.querySelector('img')
                        _next.setAttribute('src', _next.dataset['lazyload']);
                    }

                    setExtraProperty();
                    return obj.dis;
                }
            });
        };
        init();
    };
    return Slider;
});
