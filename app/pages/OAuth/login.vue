<template>
  <view class="content">
    <view class="input-group">
      <view class="input-row border">
        <text class="title">账号：</text>
        <m-input
          class="m-input"
          type="text"
          clearable
          focus
          v-model="form.data.userName"
          placeholder="请输入账号"
        ></m-input>
      </view>
      <view class="input-row">
        <text class="title">密码：</text>
        <m-input type="password" displayable v-model="form.data.password" placeholder="请输入密码"></m-input>
      </view>
    </view>
    <view class="btn-row">
      <button type="primary" class="primary" @tap="bindLogin" :loading="form.loading">登录</button>
    </view>
    <view class="action-row">
      <navigator url="../OAuth/reg">注册账号</navigator>
      <text>|</text>
      <navigator url="../OAuth/pwd">忘记密码</navigator>
    </view>
  </view>
</template>

<script>
import mInput from "@/components/m-input.vue";
import { mapState } from "vuex";

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
  onLoad() {},
  methods: {
    bindLogin() {
      let form = this.form;
      form.loading = true;

      this.$ajax
        .post(this.$path.OAuth.login, {
          ...form.data,
          // #ifdef  APP-PLUS
          clientInfo: plus.push.getClientInfo()
          // #endif
        })
        .then(
          res => {
            form.loading = false;
            this.$store.commit("login", res);
            // uni.navigateBack();
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
.action-row {
  display: flex;
  flex-direction: row;
  justify-content: center;
  navigator {
    color: #007aff;
    padding: 0 20upx;
  }
}
.oauth-row {
  display: flex;
  flex-direction: row;
  justify-content: center;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  .oauth-image {
    width: 100upx;
    height: 100upx;
    border: 1upx solid #dddddd;
    border-radius: 100upx;
    margin: 0 40upx;
    background-color: #ffffff;
    image {
      width: 60upx;
      height: 60upx;
      margin: 20upx;
    }
  }
}
</style>
