import axios from 'axios';
import { getToken } from '@/helpers/token';

const domain = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000';

// 获取地址
const getURL = (path) => {
  return `${domain}${path}`;
};

// 获取默认头
export const getHeaders = () => {
  return {
    Authorization: `Bearer ${getToken()}`,
  };
};

// 
export const post = (url, data = {}) => {
  return axios.post(getURL(url), data, {
    headers: getHeaders(),
  });
};

export const del = (url) => {
  return axios.delete(getURL(url), {
    headers: getHeaders(),
  });
};

export const get = (url, data = {}) => {
  return axios.get(getURL(url), {
    params: data,
    headers: getHeaders(),
  })
};
