define(function(require) {
  var dom;
  var html = '<div id="J_tip"><div class="tip_content"></div> </div>';
  var tip = {
    show:function (msg) {
      var self = this;
      if(!dom) {
        $(document.body).append(html);
        dom = $("#J_tip");
      }
      dom.find(".tip_content").text(msg);
      dom.show();
    },
    hide:function () {
      dom.hide('display');
    },
    toggleDisplay: function(msg, time){
      var self = this;
      self.show(msg);
      setTimeout(self.hide, time);
    }
  };

  return tip;
});