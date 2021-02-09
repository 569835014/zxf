import {mapGetters,mapActions} from "vuex";

export default {
    computed:{
        ...mapGetters(['userInfo'])
    },
    methods:{
        logOut(){
            sessionStorage.removeItem("userInfo");//name是存入的session的名字
            sessionStorage.removeItem("primoExploreJwt");
            this.setUserInfo('')
            this.setprimoExploreJwt('')
            this.$router.push('/');
            location.reload()
        },
        //去抖
        debounce(fn, delay){
            let timer   = null;
            return function () {
                let args = arguments;
                let context = this;
                if (timer) {
                    clearTimeout(timer);
                    timer = setTimeout(function () {
                        fn.apply(context, args);
                    }, delay);
                } else {
                    timer = setTimeout(function () {
                        fn.apply(context, args);
                    }, delay);
                }
            }
        },
        ...mapActions(['setUserInfo','setprimoExploreJwt'])
    }
}
