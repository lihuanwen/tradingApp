<template>
  <view class="content">
    <view class="input-group">
      <view class="input-row">
        <text class="title">账号：</text>
        <m-input type="text" focus clearable v-model="form.data.userName" placeholder="请输入邮箱"></m-input>
      </view>
    </view>
    <view class="btn-row">
      <button type="primary" class="primary" @tap="findPassword" :loading="form.loading">提交</button>
    </view>
  </view>
</template>

<script>
import mInput from "@/components/m-input.vue";

export default {
  components: {
    mInput
  },
  data() {
    return {
      form: {
        loading: false,
        data: {
          userName: "admin",
          password: "qaz123"
        }
      }
    };
  },
  methods: {
    findPassword() {
      let form = this.form;
      form.loading = true;
      // this.$ajax.post(this.$path.OAuth.register, form.data).then(
      //   res => {
      //     form.loading = false;
      //     uni.navigateBack({ delta: 1 });
      //   },
      //   err => {
      //     form.loading = false;
      //     if (err.type === "server") {
      //       uni.showToast({ icon: "none", title: err.msg });
      //     } else {
      //     }
      //   }
      // );
    }
  }
};
</script>

<style lang="less">

</style>
