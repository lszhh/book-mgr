// 获取时间方法
export const getTime = (saleValueDate) => {
  let startTime = 0
  let endTime = 0

  const date = new Date()
  const newDate = []
  let newDateStr = ''
  // 获取年
  newDate.push(date.getFullYear())
  // 获取月
  newDate.push(date.getMonth() + 1)
  // 获取月, 往前推一天
  newDate.push(date.getDate() + 1)
  // 组合时间
  newDateStr = newDate.join('-')
  // 深拷贝数组 以便后面作五天时间分组
  let tempArr = newDateStr
  saleValueDate.splice(0, saleValueDate.length)

  // 加上时分秒, 否则默认是八点开始的
  newDateStr += ' 00:00:00'
  // 一天的时长 毫秒数
  const dayTime = 86400000

  // 明天的零点
  endTime = new Date(newDateStr).getTime()
  // 五天前的零点
  startTime = (new Date(newDateStr).getTime() - dayTime * 5)

  for (let i = 0; i < 5; i++) {
    let newtempArr = tempArr.split('-')
    newtempArr[newtempArr.length - 1] -= 1
    tempArr = newtempArr.join('-')
    saleValueDate.unshift(tempArr)
  }
  saleValueDate.unshift('date')

  // 返回当前近五天的开始和结束时间, 一天的总时间
  return {
    startTime,
    endTime,
    dayTime,
  }
}

// 每日营业额设置
export const getSaleDayValueOption = (saleDatValueDate, total) => {
  return {
    title: {
      text: '销售额数据'
    },
    tooltip: {},
    toolbox: {
      show: true,
      feature: {
        dataView: { readOnly: false },
        magicType: { type: ['line', 'bar'] },
        restore: {},
        saveAsImage: {}
      }
    },
    grid: [
      { left: 'center', top: 'center', width: '50%', height: '50%' },
    ],
    xAxis: {
      data: saleDatValueDate
    },
    yAxis: {},
    series: [{
      name: '销售额',
      type: 'bar',
      data: total,
      itemStyle: {
        //设置颜色
        color: function (params) {
          var colorList = ['#c23531', '#2f4554', '#61a0a8', '#d48265', '#91c7ae', '#749f83', '#ca8622', '#c23531', '#2f4554', '#61a0a8', '#d48265', '#91c7ae', '#749f83', '#ca8622', '#c23531', '#2f4554', '#61a0a8', '#d48265', '#91c7ae', '#749f83', '#ca8622'];
          return colorList[params.dataIndex]
        },
      },
      // 设置上标数值显示
      label: {
        show: true,
        position: 'top',
        axisName: {
          color: 'black',
        }
      },
    }],
  }
}

// 销售库存设置
export const getSaleValueOption = (saleValueDate, inStock, outStock) => {
  return {
    title: {
      text: '出入库情况表'
    },
    legend: {},
    tooltip: {},
    toolbox: {
      show: true,
      feature: {
        dataZoom: {
          yAxisIndex: 'none'
        },
        dataView: { readOnly: false },
        magicType: { type: ['line', 'bar'] },
        restore: {},
        saveAsImage: {}
      }
    },
    dataset: {
      source: [
        saleValueDate,
        inStock,
        outStock,
      ]
    },
    xAxis: [
      { type: 'category', gridIndex: 0 },
    ],
    yAxis: [
      { gridIndex: 0 },
    ],
    grid: [
      { left: 'center', top: 'center', width: '50%', height: '50%' },
    ],
    series: [
      {
        type: 'bar',
        seriesLayoutBy: 'row',
        label: {
          show: true,
          position: 'top',
          axisName: {
            color: 'black',
          }
        }
      },
      {
        type: 'bar',
        seriesLayoutBy: 'row',
        label: {
          show: true,
          position: 'top',
          axisName: {
            color: 'black',
          }
        }
      },
    ]
  }
}

// 库存设置
export const getStoreOption = (goodClassifyTitle, total) => {
  return {
    title: {
      text: '分类库存详情'
    },
    tooltip: {},
    toolbox: {
      show: true,
      feature: {
        dataZoom: {
          yAxisIndex: 'none'
        },
        dataView: { readOnly: false },
        magicType: { type: ['line', 'bar'] },
        restore: {},
        saveAsImage: {}
      }
    },
    grid: [
      { left: 'center', top: 'center', width: '50%', height: '50%' },
    ],
    xAxis: {
      data: goodClassifyTitle
    },
    yAxis: {},
    series: [{
      name: '库存',
      type: 'bar',
      data: total,
      itemStyle: {
        //设置颜色
        color: function (params) {
          var colorList = ['#c23531', '#2f4554', '#61a0a8', '#d48265', '#91c7ae', '#749f83', '#ca8622', '#c23531', '#2f4554', '#61a0a8', '#d48265', '#91c7ae', '#749f83', '#ca8622', '#c23531', '#2f4554', '#61a0a8', '#d48265', '#91c7ae', '#749f83', '#ca8622'];
          return colorList[params.dataIndex]
        },
      },
      // 设置上标数值显示
      label: {
        show: true,
        position: 'top',
        axisName: {
          color: 'black',
        }
      },
    }],
  }
}
