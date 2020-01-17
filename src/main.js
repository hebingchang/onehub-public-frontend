import Vue from 'vue'
import App from './App.vue'
import { Button, message, Tree, Row, Col, Layout, Modal, Icon, Breadcrumb, Spin, Empty } from 'ant-design-vue';
import router from './router'
import store from './store'
import consts from "./consts.js";
import axios from 'axios'
import VueAxios from 'vue-axios'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faArrowLeft, faArrowRight, faArrowUp, faArrowDown, faFolder, faFile, faFileAlt, faFileArchive, faFileAudio, faFileCode, faFileContract, faFileCsv, faFileDownload, faFileExcel, faFileExport, faFileImage, faFileImport, faFileInvoice, faFileInvoiceDollar, faFileMedical, faFileMedicalAlt, faFilePdf, faFilePowerpoint, faFilePrescription, faFileSignature, faFileUpload, faFileVideo, faFileWord } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import 'ant-design-vue/dist/antd.less'
library.add(faArrowLeft)
library.add(faArrowRight)
library.add(faArrowUp)
library.add(faArrowDown)
library.add(faFile)
library.add(faFolder)
library.add(faFileAlt)
library.add(faFileArchive)
library.add(faFileAudio)
library.add(faFileCode)
library.add(faFileContract)
library.add(faFileCsv)
library.add(faFileDownload)
library.add(faFileExcel)
library.add(faFileExport)
library.add(faFileImage)
library.add(faFileImport)
library.add(faFileInvoice)
library.add(faFileInvoiceDollar)
library.add(faFileMedical)
library.add(faFileMedicalAlt)
library.add(faFilePdf)
library.add(faFilePowerpoint)
library.add(faFilePrescription)
library.add(faFileSignature)
library.add(faFileUpload)
library.add(faFileVideo)
library.add(faFileWord)
Vue.config.productionTip = false

Vue.use(Button)
Vue.use(Tree)
Vue.use(Row)
Vue.use(Col)
Vue.use(Layout)
Vue.use(Modal)
Vue.use(Icon)
Vue.use(Breadcrumb)
Vue.use(Spin)
Vue.use(Empty)
Vue.use(VueAxios, axios)
Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.prototype.$message = message

axios.get(consts.API_BASE + "/api/v1/public/config").then(res => {
  Vue.prototype.$config = res.data.data;
  new Vue({
    router,
    store,
    render: h => h(App)
  }).$mount('#app')
});