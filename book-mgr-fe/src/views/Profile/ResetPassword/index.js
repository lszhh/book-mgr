import { defineComponent, reactive } from 'vue';
import { profile } from '@/service';
import { message } from 'ant-design-vue';
import { result } from '@/helpers/utils';
import { setToken } from '@/helpers/token';

export default defineComponent({
  setup() {
    const form = reactive({
      oldPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    });

    const resetPassword = async () => {
      const {
        confirmNewPassword,
        newPassword,
        oldPassword,
      } = form;

      if (confirmNewPassword !== newPassword) {
        message.error('两次输入密码不同');
        return;
      }

      const res = await profile.resetPassword(
        newPassword,
        oldPassword,
      );

      result(res)
        .success(({ msg }) => {
          message.success(msg);
          form.oldPassword = '';
          form.confirmNewPassword = '';
          form.newPassword = '';
          // token清空
          setToken('');
          // 重定向到'/'
          window.location.href = '/';
        });
    };

    return {
      form,
      resetPassword,
    };
  },
});
