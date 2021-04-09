// import request from '@/utils/request'

// import axios from 'axios'
// // import { Message, MessageBox } from 'element-ui'
// import store from '../store'
// // import { getToken } from '@/utils/cookies'

// // 创建axios实例
// // axios.defaults.baseURL = 'http://122.51.229.4/CollegeInnovation/invokeAPI/'// api 的 base_url
// axios.defaults.timeout = 50000 // 请求超时时间
// axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'
// // request拦截器
// axios.interceptors.request.use(
//   config => {
//     if (store.getters.token) {
//       config.headers.token = getToken() // 让每个请求携带自定义token 请根据实际情况自行修改
//     }
//     return config
//   },
//   error => {
//     // Do something with request error
//     // cosole.log(error) // for debug
//     Promise.reject(error)
//   }
// )

// const successCode = 1
// // response 拦截器
// axios.interceptors.response.use(
//   response => {
//     /**
//      * code为非 1 是抛错 可结合自己业务进行修改
//      */
//     const res = response.data
//     // console.log(response)
//     if (res.code !== successCode) {
//       Message({
//         message: 'CODE ERROR:' + res.info,
//         type: 'error',
//         duration: 5 * 1000
//       })

//       // 注：10001 为全局状态码
//       if (res.code === 10001) {
//         MessageBox.confirm(
//           '你已被登出，可以取消继续留在该页面，或者重新登录',
//           '确定登出',
//           {
//             confirmButtonText: '重新登录',
//             cancelButtonText: '取消',
//             type: 'warning'
//           }
//         ).then(() => {
//           store.dispatch('FedLogOut').then(() => {
//             location.reload() // 为了重新实例化vue-router对象 避免bug
//           })
//         })
//       }
//       return Promise.reject(new Error('error'))
//     } else {
//       // 对返回类型进行判断是否弹出信息
//       if (typeof (res.info) === 'string') {
//         Message({
//           message: res.info,
//           type: 'success',
//           duration: 5 * 1000
//         })
//       }
//       return response.data
//     }
//   },
//   error => {
//     // 当请求连接不通的时候
//     // cosole.log('error' + error) // for debug
//     Message({
//       message: 'CAN NOT CONNECT:' + error.message,
//       type: 'error',
//       duration: 5 * 1000
//     })
//     return Promise.reject(error)
//   }
// )

// export default axios