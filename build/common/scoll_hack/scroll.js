/**
 * Created by Elfer on 14-5-19.
 */
;
(function(lib){
    /*
    *new lib.scroll({
    *    loaderNeeded:   //是否需要加载动画提示,
    *    loadom:         //自定义加载动画节点,
    *    content:        //内容节点,
    *    onscrollbottom: //滚动到底部时回调
    *  })
    **/
    var scroll = function(opts){
        var self = this;
        self._cfg = opts;
        self._istouchend = false;
        self._scrollTop = 0;
        self._enabled = true;
        self.scrollNode = document.body;

        if(opts.content.nodeName == '#document' || !opts.content){
          self.cel = self.scrollNode;
        }else{
          self.cel = opts.content;
        }

        var tendToNextLoad = function(){
          if(!self._flag)
            return;

          var jusand = self.scrollNode.clientHeight - screen.height - self.scrollNode.scrollTop;
          if( jusand <= 400 && self.scrollNode.clientHeight > screen.height){
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
              self.cel.insertAdjacentHTML('afterend', '<h4 id="g_scroll_loading" style="display: none; height: 40px;line-height: 40px; margin-bottom: 48px; text-align: center;">I\'m Loading. U\'re waiting.</h4>');
              self.ldd = document.getElementById('Loading');
            }else{
              self.ldd = opts.loadom;
              self.cel = undefined;
            }
          },
          events: function(){
            window.onscroll = scrollCenter;
        
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
        }

        if(opts.loaderNeeded)
          init.loader();

        init.events();
    };

    scroll.prototype = {
      _flag : true,
      _setFlag : function(flag){
        this._flag = flag;
      },
      _getFlag : function(){
        return this._flag;
      },
      /**
       * 滚动停止
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
        * 开始滚动
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
        * 向上滚动
        * @return {[type]} [description]
        */
       upScroll : function(){

       },
       /**
        * 像下滚动
        * @return {[type]} [description]
        */
       downScroll : function(){

       },
       /**
        * 滚动到最底部
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
        * 滚动到最顶部
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
        * 设置top参数值
        * @param {[type]} value [description]
        */
       _setScrollTop : function(value){
          this._scrollTop = value
       },
       /**
        * 获取top值
        * @return {[type]} [description]
        */
       getScrollTop : function(){
          var self = this;
          return self._scrollTop;
       },
      
       _isSuccess : true,
       loadSuccess : function(){
          var self = this;
          if(self._isSuccess){
            if(self.scrollNode.clientHeight > screen.height && self.ldd)
              self.showLoad();
          }else
            self._isSuccess = true;
          self._setFlag(true);
       },
       showLoad: function(){
        this.ldd.style.display = 'block';
       },
       hideLoad: function(){
        this.ldd.style.display = 'none';
       },
       enable: function(){
          this.showLoad();
          this._enabled = true;
       },
       disable: function(){
        this.hideLoad();
        this._enabled = false;
       }
    };

    lib.scroll = scroll;
})(window.lib || (window['lib'] = {}));