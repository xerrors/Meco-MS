import router from '../router'
import { message } from 'ant-design-vue'
import axios from 'axios'
import Cookies from 'js-cookie'

axios.defaults.timeout = 600000 // 请求超时时间 10min

// axios.defaults.baseURL = (process.env.NODE_ENV === 'production') ? '' : '/api'
// axios.defaults.baseURL = '/api'

// 请求拦截器
axios.interceptors.request.use(
  config => {
    return config
  },
  error => {
    // Do something with request error
    Promise.reject(error)
  }
)

/** 1001: 需要登陆 */

// 响应拦截器
axios.interceptors.response.use(
  response => {
    if (response.data.code === 2000) {
      if (Cookies.get('logged')) {
        message.error("登录超时，请重新登陆~")
        // Cookies.remove('logged')
        router.push('/login');
      }
      return Promise.reject(new Error('未登录'))
    }
    return response
  },
  error => {
    return Promise.reject(error)
  }
)


export default axios