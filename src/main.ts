import { createApp } from 'vue'
import App from './App.vue'

import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';

import "./styles/index.scss";

import VMdEditor from '@kangc/v-md-editor';
import '@kangc/v-md-editor/lib/style/base-editor.css';
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js';
import '@kangc/v-md-editor/lib/theme/style/github.css';
VMdEditor.use(githubTheme);

// console.log(VMdEditor);

import router from "./router";
import store from "./store";

const app = createApp(App);

app.use(VMdEditor);
app.use(router);
app.use(store);
app.use(Antd);
app.mount('#app');