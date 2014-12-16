# 综述
HACK IOS6+5+7.0 不支持 position：sticky；的情况下使用onscroll切换元素Fixed状态的延时
支持绑定监听多元素

# 配置
    
# 方法
* @param  {[domElement]} el  [需要绑定的元素]
* @param  {[int]}        th  [元素位置判断延迟距离]
* @param  {[Function]}   acb [进入fixed状态回调]
* @param  {[Function]}   dcb [退出fixed状态回调]
* fixHack.bind({
    el: document.querySelector('.g_i_list'), 
    th: 44,
    acb: function() {
      fixtar.classList.add('hung');
    },
    dcb: function() {
      fixtar.classList.remove('hung');
    }
  });
