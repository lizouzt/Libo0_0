/*
*   Usage
*
*   new XScroll({
*       loaderNeeded: true,
*       loadom: loader Element,
*       scrollNode: overflow scroll Element. default is body
*       content: scroll content Element
*       onscrollbottom: function () {
*           Api.getCartItems();
*       }
*   });
* */
var Scroll = function(opts){
    var self = this;
    self._cfg = opts;
    self._istouchend = false;
    self._scrollTop = 0;
    self._enabled = true;
    self.scrollNode = opts.scrollNode || document.body;

    if (!opts.content) return false;

    if (opts.content.nodeName == '#document' || !opts.content) {
        self.cel = self.scrollNode;
    } else {
        self.cel = opts.content;
    }

    var tendToNextLoad = function(){
        if(!self._flag)
            return;

        var jusand = opts.content.clientHeight - document.documentElement.clientHeight - self.scrollNode.scrollTop;
        if( jusand <= 200 && opts.content.clientHeight > document.documentElement.clientHeight){
            self.bottom();
            self._setFlag(false);
        }
    }

    var scrollListener = function(){
        self._setScrollTop(self.scrollNode.scrollTop);
        tendToNextLoad();
    };

    var scrollCenter = null;
    var inval = window.onscroll;
    if(!!inval)
        scrollCenter = function(){
            inval();
            scrollListener();
        };
    else
        scrollCenter = scrollListener;

    var init = {
        loader: function(){
            if(!opts.loadom){
                self.cel.insertAdjacentHTML('afterend', '<h4 id="g_scroll_loading" style="color: lightgray; display: none; height: 40px;line-height: 40px; margin-bottom: 48px; text-align: center;">åŠ è½½ä¸­...</h4>');
                self.ldd = document.getElementById('g_scroll_loading');
            }else{
                self.ldd = opts.loadom;
            }
        },
        events: function(){
            self.scrollNode.onscroll = scrollCenter;
    
            !!opts.onstart && opts.content.addEventListener('touchstart',function(){
                self['start']();
            },false);

            var loadHandler = function(){
                tendToNextLoad();
            }
            opts.content.addEventListener('touchmove', tendToNextLoad,false);

            opts.content.addEventListener('touchend', tendToNextLoad,false);

            self.Jnode = self.scrollNode;
        }
    };

    if(opts.loaderNeeded)
        init.loader();

    init.events();
};

Scroll.prototype = {
    _flag : true,
    _setFlag : function(flag){
        this._flag = flag;
    },
    _getFlag : function(){
        return this._flag;
    },
    /**
    * æ»šåŠ¨åœæ­¢
    * @return {[type]} [description]
    */
    stop : function(){
        var self = this;
        if(!self._getFlag()){
            return;
        }
        if(self._cfg.touchend){
            self._cfg.touchend();
        }
    },
    /**
    * å¼€å§‹æ»šåŠ¨
    * @return {[type]} [description]
    */
    start : function(){
        var self = this;
        if(!self._getFlag()){
            return;
        }
        if(self._cfg.touchstart){
            self._cfg.touchstart();
        }
    },
    move : function(){
        var self = this;
        if(!self._getFlag()){
            return;
        }
        if(self._cfg.touchmove){
            self._cfg.touchmove();
        }
    },
    /**
    * å‘ä¸Šæ»šåŠ¨
    * @return {[type]} [description]
    */
    upScroll : function(){

    },
    /**
    * åƒä¸‹æ»šåŠ¨
    * @return {[type]} [description]
    */
    downScroll : function(){

    },
    /**
    * æ»šåŠ¨åˆ°æœ€åº•éƒ¨
    * @return {Boolean} [description]
    */
    bottom : function(){
        var self = this;
        if(!self._getFlag() || !self._enabled){
            return;
        }
        if(self._cfg.onscrollbottom){
            self._isSuccess = false;
            self._cfg.onscrollbottom(self._scrollTop);
        }
    },
    /**
    * æ»šåŠ¨åˆ°æœ€é¡¶éƒ¨
    * @return {[type]} [description]
    */
    top : function(){
        var self = this;
        if(!self._getFlag() || self._isSuccess !== true){
            return;
        }
        if(self._cfg.onscrolltop){
            self._isSuccess = false;
            self._cfg.onscrolltop(0);
        }
    },
    /**
    * è®¾ç½®topå‚æ•°å€¼
    * @param {[type]} value [description]
    */
    _setScrollTop : function(value){
        this._scrollTop = value
    },
    /**
    * èŽ·å–topå€¼
    * @return {[type]} [description]
    */
    getScrollTop : function(){
        var self = this;
        return self._scrollTop;
    },
  
    _isSuccess : true,
    loadSuccess : function(){
        var self = this;
        if(self.ldd)
            self.showLoad();

        if(!self._isSuccess) {
            self._isSuccess = true;
        }
        self._setFlag(true);
    },
    showLoad: function(){
        !!this.ldd && (this.ldd.style.display = 'block');
        this.cel.style.marginBottom = '0';
    },
    hideLoad: function(){
        !!this.ldd && (this.ldd.style.display = 'none');
        this.cel.style.marginBottom = '48px';
    },
    enable: function(){
        this.showLoad();
        this._setFlag(true);
        this._enabled = true;
    },
    disable: function(){
        this.hideLoad();
        this._enabled = false;
    }
};

module.exports = Scroll;
