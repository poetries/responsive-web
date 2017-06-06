(function(win){
	var docEl = win.document.documentElement;
	var timer = '';
	function changeRem(){
		var width = docEl.getBoundingClientRect().width;
		if (width > 540)//最大宽度，若果兼容到ipad的话把这个去掉就行
		{
			width = 540;
		}
		var fontS = width/10;//把设备宽度10等分 等同于用vw来做
		docEl.style.fontSize = fontS + "px";
	}
	//页面尺寸发生改变的时候就再执行changeRem
	win.addEventListener("resize",function(){
		clearTimeout(timer);
		timer = setTimeout(changeRem,30);
	},false);
	//页面加载的时候，若果是调用缓存的话就再执行changeRem
	win.addEventListener("pageshow",function(e){
		if (e.persisted)//缓存
		{
			clearTimeout(timer);
			timer = setTimeout(changeRem,30);
		}
	},false);
	changeRem();
})(window)