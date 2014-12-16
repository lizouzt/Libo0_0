# 综述
HACK IOS6+5+7.0 不支持 position：sticky；的情况下使用onscroll切换元素Fixed状态的延时
支持绑定监听多元素

# 配置
    
# 方法
* @param  {[domElement]} el  [参照元素]
* @param  {[int]}        h   [触发位置，默认0]
* @param  {[int]}        th  [目标元素距离参照元素顶部的距离]
* @param  {[Function]}   acb [进入fixed状态回调]
* @param  {[Function]}   dcb [退出fixed状态回调]

fixHack.bind({
    el: document.querySelector('.g_i_list'), 
    th: 44,
    acb: function() {
      fixtar.classList.add('hung');
    },
    dcb: function() {
      fixtar.classList.remove('hung');
    }
  });
