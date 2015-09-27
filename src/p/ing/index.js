/**
* Created by Elfer on 14-1-8.
*/
define(['./mod/items-udt'], function (itemTmp) {
	// var itemTmp = require();
	var uri = '../list.json';

	document.addEventListener('touchstart',function(){},false);

	var offsetpage = 0;
	var cwrapper = document.getElementById('content');
	
	var tool = {
		getNode: function(opt){
			var options = {
				method: 'GET',
				url: './empty_req',
				dataType: 'json',
				data: {},
				timeout: '400',
				scb: function(){},
				fcb: function(){},
				extend: function(data){
					for(var key in data)
						this[key] = data[key];
				} 
			}

			!opt && (opt = {});

			options.extend(opt);

			$.ajax({
				type: options.method,
				url: options.url,
				data: options.data,
				dataType: options.dataType,
				timeout: options.timeout,
				success: options.scb.bind(this),
				fcb: options.fcb.bind(this)
			});
		},
		constructItems: function(data){
			var html = itemTmp(data);

			this.addNode(html);

			!!rock && rock.loadSuccess();
		},
		getListFailed: function(e){
			var errormsg = 'sorry about that!';
			this.addNode(errormsg);
		},
		addNode: function(html){
			var node = document.createElement('div');
			node.id = 'no_' + offsetpage++;
			node.className = 'items';
			node.innerHTML = html;
			cwrapper.appendChild(node);
		},

		lazyload: {
			init: function(){

			}
		}
	};

	var opt = {
		url: uri,
		scb: tool.constructItems,
		fcb: tool.getListFailed
	};

	rock = new lib.scroll({
		loaderNeeded: true,
		content: document.getElementById('content'),
        onscrollbottom : function(){
            tool.getNode(opt);
        }
    });

	tool.getNode(opt);

	tool.lazyload.init();
	return {};
});