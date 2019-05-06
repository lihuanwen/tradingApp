<template>
  <view class="content">
    <view v-if="isLogin" class="hello">
      <view class="title">您好 {{userInfo.name}}，您已成功登录。</view>
      <view v-if="pushMessage">
        <view>title：{{pushMessage.title}}</view>
        <view>content：{{pushMessage.content}}</view>
        <view>payload：{{pushMessage.payload}}</view>
        <view>aps：{{pushMessage.aps}}</view>
      </view>
    </view>
    <view v-else class="hello">
      <view class="title">您好 游客。</view>
    </view>
  </view>
</template>

<script>
import { mapState, mapGetters } from "vuex";

export default {
  data() {
    return {};
  },
  computed: {
    ...mapState(["userInfo", "pushMessage"]),
    ...mapGetters(["isLogin"])
  },
  onLoad() {
    if (!this.isLogin) {
      uni.showModal({
        title: "未登录",
        content: "您未登录，需要登录后才能继续",
        showCancel: false,
        success: res => {
          if (res.confirm) {
            uni.navigateTo({
              url: "/pages/OAuth/login"
            });
          }
        }
      });
    }
  }
};
</script>

<style lang="less">
.hello {
  display: flex;
  flex: 1;
  flex-direction: column;
  .title {
    color: #8f8f94;
    font-size: 30upx;
  }
}
</style>
