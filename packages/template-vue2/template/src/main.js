import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import ElementComponent from "@/common/plugins/element-component.js";
import subscribe from "@/common/plugins/Subscribe.js";
Vue.prototype.$subscribe = subscribe;
Vue.use(ElementComponent);
Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
