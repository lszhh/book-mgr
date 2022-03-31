import { defineComponent, reactive } from 'vue';
import { good } from '@/service';
import { message } from 'ant-design-vue';
import store from '@/store';
// clone深拷贝方法
import { result, clone } from '@/helpers/utils';


// 设置一个默认的FormData用于置空表单
const defaultFormData = {
  name: '',
  price: 0,
  producedDate: 0,
  expirationDate: 0,
  classify: '',
  count: '',
};

export default defineComponent({
  props: {
    show: Boolean,
  },
  setup(props, context) {
    const addForm = reactive(clone(defaultFormData));

    if (store.state.goodClassify.length) {
      addForm.classify = store.state.goodClassify[0]._id;
    }

    // 弹框Cancel按钮触发时要做的事情
    const close = () => {
      // 更新show属性，更新为false
      context.emit('update:show', false);
    };

    // 弹框OK按钮触发时要做的事情
    const submit = async () => {
      // 深拷贝一份数据
      const form = clone(addForm);
      // 日期默认为moment类型，通过valueOf转换为时间戳
      form.producedDate = addForm.producedDate.valueOf();
      // 调用service下的接口中的add方法，并把表单数据传递过去服务器
      // 传过去后就可以拿到服务端相应的数据为res
      const res = await good.add(form);

      result(res)
        .success((d, { data }) => {
          // 往addForm合并数组，达到清空表单的效果
          Object.assign(addForm, defaultFormData);
          message.success(data.msg);

          context.emit('getList');

          close();
      });
    };

    return {
      addForm,
      submit,
      props,
      close,
      store: store.state,
    };
  },
});
