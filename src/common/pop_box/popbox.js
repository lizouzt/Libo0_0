/**
 * Created by Tao.z on 14-7-25.
 */

/*
  *quora 支持如下:
  *可选择配置字体颜色{color: #6e54ad}
  *error:  {type: 'error', text: '错误咯！', tip: "描述文字"}
  *warn:   {type: 'warn', text: '警告咯！', tip: "描述文字"}
  *info:   {type: 'info', text: '只是个弹窗', tip: "描述文字"}
  *success:{type: 'success', text: '成了！', tip: "描述文字"}
  **/

  /*
  *nav btn 支持如下:
  *可选择配置字体颜色{color: #6e54ad}
  *comfirm: {type: 'comfirm', text: '确定'}
  *btn:   {type: 'btn', text: '好', cb: callback}
  *link:  {type: 'link', text: 'GTH', href: 'http://pinterest.com'}
**/
define(function(require){
  window.popBox = (function(){
    var html = '<div id="J_p_pop" class="p_pop">\
                <div class="pp_wrapper">\
                  <div class="pp_box">\
                    <div class="pp_quora"></div>\
                    <div class="pp_nav"></div>\
                  </div>\
                </div>\
              </div>',

        tmpQuora = '<span class="text" style="<%=color%>"><i class="<%=type%>"></i><%=text%></span>',
        tmpBtn = '<a href="javascript:void(0);" style="<%=color%>" class="pp_btn" data-seq="<%=i%>" data-type="<%=type%>"><%=text%></a>',
        _box = _quora = _nav = null,
        defquora = {type: 'error', text: '错误咯！'},
        defnav = [{type: 'comfirm', text: '确定'}],
        cbList = [];

    var bindEvent = function(){
      document.addEventListener('touchstart', function(e){}, false);

      _box.addEventListener('click', function(e){
        var tar = e.target, tcn = tar.className;
        
        if(tcn == 'pp_btn'){
          var seq = tar.dataset['seq'];
          if(typeof seq != 'undefined')
            cbList[seq]();

          hideBox();
        }
      }, false);
    },

    setQuora = function(opt){
      var html = tmpQuora;
      html = html.replace(/<%=type%>/, opt.type).replace(/<%=color%>/, ('color:' + opt.color)).replace(/<%=text%>/, opt.text);

      if(!!opt.tip)
        html += '<p class="tip">' + opt.tip + '</p>';
      _quora.innerHTML = html;
    },

    setNav = function(opts){
      opts = opts.slice(0,3);
      var html = '';
      for(var i = 0, j = opts.length; i < j; i++){
        var opt = opts[i];
        html += tmpBtn.replace(/<%=i%>/, i).replace(/<%=type%>/, opt.type).replace(/<%=color%>/, ('color:' + opt.color)).replace(/<%=text%>/, opt.text);
        _nav.innerHTML = html;

        if(opt.type == 'btn'){
          if(!opt.cb)
            opt.cb = function(){};
          
          cbList.push((function(cb){
            return function(e){
              cb(e);
            }
          })(opt.cb));
        }
        else if(opt.type == 'link'){
          if(!opt.href)
            opt.href = '';

          cbList.push((function(href){
            return function(){
              location.href = href;
            }
          }(opt.href)));
        }
        else{
          cbList.push(function(){
            hideBox();
          });
        }
      }
    },

    fillBox = function(opts){
      setQuora(opts.quora);
      setNav(opts.nav);

      if(!opts.nav.length)
        _box.classList.add('pp_tip');
      else
        _box.classList.remove('pp_tip');
    },

    showBox = function(params){
      params = params || {};
      var opts = {
        quora: params.quora || defquora,
        nav: params.nav || []
      }
      fillBox(opts);
      _box.classList.add('show');
    },

    hideBox = function(){
      cbList = [];
      _box.classList.remove('show');
    },

    init = function(){
      document.body.insertAdjacentHTML('beforeend', html)
      _box = document.getElementById('J_p_pop');
      _quora = _box.querySelector('.pp_quora');
      _nav = _box.querySelector('.pp_nav');

      bindEvent();
    };

    init();
    return{
      show: showBox,
      hide: hideBox
    }
  })();
});