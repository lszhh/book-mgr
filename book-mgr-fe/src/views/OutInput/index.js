import { defineComponent, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import store from '@/store'
import { good } from '@/service'
import { message } from 'ant-design-vue'
import { result } from '@/helpers/utils'
import { getStoreOption } from '@/helpers/out-input'
import DayStoreValue from './DayStoreValue/index.vue'

export default defineComponent({
  components: {
    // 抽离销售额和出入库组件
    DayStoreValue,
  },
  setup() {

    // 获取分类数据
    const { goodClassify } = store.state
    const goodClassifyTitle = []

    // 获取具体分类名字方法
    function getGoodClassify(goodClassifyTitle) {
      goodClassify.forEach(item => {
        goodClassifyTitle.push(item.title)
      })
    }

    let showStore = null

    // 显示库存数据
    const showStoreEchart = function (goodClassifyTitle, total) {

      // 去除没有商品的分类
      for (let i = 0; i < total.length; i++) {
        if (total[i] === 0) {
          goodClassifyTitle.splice(i, 1)
          total.splice(i, 1)
          // 上面删减后i会-1, 所以i要往后退一格, 否则紧邻的为0的数据就没有被检测到
          i -= 1
        }
      }


      // echarts配置
      const storeOption = getStoreOption(goodClassifyTitle, total)

      // 保存配置
      showStore.setOption(storeOption, true);

      // 标志量, 用来记录是在分类总量还是具体分类里面
      let flag = false

      // 当柱状图被点击的时候
      showStore.on('click', async function (params) {
        // 具体商品数量
        const specificTotal = []
        // 查询到的具体分类
        const specificName = []

        // 当前点击的图的index
        // console.log(params.dataIndex)
        // console.log(params.name);

        // 查询当前分类是在总分类还是在具体分类里面, 如果是具体分类里面返回false
        flag = goodClassify.some(item => {
          return item.title === params.name
        })

        // 获取点击分类的id
        let _id = ''
        if (flag) {
          // 获取到当前点击的元素
          const one = goodClassify.find(item => {
            return item.title === params.name
          })
          _id = one._id
          // 根据分类id查询商品
          const res = await good.list({
            _id
          })
          result(res)
            .success(({ data: { list: l } }) => {
              // 置空
              // 遍历数据, 记录分类和数量
              l.forEach(item => {
                specificName.push(item.name)
                specificTotal.push(item.count)
              })

              // 配置图
              storeOption.xAxis.data = specificName
              storeOption.series[0].data = specificTotal

            })

          // 保存配置
          showStore.setOption(storeOption)

          return
        }

        message.warn('当前分类不可再细分，请返回上一层！')
        // 如果在具体分类里面直接return
        return

      });

    }

    // 获取库存信息
    const getStore = async function () {
      const res = await good.getGoodStore()

      result(res)
        .success(({ data: total }) => {
          showStoreEchart(goodClassifyTitle, total)
        })
    }


    // 实例挂载时载入信息
    onMounted(async () => {
      // 获取设置元素
      showStore = echarts.init(document.getElementById('showStore'));
      getStore()
      getGoodClassify(goodClassifyTitle)
    })

    onUnmounted(() => {
      if (showStore) {
        showStore.dispose()
      }
    })


    return {

    }
  }
})