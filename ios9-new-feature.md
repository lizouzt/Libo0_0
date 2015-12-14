## ios 9 webkit支持点

### filter
> ```backdrop-filter```，支持属性[fxtf](https://drafts.fxtf.org/filters/#typedef-url)

> 对应ios6开始的```-webkit-filter```，到ios8移除尾巴-webkit-，改为```filter```
但是最初的支持属性blur、brightness等都放弃了进一步支持到filter，所以就当它死了，原因不可考。

### CSS Scroll Snapping
gallery切换支持，就是对轮播图做原生支持，iOS9发布的时候出过一个和```position: sticky;```一起的demo，有兴趣可以找找聊天记录

### picture-in-picture
视频里面播视频，主要拼的是混色渲染的段子，之前也做过一个demo给大家吐槽的，有兴趣同上

### css检测@supports
```
@supports (backdrop-filter) {
    .wtfClassName{
    	backdrop-filter: blur(10000px);
    }
}
```
### 支持webkit js实验属性CSS
console.log(CSS.supports('backdrop','blur'))
> [chrome很早就支持啦，具体版本不详]

### 3d touch事件

1. webkitmouseforcewillbegin
2. webkitmouseforcedown
3. webkitmousefoeceup

事件顺序
> rest->mousedown->mouseforcedown->release->mousefoeceup->mouseup->rest


