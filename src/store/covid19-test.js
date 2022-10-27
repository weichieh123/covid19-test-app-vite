import req from './api';

export const downloadFileFcn = () => {
  return req('get', '/Datasets/Download.ashx?rid=A21030000I-D03001-001&l=https://data.nhi.gov.tw/resource/Nhi_Fst/Fstdata.csv');
};

