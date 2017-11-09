(function(){
	var originalInit = YAMP.initPage || function(){};
	YAMP.initPage = function(){
		$(window).on('scroll',function(e){
			var nav = $('nav'),
				scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;

			if (scrollTop > 100) {
				nav.removeClass('navbar-transparent');
			} else {
				nav.addClass('navbar-transparent');
			}
		});
		
		$(window).trigger('scroll');
		originalInit && originalInit.call();
		originalInit = null;
	};
})()