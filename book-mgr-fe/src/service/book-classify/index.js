import {
  del, post, get
} from '@/helpers/request';

export const add = (title) => {
  return post('/book-classify/add', {
    title,
  });  
};

export const list = () => {
  return get('/book-classify/list');
};

export const remove = (id) => {
  return del(`/book-classify/${id}`);
};

export const updateTitle = (id, title) => {
  return post('/book-classify/update/title', {
    id,
    title,
  });
};
