import 'element-ui/lib/theme-chalk/index.css';
import ElementLocale from 'element-ui/lib/locale'
import {
    Message,MessageBox,
    Row,Col,Button,Input, Select ,Option,DatePicker,Dialog,Form,FormItem,
    RadioGroup,Radio,CheckboxGroup,CheckboxButton,Checkbox,
    Table,TableColumn,RadioButton,Pagination,InputNumber
} from 'element-ui';
const components = [
    Row,Col,Button,Input, Select ,Option,DatePicker,Dialog,Form,FormItem,
    RadioGroup,Radio,CheckboxGroup,CheckboxButton,Checkbox,
    Table,TableColumn,RadioButton,Pagination,InputNumber
]
export default {
    install(Vue) {
        components.forEach((component)=>{
            Vue.use(component)
        })
        Vue.prototype.$message = Message;
        Vue.prototype.$confirm = MessageBox.confirm;
        Vue.prototype.$alert = MessageBox.alert;
    }
}