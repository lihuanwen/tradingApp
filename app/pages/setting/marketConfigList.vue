<template>
  <view class="content">
    <view class="uni-flex-item">
      <uniList>
        <uniListItem
          v-for="(item,index) in list.data"
          :key="index"
          :title="item.market"
          :note="listNote(item)"
          :show-arrow="false"
          show-badge
          :badge-type="item.state === 1 ? 'success' : 'warning'"
          :badge-text="item.state === 1 ? '启用' : '停用'"
          :thumb="`https://static.hqz.com/market/${item.market}.png`"
          @click="actionSheetTap(item)"
        ></uniListItem>
      </uniList>
      <scrollerLoading
        :loading="list.loading"
        :errMsg="list.loadingErrMsg"
        @click="getList()"
        :pagination="list.pagination"
      ></scrollerLoading>
    </view>
    <!-- <view class="pagination">
      <uniPagination
        :current="list.pagination.pageIndex"
        :total="list.pagination.total"
        :pageSize="list.pagination.pageSize"
        @change="pageChange"
      ></uniPagination>
      <view>当前页：{{list.pagination.pageIndex}}，数据总量：{{list.pagination.total}}条，每页数据：{{list.pagination.pageSize}}</view>
    </view>-->
  </view>
</template>
<script>
import scrollerLoading from "@/components/scroller-loading.vue";
// import uniPagination from "@/components/uni-pagination/uni-pagination.vue";
import uniList from "@/components/uni-list/uni-list.vue";
import uniListItem from "@/components/uni-list-item/uni-list-item.vue";

import scroller from "@/mixins/scroller";
export default {
  components: {
    scrollerLoading,
    // uniPagination,
    uniList,
    uniListItem
  },
  mixins: [scroller],
  data() {
    return {
      listPath: this.$path.setting.marketConfig.list
    };
  },
  computed: {},
  filters: {},
  mounted() {
    this.getList();
  },
  methods: {
    actionSheetTap(item) {
      // plus.nativeUI.actionSheet(
      //   {
      //     title: "选择要执行的操作",
      //     cancel: "取消",
      //     buttons: [
      //       { title: "修改" },
      //       { title: "启，停用" },
      //       { title: "删除", style: "destructive" }
      //     ]
      //   },
      //   e => {
      //     console.log("User pressed: " + e.index);
      //   }
      // );
      uni.showActionSheet({
        itemList: ["修改", "启，停用", "删除"],
        success: e => {
          switch (e.tapIndex) {
            case 0:
              this.edit(item);
              break;
            case 1:
              this.stateUpDate(item);
              break;
            case 2:
              this.del(item);
              break;
          }
        }
      });
    },
    // 状态管理
    // pageChange(type, current) {
    //   this.list.pagination.pageIndex = current;
    //   // this.list.pagination.pageSize = pageSize;
    //   this.getList();
    // },
    edit(item) {
      this.routerReplace("navigateTo", "/pages/setting/marketConfigEdit", item);
    },
    stateUpDate(item) {
      this.$ajax
        .post(this.$path.setting.marketConfig.stateUpDate, {
          ID: item.ID,
          state: item.state === 1 ? 0 : 1
        })
        .then(
          date => {
            this.getList();
            uni.showToast({
              title: "操作成功",
              icon: "success"
            });
            this.$store.commit("setCache", { key: "marketConfig" });
          },
          error => {
            uni.showToast({
              title: error.msg,
              icon: "none"
            });
          }
        );
    },
    del(item) {
      this.$ajax
        .post(this.$path.setting.marketConfig.del, { ID: [item.ID] })
        .then(
          date => {
            this.getList();
            uni.showToast({
              title: "操作成功",
              icon: "success"
            });
            this.$store.commit("setCache", { key: "marketConfig" });
          },
          error => {
            uni.showToast({
              title: error.msg,
              icon: "none"
            });
          }
        );
    },
    // 页面渲染
    listNote(item) {
      // return `ID:${item.ID} 备注:${item.note} 添加时间:${this.$util._dateFormat(
      //   item.createTime
      // )}`;
      return `${item.state === 1 ? "启用" : "停用"} ${item.ID} ${
        item.note
      } ${this.$util._dateFormat(item.createTime)}`;
    }
  },
  onNavigationBarButtonTap(index) {
    uni.navigateTo({
      url: "/pages/setting/marketConfigEdit"
    });
  }
};
</script>

<style lang="less">
.uni-list-item__icon-img {
  height: 104upx;
  width: 104upx;
}
</style>
