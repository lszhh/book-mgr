import { defineComponent, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import store from '@/store'
import { inventoryLog, book } from '@/service'
import { result, } from '@/helpers/utils'
import { getTime, getSaleValueOption } from '@/helpers/out-input'
import { message } from 'ant-design-vue'

export default defineComponent({

  setup() {

    // 获取分类数据
    const { bookClassify } = store.state
    const bookClassifyTitle = []

    // 获取具体分类名字方法
    function getBookClassify(bookClassifyTitle) {
      bookClassify.forEach(item => {
        bookClassifyTitle.push(item.title)
      })
    }

    // 获取时间
    const saleValueDate = []
    // 出入库情况数组 -> 用来配置echarts
    let outStock = ['出库情况'], inStock = ['入库情况']
    // 保存全部商品变量
    let totalItems = []
    // 出库数据项目
    const outStockItems = []
    // 入库数据项目
    const inStockItems = []
    // 近期出库数据项目inventory-log -> 二维数组 存储近五天数据
    const accentOutStockItems = [[], [], [], [], []]
    // 近期出库数据项目inventory-log  -> 二维数组 存储近五天数据
    const accentInStockItems = [[], [], [], [], []]

    let showValue = null

    // 显示销售量数据
    const showValueEchart = function () {

      // 销售额数据配置
      const saleValueOption = getSaleValueOption(saleValueDate, inStock, outStock)

      // 保存配置
      showValue.setOption(saleValueOption);

      // 标志量, 用来记录是在分类总量还是具体分类里面
      let flag = false

      // 当柱状图被点击的时候
      showValue.on('click', async function (params) {

        // 查询当前分类是在总分类还是在具体分类里面, 如果是具体分类里面返回false
        flag = saleValueDate.some(item => {
          return item === params.name
        })

        if (flag) {
          // 存放具体商品的数组
          const specificOutName = [[], [], [], [], []]
          // 出库商品具体到日
          const specificOutDayName = []
          let specifiOutDayTotal = []
          const specificInName = [[], [], [], [], []]
          // 入库商品具体到日
          const specificInDayName = []
          let specifiInDayTotal = []
          const specificOutDayID = []
          const specificInDayID = []
          // 总分类下标
          let totalName = []

          // 获取每日具体商品方法
          function getSpecifyItems(specificItems, specificName) {
            // 置空数组
            specificName.forEach((item, index) => {
              specificName[index].splice(0, specificName[index].length)
            })
            // 根据出入库id筛选出商品 -> 看下数据就知道要三重
            totalItems.forEach(item => {
              specificItems.forEach((value, index) => {
                value.forEach((childValue) => {
                  if (item._id === childValue.bookName) {
                    // 深拷贝
                    const tempItem = JSON.parse(JSON.stringify(item))
                    // 把销量赋值给出入库数据
                    tempItem.num = childValue.num
                    specificName[index].push(tempItem)
                  }
                })
              })
            })
          }

          // 获取每日进出库商品
          getSpecifyItems(accentOutStockItems, specificOutName)
          getSpecifyItems(accentInStockItems, specificInName)
          console.log(accentOutStockItems);
          console.log(specificOutName);
          console.log(accentInStockItems);
          console.log(specificInName);

          // 获取具体每日具体商品数据的方法
          function getSpecifyData(specificName, specificDayName, specificDayID) {
            specificName[params.dataIndex].forEach(item => {
              // 如果商品名已经存在
              if (!specificDayName.some(value => value === item.name)) {
                specificDayName.push(item.name)
                specificDayID.push(item._id)
              }
            })
          }
          // 获取进出库具体数据
          getSpecifyData(specificOutName, specificOutDayName, specificOutDayID)
          getSpecifyData(specificInName, specificInDayName, specificInDayID)
          console.log(specificOutName);
          console.log(specificOutDayName);
          console.log(specificInName);
          console.log(specificInDayName);

          // 获取每日具体商品进出库数量的方法
          function getSpecifyNumData(specificDayID, stockItems, specificDayTotal) {
            specificDayID.forEach((item, index) => {
              let num = 0
              stockItems[params.dataIndex].forEach(value => {
                if (value.bookName === item) {
                  num += value.num
                }
              })
              specificDayTotal.push(num)
            })
          }

          getSpecifyNumData(specificOutDayID, accentOutStockItems, specifiOutDayTotal)
          getSpecifyNumData(specificInDayID, accentInStockItems, specifiInDayTotal)

          // 获取总分类
          if (specificOutDayName.length >= specificInDayName.length) {

            totalName = specificOutDayName.slice(0)

            specificInDayName.forEach(item => {
              // 标志量, 判断是否存在相同分类 
              let flag = false
              specificOutDayName.forEach(value => {
                if (item == value) {
                  flag = true
                }
              })

              if (!flag) {
                totalName.push(item)
                specifiOutDayTotal.push(0)
              } else {
                flag = false
              }
            })

            // 格式化出库数据
            // 临时出库数组
            const tempInTotal = []
            for (let i = 0; i < totalName.length; i++) {
              let flag = false
              specificInDayName.forEach((value, dataIndex) => {
                if (totalName[i] === value) {
                  tempInTotal.push(specifiInDayTotal[dataIndex])
                  flag = true
                }
              })
              !flag ? tempInTotal.push(0) : flag = true
            }

            specifiInDayTotal = tempInTotal.slice(0)
            
          } else {

            totalName = specificInDayName.slice(0)

            specificOutDayName.forEach(item => {
              let flag = false
              specificInDayName.forEach(value => {
                if (item == value) {
                  flag = true
                }
              })

              if (!flag) {
                totalName.push(item)
                specifiInDayTotal.push(0)
              } else {
                flag = false
              }
            })

            // 格式化出库数据
            // 临时出库数组
            const tempOutTotal = []
            for (let i = 0; i < totalName.length; i++) {
              let flag = false
              specificOutDayName.forEach((value, dataIndex) => {
                if (totalName[i] === value) {
                  tempOutTotal.push(specifiOutDayTotal[dataIndex])
                  flag = true
                }
              })
              !flag ? tempOutTotal.push(0) : flag = true
            }
            // console.log(tempOutTotal);
            specifiOutDayTotal = tempOutTotal.slice(0)
          }

          totalName.unshift('具体商品')
          specifiInDayTotal.unshift('入库情况')
          specifiOutDayTotal.unshift('出库情况')

          // 销售额数据配置
          const saleValueDayOption = getSaleValueOption(totalName, specifiInDayTotal, specifiOutDayTotal)
          showValue.setOption(saleValueDayOption);

          return
        }

        message.warn('当前分类不可再细分，请返回上一层！')
        // 如果在具体分类里面直接return
        return

      });

    }

    // 获取出入库信息√
    const getSaleValue = async function () {
      // 获取当前时间
      const nowTime = getTime(saleValueDate)

      const res = await inventoryLog.getSaleValue(nowTime.startTime, nowTime.endTime)

      result(res)
        .success(({ data }) => {
          // 处理近五天销量数据
          // console.log(data);

          // 置空数组
          outStockItems.splice(0, outStockItems.length)
          inStockItems.splice(0, inStockItems.length)
          accentOutStockItems.forEach((item, index) => {
            item.splice(0, item.length)
            accentInStockItems[index].splice(0, accentInStockItems[index].length)
          })
          // 保留第一位数据, 置空后面的数据
          outStock.splice(1, outStock.length)
          inStock.splice(1, inStock.length)


          for (let item of data) {
            // 判断该项目是出库还是入库
            if (item.type === 'OUT_COUNT') {
              outStockItems.push(item)
            } else {
              inStockItems.push(item)
            }
          }

          let tempOutStockNum = 0
          let tempInStockNum = 0
          // 五天的数据分别循环五次去拿
          for (let i = 0; i < 5; i++) {
            // 临时记录量的变量
            tempOutStockNum = 0
            tempInStockNum = 0

            // nowTime.startTime, nowTime.endTime 最近五天时间
            outStockItems.forEach(item => {
              if ((nowTime.startTime + i * nowTime.dayTime) <= item.meta.updatedAt && item.meta.updatedAt <= (nowTime.startTime + (i + 1) * nowTime.dayTime)) {
                tempOutStockNum += item.num
                // 存储近五天的数据
                accentOutStockItems[i].push(item)
              }
            })
            inStockItems.forEach(item => {
              if ((nowTime.startTime + i * nowTime.dayTime) <= item.meta.updatedAt && item.meta.updatedAt <= (nowTime.startTime + (i + 1) * nowTime.dayTime)) {
                tempInStockNum += item.num
                // 存储近五天的数据
                accentInStockItems[i].push(item)
              }
            })

            // 存储每日出入库量
            outStock.push(tempOutStockNum)
            inStock.push(tempInStockNum)

          }

        })
    }

    // 实例挂载时载入信息
    onMounted(async () => {
      // 获取设置元素
      showValue = echarts.init(document.getElementById('showDayStoreValue'));
      const { data: { data: { list } } } = await book.list()
      totalItems = list
      getBookClassify(bookClassifyTitle)
      await getSaleValue()
      showValueEchart()
    })

    onUnmounted(() => {
      if (showValue) {
        showValue.dispose()
      }
    })

    return {

    }
  }
})