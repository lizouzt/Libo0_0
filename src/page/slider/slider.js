;(function(win,lib){
    var Slider = function(opts){
        var wipeEL = opts.arrEL,
            wrapperEL = opts.wrapperEL,
            DOMVW = document.documentElement.clientWidth,
            cardCName = opts.cardCName,
            qstr = '.'+cardCName,
            _isDuration = true,
            TRANX = 70,
            TRANZ = -40,
            SCALE = 0.1,
            ROTATEY = 65,
            SKEWY = 12,
            TRANTPL = 'scale(@{scale}, @{scale}) translate3d(@{tranx}%,0,@{tranz}px) rotateY(@{rotatey}deg) skewY(@{skewy}deg)';

        var el_p = el_n = el_t = null;
        var _tLeft = _tRight = false;

        var STYLE_NEXT = '-webkit-transform: scale('+(1-SCALE)+') translate3d('+TRANX+'%, 0, '+TRANZ+'px) rotateY(-'+ROTATEY+'deg) skewY('+SKEWY+'deg);',
            STYLE_PREV = '-webkit-transform: scale('+(1-SCALE)+') translate3d(-'+TRANX+'%, 0, '+TRANZ+'px) rotateY('+ROTATEY+'deg) skewY(-'+SKEWY+'deg);';

        var cardList = wipeEL.querySelectorAll(qstr);
            el_cur = cardList[opts.activeCardSeq], 
            el_prev = cardList[opts.activeCardSeq - 1] || cardList.slice(-1), 
            el_next = cardList[opts.activeCardSeq + 1] || cardList[0];
        el_cur.classList.add('active');
        el_prev.classList.add('prev-s');
        el_next.classList.add('next-s');
        
        var setExtraProperty = function(){
            el_next.tranx = TRANX, el_next.scale = (1-SCALE), el_next.rotatey = -ROTATEY, el_next.skewy = SKEWY;
            el_prev.tranx = -TRANX, el_prev.scale = (1-SCALE), el_prev.rotatey = ROTATEY, el_prev.skewy = -SKEWY;
        },

        setImage = function(el){
            var _img = el.querySelector('img');
            _img.setAttribute('src', _img.dataset['lazyload']);
        },

        render = function(el, tranx, tranz, scale, rotatey, skewy){
            var style = TRANTPL.replace(/\@\{scale\}/gi, scale).replace(/\@\{tranx\}/i, tranx).replace(/\@\{tranz\}/i, tranz).replace(/\@\{rotatey\}/i, rotatey).replace(/\@{skewy}/i, skewy);
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
                // if(!_tRight || el_p != el_next){
                //     _tRight = true;
                //     el_t = el_prev.previousElementSibling || wipeEL.querySelector(qstr+':last-child');
                //     setImage(el_t);
                //     el_t.classList.add('prev-hold');
                // }

                el_p = el_next;
                el_n = el_prev;

                ret = {t: 1, r: -1, s: 1};
            }

            return ret;
        },

        animateHandler = function(args){
            var x = args[0] > 320 ? 320 : args[0];
            var _proto = Math.abs(x) / DOMVW,
                _proto = _proto > 1 ? 1 : _proto;
                tranx = (TRANX * _proto).toFixed(0),
                tranz = (TRANZ * _proto).toFixed(0),
                scale = 1*((SCALE * _proto).toFixed(2)),
                rotatey = (ROTATEY * _proto).toFixed(0),
                skewy = _proto * SKEWY;

            flag = getFlag(x);
            _isDuration ? wipeEL.classList.remove('nduring') : wipeEL.classList.add('nduring');
            render(el_cur, tranx*flag.t, tranz, (1-scale), rotatey*flag.r, skewy*flag.s);
            if(!!el_p ){
                render_opacity(el_p, (1-_proto));
                render(el_n, (el_n.tranx + tranx*flag.t), TRANZ-tranz, (el_n.scale + scale), (el_n.rotatey + rotatey*flag.r), el_n.skewy + skewy*flag.s);
            }
        };

        var init = function(){
            var _h = [];
            for (var i=0, j=wipeEL.querySelectorAll(qstr).length; i<j; i+=1) {
                _h.push('<span class="' + ((i == 0) ? 'sel': '') + '"></span>');
            }
            wrapperEL.querySelector('.slider-nav').innerHTML = _h.join('');

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
    lib.Slider = Slider;
})(window, window.lib || (window.lib = {}));