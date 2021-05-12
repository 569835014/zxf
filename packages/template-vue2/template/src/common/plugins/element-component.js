/**
 * 把按需加载element组件封装一下
 */
import { Button, Select } from "element-ui";
export default {
  install(Vue) {
    Vue.use(Button);
    Vue.use(Select);
  },
};
