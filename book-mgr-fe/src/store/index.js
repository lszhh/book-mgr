import { createStore, Store } from 'vuex';
import { character, user, goodClassify } from '@/service';
import { getCharacterInfoById } from '@/helpers/character';
import { result } from '@/helpers/utils';

export default createStore({
  state: {
    characterInfo: [],
    goodClassify: [],
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
    setGoodClassify(state, goodClassify) {
      state.goodClassify = goodClassify;
    },
  },
  actions: {
    // 全局获取分类信息
    async getGoodClassify(store) {
      const res = await goodClassify.list();

      result(res)
        .success(({data}) => {
          store.commit('setGoodClassify', data);
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
