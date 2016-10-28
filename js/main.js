var maskModal = Vue.component('maskmodal', {
    template: '#mask_template',
    props: ['show','islogin','signdays','prize1','prize2','prize3'],
    data: function(){
        return {
            yuequanNum: '0阅券',
            liuliangNum: '0M',
            flowType: 0,
            phoneNum: ''
        };
    },
    methods: {
        postPick: function (type) {
            var self = this;
            this.flowType = type;

            if(localStorage.getItem('PICK_PHONE_NUM')){
                this.phoneNum = localStorage.getItem('PICK_PHONE_NUM');
            }else{
                this.phoneNum = '';
            }

            Local.reqaObj(server()+'pkg161001/pick?pickType='+type, function(data) {
                if(data.code === 1 || data.code === -3){
                    if(type === 1){
                        self.yuequanNum = data.prizeName;
                        $('.yuequan-picked').addClass('active');
                        self.prize1 = 1;
                        pgvSendClick({hottag:'ISD.SHOW.INDEX.PICK1'});
                    }else if(type === 2){
                        self.liuliangNum = '50M';
                        $('.ll-img').eq(0).addClass('active');
                        $('.liuliang-picking').addClass('active');
                        pgvSendClick({hottag:'ISD.SHOW.INDEX.PICK2'});
                    }else{
                        self.liuliangNum = '100M';
                        $('.ll-img').eq(1).addClass('active');
                        $('.liuliang-picking').addClass('active');
                        pgvSendClick({hottag:'ISD.SHOW.INDEX.PICK3'});
                    }
                }else if(data.code === -1){
                    $('.mask-picked.failed').addClass('active');
                }else if(data.code === -4){
                    self.overMask = true;
                }else{
                    self.showMask = false;
                    Local.showToast(data.msg);
                }
            }, [], function() {
                  $('.mask-c.error').addClass('active');
            }, 1);

        },
        closeMask: function () {
            this.show = false;
            $('.mask-c').removeClass('active');
            $('.ll-img').removeClass('active');
            $('.tel-tip').removeClass('tel-picked').html('仅限中国移动、联通、电信用户');
        },
        pickFlow: function () {
            // 先检查手机号
            var self = this;
            if(this.islogin){
                if(this.checkPhoneNum(this.phoneNum)){
                    Local.reqaObj(server()+'pkg161001/pick2?pickType='+self.flowType+'&phoneNumber='+self.phoneNum, function(data) {
                        if(data.code===1){
                            $('.mask-c').removeClass('active');
                            $('.mask-picked.suc').addClass('active');
                            if(self.flowType===2){
                                self.prize2 = 1;
                                pgvSendClick({hottag:"ISD.SHOW.INDEX.PICKLL50"});
                            }
                            if(self.flowType===3){
                                self.prize3 = 1;
                                pgvSendClick({hottag:"ISD.SHOW.INDEX.PICKLL100"});
                            }

                            localStorage.setItem('PICK_PHONE_NUM', self.phoneNum);

                        }else if(data.code === -4){
                            self.overMask = true;
                        }else{
                            Local.showToast(data.msg);
                        }
                    }, [], function() {
                        Local.showToast('网络异常，请稍候重试');
                    }, 1);

                }else{
                    $('.tel-tip').addClass('tel-picked').html('手机号码错误，请重新输入');
                }
            }else{
                Local.login();
            }

        },
        checkPhoneNum: function (num) {
            var PATTERN_CHINAMOBILE = /^1(3[4-9]|5[012789]|8[23478]|4[7]|7[8])\d{8}$/;//移动
            var PATTERN_CHINAUNICOM =/^1(3[0-2]|5[56]|8[56]|4[5]|7[6])\d{8}$/;//联通
            var PATTERN_CHINATELECOM =/^1(3[3]|5[3]|8[019]|7[7])\d{8}$/;//电信
            return (PATTERN_CHINAMOBILE.test(num) || PATTERN_CHINAUNICOM.test(num) || PATTERN_CHINATELECOM.test(num));
        }
    }
});

var app = new Vue({
    el:'#app',
    data:{
        signArray: [0, 0, 0, 0, 0, 0 ,0],
        showMask: false,
        overMask: false,
        //init
        isLogin: false,
        isVip: false,
        hasSignIn: false,//false 今天未签到， true 今天已签到
        signDays: 0,//签到的天数
        prize1: 0,  //0 表示未领取，1表示已领取
        prize2: 0,
        prize3: 0,
        last50: 999,
        last100: 999
    },
    methods: {
        initPage: function () {
            var self = this;
            //初始化init,获取数据
            Local.reqaObj(server()+'pkg161001/init', function(data) {
                if(data.code === -4){
                    //活动结束
                    self.overMask = true;
                }else if(data.code === -2){
                    self.isLogin = false;
                }else if(data.code === 1){
                    window.console.log(data);
                    self.isLogin = data.isLogin;
                    self.isVip = data.isVip;
                    self.hasSignIn = data.hasSignIn;
                    self.signDays = data.signDays;
                    self.prize1 = data.prize1;
                    self.prize2 = data.prize2;
                    self.prize3 = data.prize3;
                    self.last50 = data.last50;
                    self.last100 = data.last100;

                    //更新头图进度
                    self.lightWay();
                }
            }, [], function() {
                Local.showToast('网络异常，请稍候重试');
            }, 1);

            forceLog(param('act_f'),'DKinit');
        },
        //点亮签到几次的亮点
        lightWay: function () {
            this.signArray = [0, 0, 0, 0, 0, 0 ,0];
            for(var i = 0; i < this.signDays; i++){
                this.signArray[i] = 1;
            }
        },
        //点击打卡按钮
        signHandel: function(e){
            var self = this;
            if(!$(e.currentTarget).hasClass('active')){
                if(this.isLogin){
                    Local.reqaObj(server()+'pkg161001/sign', function(data) {
                        console.log('打卡', data);
                        if(data.code===-2){
                            Local.login(); // 再次处理未登录
                        }else if(data.code === -4){
                            self.overMask = true; //不在活动时间
                        }else if(data.code===1){
                            self.signDays++; //签到天数+1
                            self.lightWay(); //更新点亮签到进度way
                            self.hasSignIn = true; //将当天签到状态置为true
                        }
                    }, [], function() {
                        Local.showToast('网络异常，请稍候重试');
                    }, 1);
                    //点击打卡签到 埋点
                    forceLog(param('act_f'),'DKsignbtn');
                    pgvSendClick({hottag:'ISD.SHOW.INDEX.SIGN'});
                }else{
                    Local.login();
                }
            }

        },
        pickHandel: function (e) {
            if(this.isLogin){
                var maskModal = this.$children[0];
                var $cur = $(e.currentTarget);
                if($cur.parent().parent().parent().hasClass('picking')){
                    this.showMask = true;
                    var type = $cur.data('type');

                    //触发一级领取
                    maskModal.postPick(type);
                }
            }else{
                Local.login();
            }

        }

    },
    created: function() {
        document.body.addEventListener('touchstart', function () {});
        //页面初始化
        this.initPage();
        if(this.signDays >= 7){
            this.hasSignIn = true;
        }
    }
});