import {
  get,
} from '@/helpers/request';

// 设置默认值
export const list = (type = 'IN_COUNT', page = 1, size = 10, goodName = '') => {
  return get(
    '/inventory-log/list', {
    type,
    page,
    size,
    // goodName,
  }
  )
}

// 获取出入库记录 做可视化展示
export const getSaleValue = (startTime = 0, endTime = 0) => {
  return get(
    '/inventory-log/getSaleValue', {
      startTime,
      endTime,
    }
  )
}