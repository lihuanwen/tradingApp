<template>
  <view class="content">
    <template v-if="isLogin">
      <uniList>
        <uniListItem
          title="交易所设置"
          @click="routerReplace('navigateTo','/pages/setting/marketConfigList')"
        ></uniListItem>
        <uniListItem title="清除缓存" @click="clearStorage()"></uniListItem>
      </uniList>
      <view class="btn-row">
        <button type="warn" @tap="handleLogOut()">退出登录</button>
      </view>
    </template>
    <template v-else>
      <view class="btn-row">
        <button type="primary" @tap="routerReplace('navigateTo','/pages/OAuth/login')">登 录</button>
      </view>
    </template>
  </view>
</template>

<script>
import { mapState, mapMutations, mapGetters, mapActions } from "vuex";

import uniList from "@/components/uni-list/uni-list.vue";
import uniListItem from "@/components/uni-list-item/uni-list-item.vue";
export default {
  components: {
    uniList,
    uniListItem
  },
  computed: {
    ...mapState(["userInfo"]),
    ...mapGetters(["isLogin"])
  },
  methods: {
    ...mapMutations(["clearStorage"]),
    ...mapActions(["handleLogOut"])
  }
};
</script>

<style lang="less">
</style>
