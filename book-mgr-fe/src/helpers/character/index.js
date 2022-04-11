import store from '@/store';

export const isAdmin = () => {
  const uc = store.state.userCharacter;

  return uc.name === 'admin';
};

// 通过id，来获取角色的title~
export const getCharacterInfoById = (id) => {
  const { characterInfo } = store.state;

  const one = characterInfo.find((item) => {
    return item._id === id;
  });

  return one || {
    title: '未知角色',
  };
};
