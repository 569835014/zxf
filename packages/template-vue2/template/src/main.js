import Vue from 'vue'
import ElementPlugin from '@/plugins/element'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import qs from 'qs'
import VueI18n from 'vue-i18n'
import VueLazyload from 'vue-lazyload'
import enLocale from 'element-ui/lib/locale/lang/en'
import zhLocale from 'element-ui/lib/locale/lang/zh-CN'
import en from '@/languages/en.json';
import zh from '@/languages/zh_CN.json'
import {queryStringParse} from 'assets/util/common'
import Loading from 'components/loading'
import 'assets/styl/reset.styl';
import 'assets/styl/public.styl';
Vue.config.productionTip = false
Vue.use(Loading.directive);
Vue.use(VueI18n)
Vue.use(VueLazyload,{
  preLoad:1,
  error: '',
    attempt: 4,
  adapter:{
    loaded ({ bindType, el, naturalHeight, naturalWidth, $parent, src, loading, error, Init }) {
      if(naturalWidth === 1 || naturalWidth === 0) {
        el.src=''
      }
    },
    /*error (listender, Init) {
      listender.src=require('assets/images/fm.png')
      console.log('error')
    }*/
  }
})
Vue.use(ElementPlugin)
import 'assets/theme/element-variables.scss'
let params = queryStringParse(location.href)
let lang = sessionStorage.getItem("lang")
if(!lang) {
  sessionStorage.setItem("lang","zh_CN")
  lang = "zh_CN"
}
store.commit('SET_LANG',lang)
if(params['pds_handle']) {
  alert(params['pds_handle'])
  let url = ``
  location.href=url
}
document.title = '';

router.beforeEach((to, from, next) => {
  /*if(!store.state.lang) {
    let viewLang = sessionStorage.getItem("lang")
    if(viewLang) {
      store.commit('SET_LANG',lang)
    }
  }*/
  if (!store.state.userInfo) {
    let userInfo = JSON.parse(sessionStorage.getItem('userInfo'))
    if (userInfo == null) {
      userInfo = ""
    }
    store.commit('SET_USER_INFO', userInfo);
    if (!store.state.primoExploreJwt) {
      let token = sessionStorage.getItem('primoExploreJwt')
      if (token == null) {
        token = ""
      }
      store.commit('SET_PRIMO_EXPLORE_JWT', token);
    }
  }
  next();
})

axios.interceptors.request.use((config) => {//拦截器
  if(store.state.primoExploreJwt) {
    config.headers['PrimoAuthorization'] = "Bearer "+store.state.primoExploreJwt
  }

  return config
});
axios.interceptors.response.use((response)=>{
  return response
},error => {
  if(error.response.status === 401) {
    localStorage.clear()
    sessionStorage.clear()
    window.location.reload()
  }
  return Promise.reject(error);
});


(async ()=>{
  let primoExploreJwt = sessionStorage.getItem("primoExploreJwt")
  if(params['ticket']) {
    let res = await axios.get(`/=${params['ticket']}`)
    let result = res.data
    let data = result.data
    if(data.returnflag) {
      delete data.returnflag
      delete data.message
      store.commit('SET_USER_INFO',data)
      sessionStorage.setItem("userInfo",JSON.stringify(data));

      let jwtres =  await axios.post('/',qs.stringify({accountId:data.accountid,lang:'zh_CN'}))
      sessionStorage.setItem("primoExploreJwt",jwtres.data.data)
      store.commit('SET_PRIMO_EXPLORE_JWT', jwtres.data.data)
      let targetUrl = sessionStorage.getItem('targetUrl')
      if(targetUrl) {
        sessionStorage.removeItem('targetUrl')
        router.replace(targetUrl)
      }

    }
  }else{

  }

  if(!primoExploreJwt) {
    let res =  await axios.post('/')
    if(res.data.code === 200) {
      let result = res.data.data.replace(/^\"|\"$/g,'')
      sessionStorage.setItem("primoExploreJwt",result)
      store.commit('SET_PRIMO_EXPLORE_JWT', result)
    }
    let i18n = await translations(lang)
    let configuration = await configurations();
    store.commit('SET_Configuration', configuration)
    if(i18n) {
      new Vue({
        router,
        store,
        i18n,
        render: h => h(App)
      }).$mount('#app')
    }
  }else{
    store.commit('SET_PRIMO_EXPLORE_JWT', primoExploreJwt)
    let i18n = await translations(lang)
    let configuration = await configurations();
    store.commit('SET_Configuration', configuration)
    if(i18n) {
      new Vue({
        router,
        store,
        i18n,
        render: h => h(App)
      }).$mount('#app')
    }
  }
})()
/*系统配置*/
function configurations() {
    return axios.get('/').then((res)=>{
        let result = res.data;
        if(result.code === 200){
            let data = result.data
            return Promise.resolve(data);
        }
    })
}
function translations(lang) {
  return axios.post('/',qs.stringify({
    lang:lang
  })).then((res)=>{
    if(res.data.code === 200) {
      store.commit('SET_TRANSLATIONS_SETTINGS', res.data.data)
      const messages = {
        en: {
          ...Object.assign(res.data.data,en,enLocale)
        },
        zh: {
          ...Object.assign(res.data.data,zh,zhLocale)
        }
      }
      // Create VueI18n instance with options
      const i18n = new VueI18n({
        locale: 'zh', // set locale
        fallbackLocale:'zh',
        messages, // set locale messages
      })
      return Promise.resolve(i18n)
      // ElementLocale.i18n((key, value) => i18n.t(key, value))

    }
    return Promise.resolve(null)
  })
}


