import { reactive } from 'vue';
import DASHBOARD from './Pages/Dashboard';
import CLASSIFY from './Pages/Classify';
import TOPIC_MGR from './Pages/TopicMgr';

export default reactive({
  SITE_NAME: '图书管理系统',

  KEYWORD: '图书',

  PAGE_META: {
    DASHBOARD,
    CLASSIFY,
    TOPIC_MGR,
  },
});
