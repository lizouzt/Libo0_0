define(function(require) {
  var dom;
  var html = '<div id="J_tip"><div class="tip_content"></div> </div>';
  window.tip = {
    show:function (msg) {
      var self = this;
      if(!dom) {
        var d = document.createElement('div');
        d.innerHTML = html;
        document.body.appendChild(d);
        dom = document.getElementById("J_tip");
      }
      dom.children[0].innerText = msg;
      dom.className = "";
    },
    hide:function () {
      dom.className = "hide";
    },
    toggle: function(msg, time){
      var timer = time || 1200;
      var self = this;
      self.show(msg);
      setTimeout(self.hide, timer);
      return
    }
  };

  return tip;
});