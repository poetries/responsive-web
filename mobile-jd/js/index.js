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
    var mySwiper1 = new Swiper('.advert-pro1', {
        autoplay: 2000, // 自动轮播
        initialSlide: 0, //初始显示li的索引
        speed: 1000, //滑动速度
        grabCursor: true, //鼠标抓手形状，触屏看不到
        observer: true,//当li节点修改的时候自动更新swiper
        observeParents: true,
        pagination : '.swiper-pagination1', // 小圆点
        loop: true, //无缝滚动
    })
    var mySwiper2 = new Swiper('.advert-pro2', {
        autoplay: 2000, // 自动轮播
        initialSlide: 0, //初始显示li的索引
        speed: 1000, //滑动速度
        grabCursor: true, //鼠标抓手形状，触屏看不到
        observer: true,//当li节点修改的时候自动更新swiper
        observeParents: true,
        pagination : '.swiper-pagination2', // 小圆点
        loop: true, //无缝滚动
    })
    var mySwiper3 = new Swiper('.advert-pro3', {
        autoplay: 2000, // 自动轮播
        initialSlide: 0, //初始显示li的索引
        speed: 1000, //滑动速度
        grabCursor: true, //鼠标抓手形状，触屏看不到
        observer: true,//当li节点修改的时候自动更新swiper
        observeParents: true,
        pagination : '.swiper-pagination3', // 小圆点
        loop: true, //无缝滚动
    })
    var mySwiper4 = new Swiper('.secskill-content', {
        initialSlide: 0, //初始显示li的索引
        speed: 1000, //滑动速度
        grabCursor: true, //鼠标抓手形状，触屏看不到
        observer: true,//当li节点修改的时候自动更新swiper
        observeParents: true,
        slidesPerView: 3,
    })

    var search = document.getElementById('search');
    var goTop = document.getElementById('goTop');
    window.onscroll = function () {
        var h = document.body.scrollTop;
        if(h > 0) {
            search.style.background = "rgba(208,55,67,0.85)";
        } else if(h==0){
            search.style.background = "rgba(0,0,0,0)";
        }
        if (h > 400) {
            goTop.style.display = "block";
        } else {
            goTop.style.display = "none";
        }
    }
    goTop.onclick = function () {
        document.body.scrollTop = 0;
    }
}