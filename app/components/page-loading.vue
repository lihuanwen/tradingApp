<template>
  <view class="uni-loadmore" v-if="loading === 1">加载中</view>
  <view class="uni-loadmore" v-else-if="loading === -1" @click="onClick()">
    <!-- <text class="errMsg">{{errMsg}}</text> -->
    <uni-notice-bar :text="errMsg"></uni-notice-bar>
  </view>
</template>

<script>
import uniNoticeBar from "@/components/uni-notice-bar/uni-notice-bar.vue";
export default {
  components: {
    uniNoticeBar
  },
  props: {
    loading: {
      type: Number,
      default: 0
    },
    errMsg: {
      type: [Number, String],
      default: "加载错误，点击重试"
    }
  },
  computed: {},
  methods: {
    onClick() {
      this.$emit("click");
    }
  }
};
</script>

<style>
.uni-loadmore {
  padding-bottom: 0;
}
.errMsg {
  width: 100%;
  /* max-height: 150upx; */
  overflow: scroll;
  word-break: break-all;
}
</style>
