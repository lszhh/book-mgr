import { defineComponent, reactive } from 'vue';
import { user } from '@/service';
import { message } from 'ant-design-vue';
import { result, clone } from '@/helpers/utils';
import store from '@/store';

const defaultFormData = {
  account: '',
  password: '',
  character: '',
};

export default defineComponent({
  props: {
    show: Boolean,
  },
  setup(props, context) {
    // 获取角色列表的信息
    const { characterInfo } = store.state;

    const addForm = reactive(clone(defaultFormData));

    // 设置默认的角色，该id是数据库中角色的id，比如成员对应12345，管理员对应789
    addForm.character = characterInfo[1]._id;

    const close = () => {
      context.emit('update:show', false);
    };

    const submit = async () => {
      const form = clone(addForm);

      const res = await user.add(form.account, form.password, form.character);

      result(res)
        .success((d, { data }) => {
          Object.assign(addForm, defaultFormData);
          message.success(data.msg);
          close();
          context.emit('getList');
        });
    };

    return {
      addForm,
      submit,
      props,
      close,
      characterInfo,
    };
  },
});
