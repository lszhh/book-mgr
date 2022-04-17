import {
  del, post, get
} from '@/helpers/request';

export const add = (form) => {
  return post(
    '/book/add',
    form,
  );
};

export const list = (data) => {
  return get(
    '/book/list',
    data
  );
};

export const remove = (id) => {
  return del(
    `/book/${id}`,
  );
};

export const updateCount = (data = {}) => {
  return post(
    `/book/update/count`,
    data,
  );
};

export const update = (data = {}) => {
  return post(
    `/book/update`,
    data,
  );
};

export const detail = (id) => {
  return get(
    `/book/detail/${id}`,
  );
};

export const addMany = (key) => {
  return post('/book/addMany', {
    key,
  });
};

// 获取库存信息
export const getBookStore = () => {
  return get('/book/getStore')
}