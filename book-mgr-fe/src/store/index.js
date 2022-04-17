import { createStore, Store } from 'vuex';
import { character, user, bookClassify } from '@/service';
import { getCharacterInfoById } from '@/helpers/character';
import { result } from '@/helpers/utils';

export default createStore({
  state: {
    characterInfo: [],
    bookClassify: [],
    userInfo: {},
    userCharacter: {},
  },
  mutations: {
    // 全局设置角色信息列表
    setCharacterInfo(state, characterInfo) {
      state.characterInfo = characterInfo;
    },
    // 全局设置用户信息
    setUserInfo(state, userInfo) {
      state.userInfo = userInfo;
    },
    // 全局设置当前用户角色
    setUserCharacter(state, userCharacter) {
      state.userCharacter = userCharacter;
    },
    setBookClassify(state, bookClassify) {
      state.bookClassify = bookClassify;
    },
  },
  actions: {
    // 全局获取分类信息
    async getBookClassify(store) {
      const res = await bookClassify.list();

      result(res)
        .success(({data}) => {
          store.commit('setBookClassify', data);
        });
    },
    // 获取角色信息
    async getCharacterInfo(store) {
      const res = await character.list();

      result(res)
        .success(({ data }) => {
          store.commit('setCharacterInfo', data);
        });
    },
    // 获取用户信息
    async getUserInfo(store) {
      const res = await user.info();

      result(res)
        .success(({ data }) => {
          store.commit('setUserInfo', data);
          store.commit('setUserCharacter', getCharacterInfoById(data.character));
        });
    },
  },
});
