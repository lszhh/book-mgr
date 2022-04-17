import { defineComponent, onMounted, ref } from 'vue';
import { result } from '@/helpers/utils';
import Books from '@/views/Books/index.vue';
import Log from '@/views/Log/index.vue';
import { dashboard } from '@/service';
import _ from '@/config/common';

export default defineComponent({
  components: {
    Books,
    Log,
  },
  setup() {
    const loading = ref(true);

    const baseInfo = ref({
      total: {
        book: 0,
        user: 0,
        log: 0,
      },
    });

    // 获取基础信息
    const getBaseInfo = async () => {
      loading.value = true;
      // 发送请求
      const res = await dashboard.baseInfo();
      loading.value = false;

      result(res)
        .success(({ data }) => {
          baseInfo.value = data;
        });
    };

    onMounted(() => {
      getBaseInfo();
    });

    return {
      baseInfo,
      loading,
      _: _.PAGE_META.DASHBOARD,
    };
  },
});
