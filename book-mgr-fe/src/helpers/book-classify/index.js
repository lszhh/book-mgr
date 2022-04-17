import store from '@/store';

// 获取书籍分类列表
export const getClassifyTitleById = (id) => {
  const one = store.state.bookClassify.find((item) => (item._id === id));

  return one && one.title || '未知分类';
};
