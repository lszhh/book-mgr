// 定义一个key,而token就是对应的value!
const TOKEN_STORAGE_KEY = '_tt';

// 获取token
export const getToken = () => {
  // localStorage是本地存储
  return localStorage.getItem(TOKEN_STORAGE_KEY) || '';
};

// 设置token
export const setToken = (token) => {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);

  return token;
};
