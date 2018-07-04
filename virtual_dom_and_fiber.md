## 关于 Virtual DOM
每次提到 React，坊间就会流传关于 Virtual DOM 的传说。
然而，今天我们就来了解一下 Virtual DOM 到底是个什么东西，并顺便完成一个简单的实现。
VirtualDOM 强调的是上面的**优良性能**
首先我们需要了解一下浏览器绘制HTML的原理。

## 浏览器工作流
> NOTE：在下面这张图中，配图文字使用的是Webkit引擎的术语。所有的浏览器都是遵循类似的工作流，仅在细节处略有不同。
![Webkit引擎的工作流](http://upload-images.jianshu.io/upload_images/1828354-33972129d15c77a0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

### 创建DOM树
- 一旦浏览器接收到一个HTML文件，渲染引擎（render engine）就开始解析它，并根据HTML元素（elements）一一对应地生成DOM 节点（nodes），组成一棵DOM树。

### 创建渲染树
- 同时，浏览器也会解析来自外部CSS文件和元素上的inline样式。通常浏览器会为这些样式信息，连同包含样式信息的DOM树上的节点，再创建另外一个树，一般被称作渲染树（render tree）

### 创建渲染树背后的故事
- WebKit内核的浏览器上，处理一个节点的样式的过程称为attachment。DOM树上的每个节点都有一个attach方法，它接收计算好的样式信息，返回一个render对象（又名renderer）
- **Attachment的过程是同步的，新节点插入DOM树时，会调用新节点的attach方法。**
- 构建渲染树时，由于包含了这些render对象，每个render对象都需要计算视觉属性（visual properties）；这个过程通过计算每个元素的样式属性来完成。

### 布局 Layout
又被简称为Reflow（Webkit 里使用layout表示元素的布局，Gecko则称为Reflow）
- 构造了渲染树以后，浏览器引擎开始着手布局（layout）。布局时，渲染树上的每个节点根据其在屏幕上应该出现的精确位置，分配一组屏幕坐标值。

### 绘制 Painting
- 接着，浏览器将会通过遍历渲染树，调用每个节点的paint方法来绘制这些render对象。paint方法根据浏览器平台，使用不同的UI后端API（agnostic UI backend API）。 通过绘制，最终将在屏幕上展示内容。

# 再来看Virtual DOM
好啦，现在你已经简单过了一遍浏览器引擎的渲染流程，你可以看到，**从创建渲染树，到布局，一直到绘制，只要你在这过程中进行一次DOM更新，整个渲染流程都会重做一遍。**尤其是创建渲染树，它需要重新计算所有元素上的所有样式。
在一个复杂的单页面应用中，经常会涉及到大量的DOM操作，这将引起多次计算，使得整个流程变得低效，这应该尽量避免。
  > 以下是一个jQuery的例子，每次操作DOM，都会触发重新渲染，在同一个事件里的DOM操作并不会累积进行
  ```
    function changeToLogUp() {
        $('#slickNewUser').css('visibility', 'visible'); 
        $('#logInSection').css('display', 'none');
        $('#logUpSection').css('display', 'block');
        $('#logUpRightNowWrapper').css('display', 'none');
        $('#logInRightNowWrapper').css('display', 'block');
        $('#resetPasswordSection').css('display', 'none');
        $('#bottomBtnRowWrapper').css('display', 'none'); 
    }
  ```

> DOM 操作 真正的问题在于每次操作都会触发布局的改变、DOM树的修改和渲染。所以，当你一个接一个地去修改30个节点的时候，就会引起30次（潜在的）布局重算，30次（潜在的）重绘，等等。
这就是传统jQuery开发面临的性能问题，现在我们来解决它。

# Virtual DOM 算法
DOM是很慢的。如果我们把一个简单的div元素的属性都打印出来，你会看到：
![庞大的DOM](http://upload-images.jianshu.io/upload_images/1828354-16a8fc9aebd7de83.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
而这**仅仅是第一层**。真正的 DOM 元素非常庞大，这是因为标准就是这么设计的。而且操作它们的时候你要小心翼翼，轻微的触碰可能就会导致页面重排，这可是杀死性能的罪魁祸首。
相对于 DOM 对象，原生的 JavaScript 对象处理起来更快，而且更简单。DOM 树上的结构、属性信息我们都可以很容易地用 JavaScript 对象表示出来：
```
var element = {
  tagName: 'ul', // 节点标签名
  props: { // DOM的属性，用一个对象存储键值对
    id: 'list'
  },
  children: [ // 该节点的子节点
    {tagName: 'li', props: {class: 'item'}, children: ["Item 1"]},
    {tagName: 'li', props: {class: 'item'}, children: ["Item 2"]},
    {tagName: 'li', props: {class: 'item'}, children: ["Item 3"]},
  ]
}
```
上面对应的HTML写法是：
```
<ul id='list'>
  <li class='item'>Item 1</li>
  <li class='item'>Item 2</li>
  <li class='item'>Item 3</li>
</ul>
```
既然原来 DOM 树的信息都可以用 JavaScript 对象来表示，反过来，你就可以根据这个用 JavaScript 对象表示的树结构来构建一棵真正的DOM树。
之前的章节所说的，状态变更->重新渲染整个视图的方式可以稍微修改一下：用 JavaScript 对象表示 DOM 信息和结构，当状态变更的时候，重新渲染这个 JavaScript 的对象结构。当然这样做其实没什么卵用，因为真正的页面其实没有改变。
但是可以用新渲染的对象树去和旧的树进行对比，记录这两棵树差异。记录下来的不同就是我们需要对页面真正的 DOM 操作，然后把它们应用在真正的 DOM 树上，页面就变更了。这样就可以做到：视图的结构确实是整个全新渲染了，但是最后操作DOM的时候确实只变更有不同的地方。
这就是所谓的 Virtual DOM 算法。包括几个步骤：
- **用 JavaScript 对象结构表示 DOM 树的结构；然后用这个树构建一个真正的 DOM 树，插到文档当中**
- **当状态变更的时候，重新构造一棵新的对象树。然后用新的树和旧的树进行比较，记录两棵树差异**
- **把2所记录的差异应用到步骤1所构建的真正的DOM树上，视图就更新了**

Virtual DOM 本质上就是在 JS 和 DOM 之间做了一个缓存。可以类比 CPU 和硬盘，既然硬盘这么慢，我们就在它们之间加个缓存：既然 DOM 这么慢，我们就在它们 JS 和 DOM 之间加个缓存。CPU（JS）只操作内存（Virtual DOM），最后的时候再把变更写入硬盘（DOM）。
> Virtual DOM 实际上没有使用什么全新的技术，仅仅是把 “ 双缓冲（double buffering）” 技术应用到了DOM上面。 这样一来，当你在这个单独的虚拟的DOM树上也一个接一个地修改30个节点的时候，它不会每次都去触发重绘，所以修改节点的开销就变小了。 之后，一旦你要把这些改动传递给真实DOM，之前所有的改动就会整合成一次DOM操作。这一次DOM操作引起的布局计算和重绘可能会更大，但是相比而言，整合起来的改动只做一次，减少了（多次）计算。
> 
> 不过，实际上不借助Virtual DOM也可以做到这一点。你可以自己手动地整合所有的DOM操作到一个DOM 碎片（DOM fragment） 里，然后再传递给DOM树。
> 
> 既然如此，我们再来看看Virtual DOM到底解决了什么问题。 首先，它把**管理DOM碎片这件事情自动化、抽象化**了，使得你无需再去手动处理。另外，当你要手动去做这件事情的时候，你还得**记得哪些部分变化了，哪些部分没变**，毕竟之后重绘时，DOM树上的大量细节你都不需要重新刷新。这时候Virtual DOM的自动化对你来说就非常有用了，如果它的实现是正确的，那么它就会知道到底哪些地方应该需要刷新，哪些地方不要。
>
> 最后，Virtual DOM通过各种组件和你写的一些代码来请求对它进行操作，而**不是直接对它本身进行操作，使你不必非要跟Virtual DOM交互，也不必非要去了解Virtual DOM修改DOM树的原理**，也就不用再想着去修改DOM了。（译注：对开发者来说，Virtual DOM几乎是完全透明的）。这样你就不用在 修改DOM 和 整合DOM操作为一次 之间做同步处理了。

- React
  ![](http://upload-images.jianshu.io/upload_images/1828354-5e159bd21797c27a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
  > 以下是一个React的例子，在大部分React的事件里，是不会去直接操作DOM的，而是通过操作数据，React监听数据变化，由
公式 UI = render(data) 或者 View = F(data) 来渲染出页面；
  > 
  > 这里可以看到它是将所有操作累加起来，最后统计出所有的变化统一更新一次DOM
  ```
	handleGetAuthCode2() {
		if (onClick) {
			onClick();
            this.setState({
			    isClick: true,
		    });
		}
		if (!mobile) {
            this.setState({
			    errorTips: '手机号不能为空',
		    });
		}
		if (!verifyMobileNumber(mobile)) {
			this.setState({
				errorTips: '手机号格式不正确',
			  });
		}
		getAuthCode(mobile);
		// 更新时间戳
		this.setState({
			validatecodeTimeStamp: new Date().getTime(),
		});
	}
  ```

# 算法实现

### 步骤一：用JS对象模拟DOM树
用 JavaScript 来表示一个 DOM 节点是很简单的事情，你只需要记录它的节点类型、属性，还有子节点：
```
/**
 * 通过 JS 对象来表示 DOM
 * @param {*} tagName 标签名
 * @param {*} props 属性
 * @param {*} children 子节点 
 */
function Element(tagName, props, children) {
    this.tagName = tagName;
    this.props = props;
    this.children = children;
}

module.exports = function (tagName, props, children) {
    return new Element(tagName, props, children);
}
```

例如上面的 DOM 结构就可以简单的表示：

```
var el = require('./element')

var ul = el('ul', {id: 'list'}, [
  el('li', {class: 'item'}, ['Item 1']),
  el('li', {class: 'item'}, ['Item 2']),
  el('li', {class: 'item'}, ['Item 3'])
])
```

现在ul只是一个 JavaScript 对象表示的 DOM 结构，页面上并没有这个结构。我们可以根据这个ul构建真正的<ul>

```
Element.prototype.render = function () {
  var el = document.createElement(this.tagName) // 根据tagName构建
  var props = this.props

  for (var propName in props) { // 设置节点的DOM属性
    var propValue = props[propName]
    el.setAttribute(propName, propValue)
  }

  var children = this.children || []

  children.forEach(function (child) {
    var childEl = (child instanceof Element)
      ? child.render() // 如果子节点也是虚拟DOM，递归构建DOM节点
      : document.createTextNode(child) // 如果字符串，只构建文本节点
    el.appendChild(childEl)
  })

  return el
}
```

render方法会根据tagName构建一个真正的DOM节点，然后设置这个节点的属性，最后递归地把自己的子节点也构建起来。所以只需要：

```
var ulRoot = ul.render()
document.body.appendChild(ulRoot)
```
上面的ulRoot是真正的DOM节点，把它塞入文档中，这样body里面就有了真正的<ul>的DOM结构：
```
<ul id='list'>
  <li class='item'>Item 1</li>
  <li class='item'>Item 2</li>
  <li class='item'>Item 3</li>
</ul>
```

### 步骤二：比较两棵虚拟DOM树的差异
正如你所预料的，比较两棵DOM树的差异是 Virtual DOM 算法最核心的部分，这也是所谓的 Virtual DOM 的 diff 算法。

##### 什么是DOM Diff算法
Web界面由DOM树来构成，当其中某一部分发生变化时，其实就是对应的某个DOM节点发生了变化。在React中，构建UI界面的思路是由当前状态决定界面。前后两个状态就对应两套界面，然后由React来比较两个界面的区别，这就需要对DOM树进行Diff算法分析。
即给定任意两棵树，找到最少的转换步骤。但是[标准的的Diff算法](http://grfia.dlsi.ua.es/ml/algorithms/references/editsurvey_bille.pdf)复杂度需要O(n^3)，这显然无法满足性能要求。要达到每次界面都可以整体刷新界面的目的，势必需要对算法进行优化。这看上去非常有难度，然而Facebook工程师却做到了，他们结合Web界面的特点做出了两个简单的假设，使得Diff算法复杂度直接降低到O(n)
1. 两个相同组件产生类似的DOM结构，不同的组件产生不同的DOM结构；
2. 对于同一层次的一组子节点，它们可以通过唯一的id进行区分。
算法上的优化是React整个界面Render的基础，事实也证明这两个假设是合理而精确的，保证了整体界面构建的性能。

##### 不同节点类型的比较
为了在树之间进行比较，我们首先要能够比较两个节点，在React中即比较两个虚拟DOM节点，当两个节点不同时，应该如何处理。这分为两种情况：
（1）节点类型不同 
（2）节点类型相同，但是属性不同。本节先看第一种情况。
当在树中的同一位置前后输出了不同类型的节点，React直接删除前面的节点，然后创建并插入新的节点。假设我们在树的同一位置前后两次输出不同类型的节点。
```
renderA: <div />
renderB: <span />
=> [removeNode <div />], [insertNode <span />]
```

当一个节点从div变成span时，简单的直接删除div节点，并插入一个新的span节点。这符合我们对真实DOM操作的理解。
需要注意的是，删除节点意味着彻底销毁该节点，而不是再后续的比较中再去看是否有另外一个节点等同于该删除的节点。如果该删除的节点之下有子节点，那么这些子节点也会被完全删除，它们也不会用于后面的比较。这也是算法复杂能够降低到O（n）的原因。
上面提到的是对虚拟DOM节点的操作，而同样的逻辑也被用在React组件的比较，例如：

```
renderA: <Header />
renderB: <Content />
=> [removeNode <Header />], [insertNode <Content />]
```

当React在同一个位置遇到不同的组件时，也是简单的销毁第一个组件，而把新创建的组件加上去。这正是应用了第一个假设，不同的组件一般会产生不一样的DOM结构，与其浪费时间去比较它们基本上不会等价的DOM结构，还不如完全创建一个新的组件加上去。
由这一React对不同类型的节点的处理逻辑我们很容易得到推论，那就是React的DOM Diff算法实际上只会对树进行逐层比较，如下所述。

##### 逐层进行节点比较
提到树，相信大多数同学立刻想到的是二叉树，遍历，最短路径等复杂的数据结构算法。而在React中，树的算法其实非常简单，那就是两棵树只会对同一层次的节点进行比较。如下图所示：
![](http://upload-images.jianshu.io/upload_images/1828354-a2610ed017b10b50.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
React只会对相同颜色方框内的DOM节点进行比较，即同一个父节点下的所有子节点。当发现节点已经不存在，则该节点及其子节点会被完全删除掉，不会用于进一步的比较。这样只需要对树进行一次遍历，便能完成整个DOM树的比较。
例如，考虑有下面的DOM结构转换：
![](http://upload-images.jianshu.io/upload_images/1828354-d160670e2ef3b985.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

```
A.parent.remove(A); 
D.append(A);
```

但因为React只会简单的考虑同层节点的位置变换，对于不同层的节点，只有简单的创建和删除。当根节点发现子节点中A不见了，就会直接销毁A；而当D发现自己多了一个子节点A，则会创建一个新的A作为子节点。因此对于这种结构的转变的实际操作是：

```
A.destroy();
A = new A();
A.append(new B());
A.append(new C());
D.append(A);
```

可以看到，以A为根节点的树被整个重新创建。
虽然看上去这样的算法有些“简陋”，但是其基于的是第一个假设：两个不同组件一般产生不一样的DOM结构。根据[React官方博客](http://facebook.github.io/react/docs/reconciliation.html)，这一假设至今为止没有导致严重的性能问题。这当然也给我们一个提示，在实现自己的组件时，保持稳定的DOM结构会有助于性能的提升。例如，我们有时可以通过CSS隐藏或显示某些节点，而不是真的移除或添加DOM节点。

##### 由DOM Diff算法理解组件的生命周期
在[上一篇文章](http://www.infoq.com/cn/articles/react-jsx-and-component)中介绍了React组件的生命周期，其中的每个阶段其实都是和DOM Diff算法息息相关的。例如以下几个方法：
- constructor: 构造函数，组件被创建时执行；
- componentDidMount: 当组件添加到DOM树之后执行；
- componentWillUnmount: 当组件从DOM树中移除之后执行，在React中可以认为组件被销毁；
- componentDidUpdate: 当组件更新时执行。

为了演示组件生命周期和DOM Diff算法的关系，示例：[https://supnate.github.io/react-dom-diff/index.html](https://supnate.github.io/react-dom-diff/index.html) 。这时当DOM树进行如下转变时，即从“shape1”转变到“shape2”时。我们来观察这几个方法的执行情况：

![](http://upload-images.jianshu.io/upload_images/1828354-436fa6bcd620b092.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

浏览器开发工具控制台输出如下结果：
```
C will unmount.
C is created.
B is updated.
A is updated.
C did mount.
D is updated.
R is updated.
```
可以看到，C节点是完全重建后再添加到D节点之下，而不是将其“移动”过去。

##### 相同类型节点的比较

第二种节点的比较是相同类型的节点，算法就相对简单而容易理解。React会对属性进行重设从而实现节点的转换。例如：
```
renderA: <div id="before" />
renderB: <div id="after" />
=> [replaceAttribute id "after"]
```
虚拟DOM的style属性稍有不同，其值并不是一个简单字符串而必须为一个对象，因此转换过程如下：
```
renderA: <div style={{color: 'red'}} />
renderB: <div style={{fontWeight: 'bold'}} />
=> [removeStyle color], [addStyle font-weight 'bold']
```

##### 列表节点的比较

上面介绍了对于不在同一层的节点的比较，即使它们完全一样，也会销毁并重新创建。那么当它们在同一层时，又是如何处理的呢？这就涉及到列表节点的Diff算法。相信很多使用React的同学大多遇到过这样的警告：
![](http://upload-images.jianshu.io/upload_images/1828354-c1c27a33178575cd.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
这是React在遇到列表时却又找不到key时提示的警告。虽然无视这条警告大部分界面也会正确工作，但这通常意味着潜在的性能问题。因为React觉得自己可能无法高效的去更新这个列表。
列表节点的操作通常包括添加、删除和排序。例如下图，我们需要往B和C直接插入节点F，在jQuery中我们可能会直接使用$(B).after(F)来实现。而在React中，我们只会告诉React新的界面应该是A-B-F-C-D-E，由Diff算法完成更新界面。
![](http://upload-images.jianshu.io/upload_images/1828354-4f6a56b5097783ce.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

这时如果每个节点都没有唯一的标识，React无法识别每一个节点，那么更新过程会很低效，即，将C更新成F，D更新成C，E更新成D，最后再插入一个E节点。效果如下图所示：

![](http://upload-images.jianshu.io/upload_images/1828354-569e19010be577f8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

可以看到，React会逐个对节点进行更新，转换到目标节点。而最后插入新的节点E，涉及到的DOM操作非常多。而如果给每个节点唯一的标识（key），那么React能够找到正确的位置去插入新的节点，入下图所示：

![](http://upload-images.jianshu.io/upload_images/1828354-a3a1c4ae29cd887f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

对于列表节点顺序的调整其实也类似于插入或删除，下面结合示例代码我们看下其转换的过程。仍然使用前面提到的示例：[https://supnate.github.io/react-dom-diff/index.html](https://supnate.github.io/react-dom-diff/index.html) ，我们将树的形态从shape5转换到shape6：

![](http://upload-images.jianshu.io/upload_images/1828354-c722c3ecc660e04c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

即将同一层的节点位置进行调整。如果未提供key，那么React认为B和C之后的对应位置组件类型不同，因此完全删除后重建，控制台输出如下：
```
B will unmount.
C will unmount.
C is created.
B is created.
C did mount.
B did mount.
A is updated.
R is updated.
```
而如果提供了key，如下面的代码：
```
shape5: function() {
  return (
    <Root>
      <A>
        <B key="B" />
        <C key="C" />
      </A>
    </Root>
  );
},

shape6: function() {
  return (
    <Root>
      <A>
        <C key="C" />
        <B key="B" />
      </A>
    </Root>
  );
},
```
那么控制台输出如下：
```
C is updated.
B is updated.
A is updated.
R is updated.
```
可以看到，对于列表节点提供唯一的key属性可以帮助React定位到正确的节点进行比较，从而大幅减少DOM操作次数，提高了性能。

### 算法的简单实现

##### 深度优先遍历，记录差异

在实际的代码中，会对新旧两棵树进行一个深度优先的遍历，这样每个节点都会有一个唯一的标记：

![](http://upload-images.jianshu.io/upload_images/1828354-517b2626f7f84ac8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

在深度优先遍历的时候，每遍历到一个节点就把该节点和新的的树进行对比。如果有差异的话就记录到一个对象里面。
```
// diff 函数，对比两棵树
function diff (oldTree, newTree) {
  var index = 0 // 当前节点的标志
  var patches = {} // 用来记录每个节点差异的对象
  dfsWalk(oldTree, newTree, index, patches)
  return patches
}

// 对两棵树进行深度优先遍历
function dfsWalk (oldNode, newNode, index, patches) {
  // 对比oldNode和newNode的不同，记录下来
  patches[index] = [...]

  diffChildren(oldNode.children, newNode.children, index, patches)
}

// 遍历子节点
function diffChildren (oldChildren, newChildren, index, patches) {
  var leftNode = null
  var currentNodeIndex = index
  oldChildren.forEach(function (child, i) {
    var newChild = newChildren[i]
    currentNodeIndex = (leftNode && leftNode.count) // 计算节点的标识
      ? currentNodeIndex + leftNode.count + 1
      : currentNodeIndex + 1
    dfsWalk(child, newChild, currentNodeIndex, patches) // 深度遍历子节点
    leftNode = child
  })
}
```
例如，上面的div和新的div有差异，当前的标记是0，那么：
```
patches[0] = [{difference}, {difference}, ...] // 用数组存储新旧节点的不同
```
同理p是patches[1]，ul是patches[3]，类推。

##### 差异类型

上面说的节点的差异指的是什么呢？对 DOM 操作可能会：

1. 替换掉原来的节点，例如把上面的div换成了section
2. 移动、删除、新增子节点，例如上面div的子节点，把p和ul顺序互换
3. 修改了节点的属性
4. 对于文本节点，文本内容可能会改变。例如修改上面的文本节点2内容为Virtual DOM 2。

所以我们定义了几种差异类型：
```
var REPLACE = 0
var REORDER = 1
var PROPS = 2
var TEXT = 3
```
对于节点替换，很简单。判断新旧节点的tagName和是不是一样的，如果不一样的说明需要替换掉。如div换成section，就记录下：
```
patches[0] = [{
  type: REPALCE,
  node: newNode // el('section', props, children)
}]
```
如果给div新增了属性id为container，就记录下：
```
patches[0] = [{
  type: REPALCE,
  node: newNode // el('section', props, children)
}, {
  type: PROPS,
  props: {
    id: "container"
  }
}]
```
如果是文本节点，如上面的文本节点2，就记录下：
```
patches[2] = [{
  type: TEXT,
  content: "Virtual DOM2"
}]
```
那如果把我div的子节点重新排序呢？例如p, ul, div的顺序换成了div, p, ul。这个该怎么对比？如果按照同层级进行顺序对比的话，它们都会被替换掉。如p和div的tagName不同，p会被div所替代。最终，三个节点都会被替换，这样DOM开销就非常大。而实际上是不需要替换节点，而只需要经过节点移动就可以达到，我们只需知道怎么进行移动。

这牵涉到两个列表的对比算法，需要另外起一个小节来讨论。

##### 列表对比算法

假设现在可以英文字母唯一地标识每一个子节点：

旧的节点顺序：
```
a b c d e f g h i
```
现在对节点进行了删除、插入、移动的操作。新增j节点，删除e节点，移动h节点：

新的节点顺序：
```
a b c h d f g i j
```
现在知道了新旧的顺序，求最小的插入、删除操作（移动可以看成是删除和插入操作的结合）。这个问题抽象出来其实是字符串的最小编辑距离问题（[Edition Distance](https://en.wikipedia.org/wiki/Edit_distance)），最常见的解决算法是 [Levenshtein Distance](https://en.wikipedia.org/wiki/Levenshtein_distance)，通过动态规划求解，时间复杂度为 O(M * N)。但是我们并不需要真的达到最小的操作，我们只需要优化一些比较常见的移动情况，牺牲一定DOM操作，让算法时间复杂度达到线性的（O(max(M, N))。具体算法细节比较多，这里不累述，有兴趣可以参考[代码](https://github.com/livoras/list-diff/blob/master/lib/diff.js)。

我们能够获取到某个父节点的子节点的操作，就可以记录下来：
```
patches[0] = [{
  type: REORDER,
  moves: [{remove or insert}, {remove or insert}, ...]
}]
```
但是要注意的是，因为tagName
是可重复的，不能用这个来进行对比。所以需要给子节点加上唯一标识key
，列表对比的时候，使用key
进行对比，这样才能复用老的 DOM 树上的节点。

这样，我们就可以通过深度优先遍历两棵树，每层的节点进行对比，记录下每个节点的差异了。完整 diff 算法代码可见 [diff.js](https://github.com/livoras/simple-virtual-dom/blob/master/lib/diff.js)。

### 步骤三：把差异应用到真正的DOM树上

因为步骤一所构建的 JavaScript 对象树和render出来真正的DOM树的信息、结构是一样的。所以我们可以对那棵DOM树也进行深度优先的遍历，遍历的时候从步骤二生成的patches对象中找出当前遍历的节点差异，然后进行 DOM 操作。
```
function patch (node, patches) {
  var walker = {index: 0}
  dfsWalk(node, walker, patches)
}

function dfsWalk (node, walker, patches) {
  var currentPatches = patches[walker.index] // 从patches拿出当前节点的差异

  var len = node.childNodes
    ? node.childNodes.length
    : 0
  for (var i = 0; i < len; i++) { // 深度遍历子节点
    var child = node.childNodes[i]
    walker.index++
    dfsWalk(child, walker, patches)
  }

  if (currentPatches) {
    applyPatches(node, currentPatches) // 对当前节点进行DOM操作
  }
}
```
applyPatches，根据不同类型的差异对当前节点进行 DOM 操作：
```
function applyPatches (node, currentPatches) {
  currentPatches.forEach(function (currentPatch) {
    switch (currentPatch.type) {
      case REPLACE:
        node.parentNode.replaceChild(currentPatch.node.render(), node)
        break
      case REORDER:
        reorderChildren(node, currentPatch.moves)
        break
      case PROPS:
        setProps(node, currentPatch.props)
        break
      case TEXT:
        node.textContent = currentPatch.content
        break
      default:
        throw new Error('Unknown patch type ' + currentPatch.type)
    }
  })
}
```
完整代码可见 [patch.js](https://github.com/livoras/simple-virtual-dom/blob/master/lib/patch.js)。

### 结语

Virtual DOM 算法主要是实现上面步骤的三个函数：[element](https://github.com/livoras/simple-virtual-dom/blob/master/lib/element.js)，[diff](https://github.com/livoras/simple-virtual-dom/blob/master/lib/diff.js)，[patch](https://github.com/livoras/simple-virtual-dom/blob/master/lib/patch.js)。然后就可以实际的进行使用：
```
// 1. 构建虚拟DOM
var tree = el('div', {'id': 'container'}, [
    el('h1', {style: 'color: blue'}, ['simple virtal dom']),
    el('p', ['Hello, virtual-dom']),
    el('ul', [el('li')])
])

// 2. 通过虚拟DOM构建真正的DOM
var root = tree.render()
document.body.appendChild(root)

// 3. 生成新的虚拟DOM
var newTree = el('div', {'id': 'container'}, [
    el('h1', {style: 'color: red'}, ['simple virtal dom']),
    el('p', ['Hello, virtual-dom']),
    el('ul', [el('li'), el('li')])
])

// 4. 比较两棵虚拟DOM树的不同
var patches = diff(tree, newTree)

// 5. 在真正的DOM元素上应用变更
patch(root, patches)
```
当然这是非常粗糙的实践，实际中还需要处理事件监听等；生成虚拟 DOM 的时候也可以加入 JSX 语法。这些事情都做了的话，就可以构造一个简单的ReactJS了。

# React Fiber 简介

React Fiber是个什么东西呢？官方的一句话解释是“**React Fiber是对核心算法的一次重新实现**”。这么说似乎太虚无缥缈，所以还是要详细说一下。

为什么Facebook要搞React Fiber呢？

### 同步更新过程的局限

在v15之前的React中，更新过程是同步的，这可能会导致性能问题。

当React决定要加载或者更新组件树时，会做很多事，比如调用各个组件的生命周期函数，计算和比对Virtual DOM，最后更新DOM树，这整个过程是同步进行的，也就是说只要一个加载或者更新过程开始，那React就以不破楼兰终不还的气概，一鼓作气运行到底，中途绝不停歇。

表面上看，这样的设计也是挺合理的，因为更新过程不会有任何I/O操作嘛，完全是CPU计算，所以无需异步操作，的确只要一路狂奔就行了，但是，当组件树比较庞大的时候，问题就来了。

假如更新一个组件需要1毫秒，如果有200个组件要更新，那就需要200毫秒，在这200毫秒的更新过程中，浏览器那个唯一的主线程都在专心运行更新操作，无暇去做任何其他的事情。想象一下，在这200毫秒内，用户往一个input元素中输入点什么，敲击键盘也不会获得响应，因为渲染输入按键结果也是浏览器主线程的工作，但是浏览器主线程被React占着呢，抽不出空，最后的结果就是用户敲了按键看不到反应，等React更新过程结束之后，**咔咔咔**那些按键一下子出现在input元素里了。

这就是所谓的界面卡顿，很不好的用户体验。

现有的React版本，当组件树很大的时候就会出现这种问题，因为更新过程是同步地一层组件套一层组件，逐渐深入的过程，在更新完所有组件之前不停止，函数的调用栈就像下图这样，调用得很深，而且很长时间不会返回。

![](http://upload-images.jianshu.io/upload_images/1828354-46999c810d784c2f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

因为JavaScript单线程的特点，每个同步任务不能耗时太长，不然就会让程序不会对其他输入作出相应，React的更新过程就是犯了这个禁忌，而React Fiber就是要改变现状。

### React Fiber的方式

破解JavaScript中同步操作时间过长的方法其实很简单——分片。

把一个耗时长的任务分成很多小片，每一个小片的运行时间很短，虽然总时间依然很长，但是在每个小片执行完之后，都给其他任务一个执行的机会，这样唯一的线程就不会被独占，其他任务依然有运行的机会。

React Fiber把更新过程碎片化，执行过程如下面的图所示，每执行完一段更新过程，就把控制权交还给React负责任务协调的模块，看看有没有其他紧急任务要做，如果没有就继续去更新，如果有紧急任务，那就去做紧急任务。

维护每一个分片的数据结构，就是Fiber。

有了分片之后，更新过程的调用栈如下图所示，中间每一个波谷代表深入某个分片的执行过程，每个波峰就是一个分片执行结束交还控制权的时机。

![](http://upload-images.jianshu.io/upload_images/1828354-ef639d5f67d0bf74.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
