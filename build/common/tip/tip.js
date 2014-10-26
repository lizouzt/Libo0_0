define(function(require) {
  var dom;
  var html = '<div id="J_tip"><div class="content"></div> </div>';
  var tip = {
    show:function (msg) {
      var self = this;
      if(!dom) {
        $(document.body).append(html);
        dom = $("#J_tip");
      }
      dom.find(".content").text(msg);
      dom.show();
    },
    hide:function () {
      dom.hide('display');
    }
  };

  return tip;
});