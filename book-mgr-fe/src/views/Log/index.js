import { defineComponent, onMounted, ref } from 'vue';
import { log } from '@/service';
import { result, formatTimestamp } from '@/helpers/utils';
import { getLogInfoByPath } from '@/helpers/log';
import { message } from 'ant-design-vue';

export default defineComponent({
  props: {
    simple: Boolean,
  },
  setup(props) {
    const curPage = ref(1);
    const total = ref(0);
    const list = ref([]);
    const loading = ref(true);

    const columns = [
      {
        title: '用户名',
        dataIndex: 'user.account',
      },
      {
        title: '动作',
        dataIndex: 'action',
      },
      {
        title: '记录时间',
        slots: {
          customRender: 'createdAt',
        },
      },
    ];

    if (!props.simple) {
      columns.push({
        title: '时间戳',
        slots: {
          customRender: 'timeStamp',
        },
      });
    }

    if (!props.simple) {
      columns.push({
        title: '操作',
        slots: {
          customRender: 'action',
        },
      });
    }

    

    const getList = async () => {
      loading.value = true;
      // 调用接口，传递当前是哪页，要几条数据
      const res = await log.list(curPage.value, 20);
      loading.value = false;

      result(res)
        .success(({ data: { list: l, total: t } }) => {
          l.forEach((item) => {
            item.action = getLogInfoByPath(item.request.url);
          });
          // 赋值后才能返回模板中，绑定数展示！
          list.value = l;
          total.value = t;
        });
    };

    // 一挂载就获取页面
    onMounted(() => {
      getList();
    });

    // 切页
    const setPage = (page) => {
      curPage.value = page;
      getList();
    };

    // 删除日志操作
    const remove = async ({ _id }) => {
      const res = await log.remove(_id);

      result(res)
        .success(({ msg }) => {
          message.success(msg);
          getList();
        });
    };

    return {
      curPage,
      total,
      list,
      columns,
      setPage,
      loading,
      formatTimestamp,
      remove,
      simple: props.simple,
    };
  },
});
