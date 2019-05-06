<template>
  <view class="uni-loadmore" v-if="loading === -1" @click="onClick()">
    <!-- <view class="errMsg">{{errMsg}}</view> -->
    <uni-notice-bar :text="errMsg"></uni-notice-bar>
  </view>
  <view class="uni-loadmore" v-else-if="loading === 0">
    <text v-if="pagination.pageIndex * pagination.pageSize >= pagination.total">此处有底线，但生活无上限</text>
    <text v-else>加载中</text>
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
    },
    pagination: Object
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
.errMsg {
  width: 100%;
  /* max-height: 150upx; */
  overflow: scroll;
  word-break: break-all;
}
</style>
