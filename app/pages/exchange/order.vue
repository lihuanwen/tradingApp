<template>
  <view class="content">
    <view class="v1" @click="search.show = true">
      <text
        class="v1-item"
      >{{search.marketConfig.select ? search.marketConfig.select.text : '请选择交易所'}}</text>
      <text class="v1-item">{{search.marketSymbol.select ? search.marketSymbol.select : '请选择交易对'}}</text>
      <text class="v1-item">{{search.orderType.select ? search.orderType.select.label : ''}}</text>
    </view>
    <uniNoticeBar
      v-if="search.marketConfig.loading === -1 || search.marketSymbol.loading === -1"
      :text="search.loadingErrMsg"
    ></uniNoticeBar>
    <uni-popup
      class="v2"
      :show="search.show"
      position="bottom"
      mode="fixed"
      @hidePopup="search.show = false"
    >
      <view class="group">
        <view class="row border">
          <text class="title">交易所：</text>
          <input
            class="input"
            type="text"
            v-model="search.marketConfig.keyword"
            @focus="search.marketConfig.show = true"
            @confirm="marketConfigSelect"
            placeholder="搜索交易所"
          >
        </view>
        <scroll-view
          scroll-y="true"
          class="scroll"
          v-if="search.marketConfig.show && marketConfigList.length>0"
        >
          <uni-grid
            :show-out-border="false"
            type="oblong"
            @click="marketConfigSelect"
            :options="marketConfigList"
          ></uni-grid>
        </scroll-view>
        <view class="row border">
          <text class="title">交易对：</text>
          <input
            class="input"
            type="text"
            v-model="search.marketSymbol.keyword"
            @focus="search.marketSymbol.show = true"
            @confirm="marketSymbolSelect"
            placeholder="搜索交易对"
          >
        </view>
        <scroll-view
          scroll-y="true"
          class="scroll"
          v-if="search.marketSymbol.show && marketSymbolList.length>0"
        >
          <uni-grid
            :show-out-border="false"
            type="oblong"
            columnNum="4"
            @click="marketSymbolSelect"
            :options="marketSymbolList"
          ></uni-grid>
        </scroll-view>
        <view class="row">
          <text class="title">类型：</text>
          <radio-group @change="radioChange">
            <label v-for="item in search.orderType.list" :key="item.value">
              <radio :value="item.value" :checked="search.orderType.select.value  === item.value"/>
              {{item.label}}
            </label>
          </radio-group>
        </view>
      </view>
      <button type="primary" @tap="search.show= false;getList()">查 询</button>
    </uni-popup>
    <pageLoading :loading="list.loading" :errMsg="list.loadingErrMsg" @click="getList()"></pageLoading>
    <view class="v3">
      <order :data="list.data" @cancelOrder="cancelOrder"/>
    </view>
  </view>
</template>

<script>
import uniNoticeBar from "@/components/uni-notice-bar/uni-notice-bar.vue";
import uniPopup from "@/components/uni-popup/uni-popup.vue";
import pageLoading from "@/components/page-loading.vue";
import uniGrid from "@/components/uni-grid/uni-grid.vue";
import order from "@/components/order.vue";

import selectMarket from "@/mixins/selectMarket";
export default {
  components: {
    uniNoticeBar,
    pageLoading,
    uniPopup,
    uniGrid,
    order
  },
  mixins: [selectMarket],
  data() {
    return {
      listPath: this.$path.capital.fetchOrder,
      list: {
        data: [],
        loading: 0,
        loadingErrMsg: ""
      }
    };
  },
  mounted() {
  },
  methods: {

    getList() {
      let list = this.list;
      list.loading = 1;
      this.$ajax.post(this.listPath, this.query).then(
        data => {
          list.data = data;
          list.loading = 0;
          uni.stopPullDownRefresh();
        },
        err => {
          list.loadingErrMsg = err.msg;
          list.loading = -1;
          uni.stopPullDownRefresh();
        }
      );
    },
    cancelOrder(orderID) {
      this.$ajax
        .post(this.$path.capital.cancelOrder, {
          ...this.query,
          orderID: orderID
        })
        .then(
          data => {
            this.getList();
            uni.showToast({
              title: "操作成功",
              icon: "success"
            });
          },
          err => {
            this.getList();
            uni.showToast({
              title: err.msg,
              icon: "none"
            });
          }
        );
    }
  },
  onPullDownRefresh() {
    this.getList();
  }
};
</script>

<style lang="less" >
.v1 {
  display: flex;
  align-items: center;
  background-color: #fff;
  padding: 20upx 0;
  .v1-item {
    flex: 1;
    text-align: center;
    border-right: 1px solid #999;
    color: #29292f;
    &:last-child {
      border: none;
    }
  }
}
.v2 {
  text-align: left;
}
.group {
  background-color: #ffffff;
  position: relative;
  .row {
    display: flex;
    flex-direction: row;
    position: relative;
    align-items: center;
    min-height: 60upx;
    padding: 15upx 0;
    line-height: 50upx;
    .title {
      width: 20%;
      text-align: right;
    }
    &.border {
      &:after {
        position: absolute;
        right: 0;
        bottom: 0;
        left: 15upx;
        height: 1upx;
        content: "";
        -webkit-transform: scaleY(0.5);
        transform: scaleY(0.5);
        background-color: #c8c7cc;
      }
    }
  }
}
.input {
  flex: 1;
  padding: 0 5px;
  width: 100%;
}
.scroll {
  max-height: 200upx;
  position: relative;
  &:after {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 7px;
    height: 0.5px;
    content: "";
    -webkit-transform: scaleY(0.5);
    -ms-transform: scaleY(0.5);
    transform: scaleY(0.5);
    background-color: #c8c7cc;
  }
}
.v3 {
  margin-top: 20upx;
}
</style>
