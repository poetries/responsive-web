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
    //吸顶盒
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
    // 倒计时
    //设置结束时间
    var endTime = new Date();
    endTime.setFullYear(2017);
    endTime.setMonth(5);
    endTime.setDate(7);
    endTime.setHours(0);
    endTime.setMinutes(0);
    endTime.setSeconds(0);

    var endTimer = endTime.getTime();//获取结束时间
    var secskill_hour = document.getElementById("secskill-hour");
    var secskill_min = document.getElementById("secskill-min");
    var secskill_sec = document.getElementById("secskill-sec");

    //转换时间
    function changeTime(time,obj1,obj2,obj3) {
        var nowTime = new Date();
        var sec = (time - nowTime.getTime())/1000;
        if (sec > 0) {
            var hour = Math.floor(sec/3600);
            sec = sec%3600;//剩下的秒钟
            var min = Math.floor(sec/60); //分钟
            sec = Math.floor(sec%60);//秒钟
            obj1.innerHTML = addZero(hour, 2);
            obj2.innerHTML = addZero(min, 2);
            obj3.innerHTML = addZero(sec, 2);
        } else {
            clearInterval(timer);
        }
    }
    var timer = setInterval(function () {
        changeTime(endTimer, secskill_hour, secskill_min, secskill_sec);
    }, 1000)
    changeTime(endTimer, secskill_hour, secskill_min, secskill_sec);
    
    //补零方法
    function addZero(time,n) {
        var str = '' + time;
        while (str.length < n) {
            str = "0" + time;
        }
        return str;
    }
}