import { defineComponent, ref, onMounted } from 'vue';
import { bookClassify } from '@/service';
import { result } from '@/helpers/utils';
import { message, Modal, Input } from 'ant-design-vue';

const columns = [
  {
    title: '分类',
    dataIndex: 'title',
  },
  {
    title: '操作',
    slots: {
      customRender: 'actions',
    },
  },
];

export default defineComponent({
  setup() {
    const title = ref('');
    const list = ref([]);

    const getList = async () => {
      const res = await bookClassify.list();

      result(res)
        .success(({ data }) => {
          list.value = data;
        });
    };

    // 添加分类
    const add = async () => {
      const res = await bookClassify.add(title.value);

      result(res)
        .success(() => {
          getList();
          title.value = '';
        });
    };

    onMounted(() => {
      getList();
    });

    const remove = async ({ _id }) => {
      const res = await bookClassify.remove(_id);

      result(res)
        .success(({ msg }) => {
          message.success(msg);

          getList();
        });
    };

    const updateTitle = async ({ _id }) => {
      Modal.confirm({
        title: '请输入新的分类名称',
        content: (
          <div>
            <Input class="__book_classify_new_title" />
          </div>
        ),
        onOk: async () => {
          const title = document.querySelector('.__book_classify_new_title').value;

          // 完成数据库的修改
          const res = await bookClassify.updateTitle(_id, title);

          result(res)
            .success(({ msg }) => {
              message.success(msg);
              // 直接改list的值，完成页面的展示，避免再发一次额外的请求
              list.value.forEach((item) => {
                if (item._id === _id) {
                  item.title = title;
                }
              });
            });
        },
      });
    };

    return {
      add,
      title,
      list,
      columns,
      remove,
      updateTitle,
    };
  },
});
