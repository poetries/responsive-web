window.onload = function () {
    var mySwiper = new Swiper('.slider-touch', {
        autoplay: 2000, // 自动轮播
        initialSlide: 0, //初始显示li的索引
        autoplayDisableOnInteraction: false, //手机触屏滑动之后，重新开启自动轮播
        speed: 1000, //滑动速度
        grabCursor: true, //鼠标抓手形状，触屏看不到
        observer: true,//当li节点修改的时候自动更新swiper
        observeParents: true,
        pagination : '.swiper-pagination', // 小圆点
        loop: true, //无缝滚动
    })


}