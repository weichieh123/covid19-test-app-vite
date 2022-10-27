import req from './api';

export const downloadFile = () => {
  // console.log('downloadFile Api');
  return req('get', '/Datasets/Download.ashx?rid=A21030000I-D03001-001&l=https://data.nhi.gov.tw/resource/Nhi_Fst/Fstdata.csv');
};

