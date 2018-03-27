## PanResponder

```
PanResponer 用来绑定触摸事件，并且对多点触控做了封装，便于处理手势。PanResponer 提供的是一系列 API，帮助用户完成复杂的触摸事件逻辑，这涉及管理多个节点对于触摸事件是否响应，以及响应顺序，在存在多个可响应节点时，如果处理他们对于触摸事件的控制权。

由于页面上会同时存在多个接收触摸事件的节点，比如下图中，A 和 B，它们都可以响应触摸事件，但是在触摸到 B 上面的时候，有时候希望首先由 A 来响应这个触摸事件。

但当触摸到 C 的时候，又希望先由 C 来响应这个触摸事件。PanResponder 能够协调多个节点对事件的控制权，在合适的时候通过接口询问某个节点是否需要开始响应，以及是否愿意停止响应。

+--------------------------------+
|  A                             |
|      +-------+   +-------+     |
|      | B     |   | C     |     |
|      |       |   |       |     |
|      +-------+   +-------+     |
|                                |
+--------------------------------+
在 PanResponser 的事件系统中存在两个主角，一个是当前正在响应触摸事件的节点，另一个是希望响应触摸事件的节点。

+---------------------------+
   当前正在响应触摸事件的节点
+---------------------------+
           ^ |
           | |
           | v
     +--------------+
     | PanResponser |
     +--------------+
           ^ |
           | |
           | v
+---------------------------+
   希望响应触摸事件的节点
+---------------------------+
PanResponser 需要在中间完成协商，完成当一个节点希望响应触摸事件的时候，需要询问当前正在响应的节点是否愿意放出控制权，诸如此类的问题。

基本用法
使用 PanResponder.create 方法创建一个包含诸多事件方法的对象，将该对象传给目标组件：

class ResponderExample extends Component {
    constructor() {
        super();
        this.panResponer = PanResponder.create({
            onPanResponderGrant: (e, gestureState) => {...},
            onPanResponderStart: (e, gestureState) => {...},
            onPanResponderMove: (e, gestureState) => {...},
            onPanResponderTerminate: (e, gestureState) => {...}
        });
    }
    render(){
        return (
            <View {...this.panResponer.panHandlers}></View>
        )
    }
}
事件回调参数
PanResponer.create 方法创建了一系列事件，这些事件的回调，都接收 event 和 gestureState 两个参数，如：

onPanResponderMove: (event, gestureState) => {}
event 中包含一个 nativeEvent 属性，event.nativeEvent 也是一个对象，包含下列属性：

changedTouches ： 一组 touch event，这是较上次事件后，发生变动了触点
identifier ： 本次事件的 id
locationX ： X 坐标，相对于触发该事件的元素
locationY ： X 坐标，相对于触发该事件的元素
pageX ： X 坐标，相对于根节点
pageY ： Y 坐标，相对于根节点
target ： Touch 事件的目标节点
timestamp ： 一个时间戳，便于进行速度计算
touches ： 当前所有在屏幕上的触点
gestureState 对象包含下列属性：

stateID：触摸状态的ID。随机生成。
moveX：最近一次移动相对屏幕的 X 坐标
moveY：最近一次移动相对屏幕的 Y 坐标
x0：当响应器产生时的屏幕坐标
y0：当响应器产生时的屏幕坐标
dx：从触摸操作开始时的累计横向路程
dy：从触摸操作开始时的累计纵向路程
vx：当前的横向移动速度
vy：当前的纵向移动速度
numberActiveTouches：当前在屏幕上的有效触摸点的数量
各个事件的响应时机
像 touchstart,touchmove,touchend 事件存在触发时机和先后一样，PanResponser 的多个事件也存在触发时机和先后次序，只不过他们比 touch* 要复杂一点。

PanResponser 包含下列事件：

onStartShouldSetPanResponder：在 touchstart 阶段触发，询问当前节点是否愿意成为事件响应者
onStartShouldSetPanResponderCapture：这是在 touchstart 的捕获阶段触发，早于 onStartShouldSetPanResponder，如果希望自身先于内部节点响应触摸事件，可以在捕获阶段，拿到触摸事件的控制权
onMoveShouldSetPanResponder：在 touchmove 阶段触发，询问当前节点是否愿意成为事件响应者
onMoveShouldSetPanResponderCapture：参考前面三条
onPanResponderReject：请求获得触摸事件的控制权 被拒绝 的时候触发
onPanResponderGrant：请求获得触摸事件的控制权 成功 的时候触发，被同意后自己将会成为响应者
onPanResponderStart：在 touchstart 阶段，如果当前节点是响应者，或者请求并成为了响应者，则会触发该事件
onPanResponderMove：在 touchmove 阶段，如果当前节点是响应者，或者请求并成为了响应者，则会触发该事件
onPanResponderEnd：在 touchend 节点，响应者触发
onPanResponderRelease：如果当前节点是响应者，会在用户松开所有触摸点后触发
onPanResponderTerminationRequest：接收到来自其他节点的请求，希望自己让出控制权，返回 true 表示同意。
onPanResponderTerminate：控制权交出后触发
捕获阶段的 on*ShouldSetPanResponder 句柄:

onStartShouldSetResponder 和 onMoveShouldSetResponder 是在冒泡阶段调用的，会在节点最深的元素上调用。这意味着多个元素在 on*ShouldSetResponder 中都返回 true 的时候，节点最深的的元素会获得控制权。在大多数情况下这都是用户期待的事情，比如能够保证所有的按钮都可用。

但是，有的时候父元素可能想保证自己先于子元素成为响应者。这个时候可以将句柄添加在捕获阶段。这个时候需要用到 on*ShouldSetResponderCapture。父元素如果希望阻止子元素成为响应者，它应该有一个 onStartShouldSetResponderCapture 并在其中返回 true。

{
    // ...
    // 在事件的捕获阶段调用
    onStartShouldSetResponderCapture: (evt) => true,
    onMoveShouldSetResponderCapture: (evt) => true,
    // ...
}
流程图
PanResponser 归根结底还是由 Touch* 系列事件触发的，下面是摘自 React 代码库的 ResponderEventPlugin.js 文件中的注释，从这里可以看出各个事件之间详细的关系：

/*                                             Negotiation Performed
                                             +-----------------------+
                                            /                         \
Process low level events to    +     Current Responder      +   wantsResponderID
determine who to perform negot-|   (if any exists at all)   |
iation/transition              | Otherwise just pass through|
-------------------------------+----------------------------+------------------+
Bubble to find first ID        |                            |
to return true:wantsResponderID|                            |
                               |                            |
     +-------------+           |                            |
     | onTouchStart|           |                            |
     +------+------+     none  |                            |
            |            return|                            |
+-----------v-------------+true| +------------------------+ |
|onStartShouldSetResponder|----->|onResponderStart (cur)  |<-----------+
+-----------+-------------+    | +------------------------+ |          |
            |                  |                            | +--------+-------+
            | returned true for|       false:REJECT +-------->|onResponderReject
            | wantsResponderID |                    |       | +----------------+
            | (now attempt     | +------------------+-----+ |
            |  handoff)        | |   onResponder          | |
            +------------------->|      TerminationRequest| |
                               | +------------------+-----+ |
                               |                    |       | +----------------+
                               |         true:GRANT +-------->|onResponderGrant|
                               |                            | +--------+-------+
                               | +------------------------+ |          |
                               | |   onResponderTerminate |<-----------+
                               | +------------------+-----+ |
                               |                    |       | +----------------+
                               |                    +-------->|onResponderStart|
                               |                            | +----------------+
Bubble to find first ID        |                            |
to return true:wantsResponderID|                            |
                               |                            |
     +-------------+           |                            |
     | onTouchMove |           |                            |
     +------+------+     none  |                            |
            |            return|                            |
+-----------v-------------+true| +------------------------+ |
|onMoveShouldSetResponder |----->|onResponderMove (cur)   |<-----------+
+-----------+-------------+    | +------------------------+ |          |
            |                  |                            | +--------+-------+
            | returned true for|       false:REJECT +-------->|onResponderRejec|
            | wantsResponderID |                    |       | +----------------+
            | (now attempt     | +------------------+-----+ |
            |  handoff)        | |   onResponder          | |
            +------------------->|      TerminationRequest| |
                               | +------------------+-----+ |
                               |                    |       | +----------------+
                               |         true:GRANT +-------->|onResponderGrant|
                               |                            | +--------+-------+
                               | +------------------------+ |          |
                               | |   onResponderTerminate |<-----------+
                               | +------------------+-----+ |
                               |                    |       | +----------------+
                               |                    +-------->|onResponderMove |
                               |                            | +----------------+
                               |                            |
                               |                            |
      Some active touch started|                            |
      inside current responder | +------------------------+ |
      +------------------------->|      onResponderEnd    | |
      |                        | +------------------------+ |
  +---+---------+              |                            |
  | onTouchEnd  |              |                            |
  +---+---------+              |                            |
      |                        | +------------------------+ |
      +------------------------->|     onResponderEnd     | |
      No active touches started| +-----------+------------+ |
      inside current responder |             |              |
                               |             v              |
                               | +------------------------+ |
                               | |    onResponderRelease  | |
                               | +------------------------+ |
                               |                            |
                               +                            +
用法示例
下面的例子是利用 PanResponder 做出一个可以被拖动的圆。基本做法就是在 onPanResponderMove 中获取指针移动的距离，然后更新 left 和 top 的值。

class Circle extends Component {
  constructor(props) {
    super(props);
    this.state = {
      x: 0,
      y: 0,
    }
    this.startPoint = null;

    this._panResponder = {};
  }

  componentWillMount() {
    this._panResponder = PanResponder.create({
      onPanResponderGrant: () => {
        // 记录下当前节点的位置
        this.startPoint = {
          x: this.state.x,
          y: this.state.y
        };
      },
      // 希望成为事件响应者
      onStartShouldSetResponder: () => true,
      onMoveShouldSetPanResponder: () => true，
      onPanResponderMove: (event, gestureState) => {
        // 拿到累积移动量
        let { dx, dy } = gestureState;
        // 更新当前的位置
        this.setState({
          x: dx + this.startPoint.x,
          y: dy + this.startPoint.y,
        });
      },
      // 原因释放控制权
      onPanResponderTerminationRequest: (event, gestureState) => {
        return true;
      }
    })
  }
  render() {
    let {radius} = this.props;
    return (
      <View
        {...this._panResponder.panHandlers}
        style={{
          borderRadius: radius,
          position: 'absolute',
          top: this.state.y,
          left: this.state.x,
          width: 2 * radius,
          height: 2 * radius,
        }}
      />
    )
  }
}
```
