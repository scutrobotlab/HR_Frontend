import axios from 'axios'

//------------------请求拦截-------------------//
axios.interceptors.request.use(config => {
  let isAdminUrl = config.url.indexOf("/api/admin") !== -1;
  let tokenKey = isAdminUrl ? "admin-token" : "applicant-token"

  // 若存在token则带token
  let token = window.localStorage.getItem(tokenKey)
  if (token) {
    config.headers['Authorization'] = token
  }
  return config;
}, err => {
  console.error("请求拦截 => ", err);
  return err;
})

//------------------响应拦截-------------------//
axios.interceptors.response.use(resp => {
  return resp;
}, err => {
  console.error("响应拦截 => ", err);
  let resp = err.response;
  let isAdminUrl = resp.config.url.indexOf("/api/admin") !== -1;
  if (resp.status === 401) {
    if (isAdminUrl) {
      window.location.href = "/admin/login"
    } else {
      window.location.href = "/joinus?login=1";
    }
  }
  return err;
})
