import {
  del, post, get
} from '@/helpers/request';

export const list = (page = 1, size = 20, keyword = '') => {
  return get(
    '/user/list',
    {
      page,
      size,
      keyword,
    },
  );
};

export const remove = (id) => {
  return del(`/user/${id}`);
};

export const add = (account, password, character) => {
  return post('/user/add', {
    account,
    password,
    character,
  });
};

// 重置密码
export const resetPassword = (id) => {
  return post('/user/reset/password', {
    id,
  });
};

// 修改角色请求
export const editCharacter = (characterId, userId) => {
  return post('/user/update/character', {
    character: characterId,
    userId: userId,
  });
};

export const info = () => {
  return get('/user/info');
};

export const addMany = (key) => {
  return post('/user/addMany', {
    key,
  });
};
