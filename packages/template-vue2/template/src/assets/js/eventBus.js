import Vue from 'vue';
let bus = new Vue();
Vue.prototype.$eventBus = bus;
export default bus;
