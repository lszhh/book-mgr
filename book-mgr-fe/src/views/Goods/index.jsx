import { defineComponent, ref, onMounted } from 'vue';
import { good, goodClassify } from '@/service';
import { useRouter } from 'vue-router';
import { message, Modal, Input } from 'ant-design-vue';
import { result, formatTimestamp } from '@/helpers/utils';
import { getHeaders } from '@/helpers/request';
import { getClassifyTitleById } from '@/helpers/good-classify';
import AddOne from './AddOne/index.vue';
import _ from '@/config/common';
import Update from './Update/index.vue';

// 引入添加书籍弹框组件
export default defineComponent({
  components: {
    AddOne,
    Update,
  },
  props: {
    simple: Boolean,
  },
  setup(props) {
    const router = useRouter();

    const columns = [
      {
        title: `${_.KEYWORD}名`,
        dataIndex: 'name',
      },
      {
        title: '出版社',
        dataIndex: 'expirationDate',
      },
      {
        title: '价格',
        dataIndex: 'price',
      },
      {
        title: '存量',
        slots: {
          customRender: 'count',
        },
      },
      {
        title: '出版日期',
        dataIndex: 'producedDate',
        // 自定义插槽slots，名字为producedDate！
        slots: {
          customRender: 'producedDate',
        },
      },
      {
        title: '分类',
        slots: {
          customRender: 'classify',
        },
      },
    ];

    if (!props.simple) {
      columns.push({
        title: '操作',
        slots: {
          customRender: 'actions',
        },
      });
    }

    // 添加弹框的显示与隐藏标记
    const show = ref(false);
    // 修改弹框的显示与隐藏标记
    const showUpdateModal = ref(false);
    const list = ref([]);
    const total = ref(0);
    const curPage = ref(1);
    // 搜索框的值
    const keyword = ref('');
    // 标记，返回按钮的显示与隐藏
    const isSearch = ref(false);
    const curEditGood = ref({});

    // 获取商品列表
    const getList = async () => {
      // 调用list接口
      const res = await good.list({
        page: curPage.value,
        size: 10,
        keyword: keyword.value,
      });

      result(res)
        .success(({ data }) => {
          const { list: l, total: t } = data;
          // 模板中的dataSource = list，所以直接list.value就可以
          // 展示书籍数据了
          list.value = l;
          total.value = t;
        });
    };

    // 当组件被挂载/显示出来时候，就去获取列表，用getList()方法
    onMounted(async () => {
      getList();
    });

    // 页面改变时才会调用的函数setPage
    // 设置页码
    // 切页
    const setPage = (page) => {
      curPage.value = page;

      getList();
    };

    // 触发搜索
    const onSearch = () => {
      getList();

      // 返回按钮显示与隐藏的标识，这么写是为了解决点击搜索框后，返回按钮还存在的bug 
      // 字符串非空的时候 -> true
      // 字符串为空的时候 -> false
      isSearch.value = Boolean(keyword.value);
    };

    // 回到全部列表
    const backAll = () => {
      keyword.value = '';
      isSearch.value = false;

      getList();
    };

    // 删除一本书
    const remove = async ({ text: record }) => {
      const { _id } = record;

      const res = await good.remove(_id);

      result(res)
        .success(({ msg }) => {
          message.success(msg);
          getList();
        });
    };

    // 出入库
    const updateCount = (type, record) => {
      let word = '增加';

      if (type === 'OUT_COUNT') {
        word = '减少';
      }

      Modal.confirm({
        title: `要${word}多少库存`,
        // 这段东西叫jsx，是react框架中经常应用来描述模板，vue能用是因为集成好了相关插件
        content: (
          <div>
            <Input class="__good_input_count" /> 
          </div>
        ),
        // 弹框点击OK时做的事情
        onOk: async () => {
          // 取输入框的值
          const el = document.querySelector('.__good_input_count');
          let num = el.value;
          // 调用接口
          const res = await good.updateCount({
            id: record._id,
            num,
            type,
          });

          result(res)
            .success((data) => {
              // 这里是修改前端界面的库存值
              if (type === 'IN_COUNT') {
                // 入库操作
                num = Math.abs(num);
              } else {
                // 出库操作
                num = -Math.abs(num);
              }

              // 查找出该id是否在list中
              const one = list.value.find((item) => {
                return item._id === record._id;
              });

              // 若在，修改该列数据的count值
              if (one) {
                one.count = one.count + num;
                message.success(`成功${word} ${Math.abs(num)} 本书`);
              }
            });
        },
      });
    };

    // 显示更新弹框
    const update = ({ record }) => {
      showUpdateModal.value = true;
      curEditGood.value = record;
    };

    // 子组件直接修改父的不好，提供该方法返回给子组件使用！
    // 更新列表的某一行数据
    const updateCurGood = (newData) => {
      Object.assign(curEditGood.value, newData);
      console.log(curEditGood.value);
    };

    // 进入商品详情页
    const toDetail = ({ record }) => {
      router.push(`/goods/${record._id}`);
    };

    const onUploadChange = ({ file }) => {
      if (file.response) {
        result(file.response)
          .success(async (key) => {
            const res = await good.addMany(key);

            result(res)
              .success(({ data: { addCount } }) => {
                message.success(`成功添加 ${addCount} 本书`);
                getList();
              });
          });
      }
    };

    return {
      columns,
      show,
      list,
      formatTimestamp,
      curPage,
      total,
      setPage,
      keyword,
      onSearch,
      backAll,
      isSearch,
      remove,
      updateCount,
      showUpdateModal,
      update,
      curEditGood,
      updateCurGood,
      toDetail,
      getList,
      getClassifyTitleById,
      simple: props.simple,
      onUploadChange,
      headers: getHeaders(),
    };
  },
});
