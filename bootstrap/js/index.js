/**
 * Created by poetries on 2016/11/18.
 */

$(window).bind("scroll",function () {
    var navH = $(window).height()-400;
    var scrollTop = $(window).scrollTop();
    scrollTop > navH ? $("#g-topbar").addClass("on"):$("#g-topbar").removeClass("on");

});


$(".team-member").owlCarousel({
    slideSpeed:200,
    paginationSpeed:400,
    items : 4,
    lazyLoad : true
});



var $container = $("#lightBox");
$container.isotope({
    filter:"*",
    animationOptions:{
        duration:750,
        easing:"linear"
    }

});
$('body').scrollspy({
    target: '.navbar-default',
    offset: 80
});
$("a.page-scroll").click(function () {
    $(this).parents().addClass("active").siblings().removeClass("active");
    if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
        var target = $(this.hash);
        target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
        if (target.length) {
            $('html,body').animate({
                scrollTop: target.offset().top - 40
            }, 900);
            return false;
        }
    }
});

$(".cate-title .type a").mouseover(function () {

    $(this).addClass("active").parent().siblings().find("a").removeClass("active");
    var selector = $(this).attr("data-filter");
    $container.isotope({
        filter:selector,
        animationOptions:{
            duration:750,
            easing:"linear"
        }
    });
    return false;
});