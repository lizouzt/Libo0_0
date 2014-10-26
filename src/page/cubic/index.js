$ = function(id){
	return document.getElementById(id);
}
var docW = document.documentElement.clientWidth,
	SIZE = docW > 320 ? 300 : (docW - 20),
	style = document.createElement('style');

style.type = 'text/css';
style.innerText = '.p0 { left: 0; top: <%SIZE%>px; }.p1 {left: 50px; top: <%SIZE%>px; }.p2 { left: <%SIZE%>px; top: 150px; }.p3 { left: <%SIZE%>px; top: 0; }'.replace(/<%SIZE%>/gi, SIZE);
document.head.appendChild(style);

var $p1, $p2, $box, $clipBoard, ctx;

function initApp(){
	var canvas = $('bezierCurve');
	canvas.width = SIZE;
	canvas.height = SIZE;

	ctx = canvas.getContext("2d");
	$box = $("J_box");
	$p1 = $("drag_p1");
	$p2 = $("drag_p2");
	$clipBoard = $('clipBoard');
	
	renderWrap();
	bindEvent();
}
function bindEvent(){
	Drag({
		el:'drag_p1',
		range: {x1: 0, y1: 0, x2: SIZE, y2: SIZE},
		start: function(){
			this.el.classList.add('active');
		},
		move: function(){
			renderWrap();
		},
		end:function(e){
			this.el.classList.remove('active');
		}
	});
	Drag({
		el:'drag_p2',
		range: {x1: 0, y1: 0, x2: SIZE, y2: SIZE},
		start: function(){
			this.el.classList.add('active');
		},
		move: function(){
			var subx = this.el.style.left.substring(0,this.el.style.left.length-2),
				suby = this.el.style.top.substring(0,this.el.style.top.length-2);
			renderWrap();
		},
		end:function(e){
			this.el.classList.remove('active');
		}
	});
	
	$("run").onclick = function(e){
		e.preventDefault();
		var $btn = e.target, $view = $('view');
		if(/active/.test($btn.className))
			return
		$btn.className += ' active';
		$view.className = "active";
		
		setTimeout(function() {
			$view.className = "";
			$btn.className = 'btn_go';
		}, 2000);
	};
}

function setTransitionFn(val) {
	var arr = ['-webkit-', '-moz-', '-ms-', '-o-', ''], text = '';
	val = 'transition: left 1s ' + val + ';';
	for(var i in arr)
		text += arr[i] + val;
	$box.setAttribute('style', text);
}

function adjustValue(val) {
	val = val.toFixed(2);
	val = val.toString().replace("0.", ".").replace("1.00", "1").replace(".00", "0");
	return val;
}

function renderWrap() {
	var p1 = {x: $p1.offsetLeft, y: $p1.offsetTop},
		p2 = {x: $p2.offsetLeft, y: $p2.offsetTop};
	
	render(p1, p2);
};

function render(p1, p2) {
	ctx.clearRect(0, 0, SIZE, SIZE);
	
	ctx.beginPath();
	ctx.lineWidth = 3;
	ctx.strokeStyle = "#000";
    ctx.moveTo(0, SIZE);
    ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, SIZE, 0);				
	ctx.stroke();
	ctx.closePath();

	ctx.beginPath();
	ctx.strokeStyle = "#ccc";
	ctx.lineWidth = 1;

	ctx.moveTo(0, SIZE);
	ctx.lineTo(p1.x, p1.y);
	ctx.stroke();
	
	ctx.moveTo(SIZE, 0);
	ctx.lineTo(p2.x, p2.y);
	ctx.stroke();
	ctx.closePath();
	
	var vals = [adjustValue(p1.x / SIZE), adjustValue(1 - p1.y / SIZE), adjustValue(p2.x / SIZE), adjustValue(1 - p2.y / SIZE)];
	var cubez = 'cubic-bezier(' + vals.join(',')+')'
	$clipBoard.innerText = cubez;
	setTransitionFn(cubez);
}

window.onload = initApp