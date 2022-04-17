import { defineComponent, reactive, watch } from 'vue';
import { book } from '@/service';
import { message } from 'ant-design-vue';
import { result, clone } from '@/helpers/utils';
import moment from 'moment';
import store from '@/store';

export default defineComponent({
  props: {
    show: Boolean,
    book: Object,
  },
  setup(props, context) {
    const editForm = reactive({
      name: '',
      price: 0,
      producedDate: '',
      expirationDate: '',
      classify: '',
    });

    const close = () => {
      context.emit('update:show', false);
    };

    // 监听接收到的数据是否发生变化
    watch(() => props.book, (current) => {
      // 若变化将数据合并到editForm中进行展示
      Object.assign(editForm, current);
      // 处理日期数据，转换为moment对象
      editForm.producedDate = moment(Number(editForm.producedDate));
    });

    const submit = async () => {
      const res = await book.update({
        id: props.book._id,
        name: editForm.name,
        price: editForm.price,
        expirationDate: editForm.expirationDate,
        producedDate: editForm.producedDate.valueOf(),
        classify: editForm.classify,
      });

      result(res)
      // 修改完成后的展示，都放在success这个逻辑下
        .success(({ AfterData, msg }) => {
          // 触发自定义事件，完成数据的合并，展示在页面中
          context.emit('update', AfterData);
          message.success(msg);
          // 修改后自动关闭弹框
          close();
        });
    };

    return {
      editForm,
      submit,
      props,
      close,
      // 分类信息返回到模板中使用，至于怎么添加，已经是index.js发送请求到后端时已经完成的了！
      store: store.state,
    };
  },
});
