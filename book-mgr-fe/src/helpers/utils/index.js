import { message } from 'ant-design-vue';

export const result = (response, authShowErrorMsg = true) => {
  const { data } = response;

  if ((data.code === 0) && authShowErrorMsg) {
    message.error(data.msg);
  }

  return {
    success(cb) {
      // 先看data.code是多少，若符合，就调用传进来的回调函数！
      // 在模板那里，传递进来的函数是message.success~
      // 在调用传进来的函数时，会把data也带回去，那么在view下就
      // 可以用data来做一个数据的展示
      if (data.code !== 0) {
        cb(data, response);
      }
      // return this，才能用链式调用的效果
      return this;
    },
    fail(cb) {
      if (data.code === 0) {
        cb(data, response);
      }

      return this;
    },
    finally(cb) {
      cb(data, response);

      return this;
    },
  };
};

export const clone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

const tsPadStart = (str) => {
  str = String(str);

  return str.padStart(2, '0');
};

// 将时间戳转换为日期
export const formatTimestamp = (ts) => {
  const date = new Date(Number(ts));

  const YYYY = date.getFullYear();
  const MM = tsPadStart(date.getMonth() + 1);
  const DD = tsPadStart(date.getDate());

  const hh = tsPadStart(date.getHours());
  const mm = tsPadStart(date.getMinutes());
  const ss = tsPadStart(date.getSeconds());

  return `${YYYY}/${MM}/${DD} ${hh}:${mm}:${ss}`;
};
