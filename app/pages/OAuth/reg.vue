<template>
  <view class="content">
    <view class="input-group">
      <view class="input-row border">
        <text class="title">账号：</text>
        <m-input type="text" focus clearable v-model="form.data.userName" placeholder="请输入账号"></m-input>
      </view>
      <view class="input-row border">
        <text class="title">密码：</text>
        <m-input type="password" displayable v-model="form.data.password" placeholder="请输入密码"></m-input>
      </view>
    </view>
    <view class="btn-row">
      <button type="primary" class="primary" @tap="register" :loading="form.loading">注册</button>
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
          userName: "",
          password: ""
        }
      }
    };
  },
  methods: {
    register() {
      let form = this.form;
      form.loading = true;
      this.$ajax.post(this.$path.OAuth.register, form.data).then(
        res => {
          form.loading = false;
          this.$store.commit("login", res);
          uni.switchTab({
            url: "/pages/main/index"
          });
        },
        err => {
          form.loading = false;
          if (err.type === "server") {
            uni.showToast({ icon: "none", title: err.msg });
          } else {
          }
        }
      );
    }
  }
};
</script>

<style lang="less">
</style>
