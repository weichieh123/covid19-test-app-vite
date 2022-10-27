/* eslint-disable no-dupe-keys */
import axios from 'axios';

// https://data.nhi.gov.tw/Datasets/Download.ashx?rid=A21030000I-D03001-001&l=https://data.nhi.gov.tw/resource/Nhi_Fst/Fstdata.csv
const instance = axios.create({
  baseURL: 'https://data.nhi.gov.tw',
  responseType: 'blob',
  timeout: 20000,
});

instance.interceptors.request.use({
  function(config) {
    return config;
  },
  function(error) {
    return Promise.reject(error);
  },
});

instance.interceptors.response.use({
  function(response) {
    return response;
  },
  function(error) {
    if (error.response) {
      switch (error.response.status) {
        case 404:
          console.log('找不到頁面');
          break;
        case 500:
          console.log('發生問題');
          break;
        default:
          console.log(error.message);
      }
    }
    if (!window.navigator.onLine) {
      alert('網路出了點問題，請重新連線');
      return;
    }
    return Promise.reject(error);
  },
});

// 封裝請求
export default function (method, url, data = null, config) {
  method = method.toLowerCase();
  switch (method) {
    case 'post':
      return instance(url, data, config);
    case 'get':
      return instance(url, { params: data });
    case 'delete':
      return instance.delete(url, { params: data });
    case 'put':
      return instance.put(url, data);
    case 'patch':
      return instance.patch(url, data);
    default:
      console.log(`未知的method: ${method}`);
      return false;
  }
}
