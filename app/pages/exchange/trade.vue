<template>
  <view class="content">
    <view class="v1" @click="search.show = true">
      <text
        class="v1-item"
      >{{search.marketConfig.select ? search.marketConfig.select.text : '选择交易所'}}</text>
      <text class="v1-item">{{search.marketSymbol.select ? search.marketSymbol.select : '选择交易对'}}</text>
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
      </view>
      <button type="primary" @tap="search.show= false;addListen()">确 定</button>
    </uni-popup>
    <view class="createOrder" v-if="search.marketConfig.select && search.marketSymbol.select">
      <view class="side uni-flex">
        <view
          class="buy"
          @click="formItem.side = 'buy'"
          :class="{active:formItem.side ===  'buy'}"
        >买入</view>
        <view
          class="sell"
          @click="formItem.side = 'sell'"
          :class="{active:formItem.side ===  'sell'}"
        >卖出</view>
      </view>
      <view class="group">
        <view class="row border">
          <text class="title">类型：</text>
          <radio-group class="input" @change="typeChange">
            <label>
              <radio value="limit" :checked="formItem.type  === 'limit'"/>限价单
            </label>
            <label>
              <radio value="market" :checked="formItem.type  === 'market'"/>市价单
            </label>
          </radio-group>
        </view>
        <!-- <view class="row border" v-if="formItem.type ==='limit' "> -->
        <view class="row border">
          <text class="title">价格：</text>
          <input
            class="input"
            type="number"
            :disabled="formItem.type ==='market'"
            v-model="formItem.price"
          >
        </view>
        <!-- <view class="row border" v-if="formItem.type ==='limit' || formItem.side=== 'sell'"> -->
        <view class="row border">
          <text class="title">数量：</text>
          <input
            class="input"
            type="number"
            :disabled="formItem.type ==='market'"
            v-model="formItem.amount"
          >
        </view>
        <!-- <view class="row" v-if="formItem.type ==='market' &&formItem.side=== 'buy'"> -->
        <view class="row">
          <text class="title">成交额：</text>
          <input
            class="input"
            type="number"
            :disabled="formItem.type ==='limit'"
            v-model="formItem.total"
          >
        </view>
      </view>
      <view class="button">
        <uni-notice-bar v-if="formItem.loading === -1" :text="formItem.errMsg"></uni-notice-bar>
        <button
          :class="formItem.side"
          @tap="createOrder()"
          :loading="formItem.loading === 1"
        >{{formItem.side === 'buy' ? "买 入" : "卖 出"}}</button>
      </view>
    </view>
    <view class="v3">
      <order :data="orders.data" @cancelOrder="cancelOrder"/>
    </view>
    <!-- <div>
      <div class="depth">
        <ul class="ask">
          <li class="ui-flex">
            <span class="price">价格</span>
            <span class="amount">数量</span>
            <span class="count">成交额</span>
          </li>
          <li v-for="(item,index) in depth.asks" :key="index" class="ui-flex">
            <span class="price">{{item[0]}}</span>
            <span class="amount">{{item[1]}}</span>
            <span class="count">{{(item[0]*item[1]).toFixed(4)}}</span>
          </li>
        </ul>
        <p></p>
        <ul class="bid">
          <li v-for="(item,index) in depth.bids" :key="index" class="ui-flex">
            <span class="price">{{item[0]}}</span>
            <span class="amount">{{item[1]}}</span>
            <span class="count">{{(item[0]*item[1]).toFixed(4)}}</span>
          </li>
        </ul>
      </div>
      <div class="trade">
        <ul>
          <li class="ui-flex">
            <span class="date">时间</span>
            <span class="type">类型</span>
            <span class="price">价格</span>
            <span class="amount">数量</span>
          </li>
          <li v-for="(item,index) in trade" :key="index" class="ui-flex">
            <span class="date">{{item.ts}}</span>
            <span class="type" :class="item.direction">{{item.direction}}</span>
            <span class="price">{{item.price}}</span>
            <span class="amount">{{item.amount}}</span>
          </li>
        </ul>
      </div>
    </div>-->
  </view>
</template>

<script>
import coin from "@/common/coin";

import uniNoticeBar from "@/components/uni-notice-bar/uni-notice-bar.vue";
import uniPopup from "@/components/uni-popup/uni-popup.vue";
import scroller from "@/mixins/scroller";
import uniGrid from "@/components/uni-grid/uni-grid.vue";
import order from "@/components/order.vue";

import selectMarket from "@/mixins/selectMarket";
export default {
  components: {
    uniPopup,
    uniGrid,
    uniNoticeBar,
    order
  },
  mixins: [selectMarket],
  data() {
    return {
      market: null,
      formItem: {
        side: "buy",
        type: "limit",
        amount: 0,
        price: 0,
        total: 0,
        loading: 0,
        errMsg: null
      },
      orders: {
        data: [],
        loading: false
      }
    };
  },
  mounted() {},
  methods: {
    typeChange(e) {
      this.formItem.type = e.detail.value;
    },
    async addListen() {
      this.getOrderList();
      return true;
      const { marketName, symbol } = this.query;
      if (!this.market || this.market.id !== marketName) {
        const market = new coin[marketName]();
        await market.initWebSocket();
        market.events.on("depth", data => {});
        market.events.on("kline", data => {});
        market.events.on("trade", data => {});
        this.market = market;
      }
      // 订阅新数据
      this.market.sub(symbol);
    },
    getOrderList() {
      let orders = this.orders;
      orders.loading = true;
      this.$ajax
        .post(this.$path.capital.fetchOrder, {
          ...this.query,
          orderType: "open"
        })
        .then(data => {
          orders.loading = false;
          orders.data = data;
          uni.stopPullDownRefresh();
        })
        .catch(() => {
          orders.loading = false;
          uni.stopPullDownRefresh();
        });
    },
    createOrder() {
      const { formItem } = this;
      formItem.loading = 1;
      this.$ajax
        .post(this.$path.capital.createOrder, {
          ...this.query,
          ...formItem
        })
        .then(
          data => {
            this.getOrderList();
            formItem.loading = 0;
            uni.showToast({
              title: "操作成功",
              icon: "success"
            });
          },
          err => {
            this.getOrderList();
            formItem.loading = -1;
            formItem.errMsg = err.msg;
            uni.showToast({
              title: err.msg,
              icon: "none"
            });
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
            this.getOrderList();
            uni.showToast({
              title: "操作成功",
              icon: "success"
            });
          },
          err => {
            this.getOrderList();
            uni.showToast({
              title: err.msg,
              icon: "none"
            });
          }
        );
    }
  },
  onPullDownRefresh() {
    this.getOrderList();
  },
  watch: {
    formItem: {
      deep: true,
      handler(val) {
        if (val.type === "limit") {
          val.total = val.amount * val.price;
        } else {
          val.amount = val.total / val.price;
        }
      }
    }
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
  max-height: 400upx;
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

.createOrder {
  margin-top: 20upx;
  .side {
    .buy,
    .sell {
      width: 50%;
      text-align: center;
      padding: 13upx 15upx;
      font-size: 32upx;
      background-color: #fff;
    }
    .buy {
      &.active {
        color: #fff;
        background-color: #4db872;
      }
    }
    .sell {
      &.active {
        color: #fff;
        background-color: #ee6560;
      }
    }
  }
  .group {
    margin: 20upx 0;
  }
  .button {
    .buy {
      background-color: #4db872;
      color: #fff;
    }
    .sell {
      background-color: #ee6560;
      color: #fff;
    }
  }
}
.depth {
  width: 270px;
  height: 100%;
  border: 1px solid #333;
  padding: 3px;
  .bid {
    height: 200px;
    overflow: hidden;
    .price {
      color: #4db872;
    }
  }
  .ask {
    height: 200px;
    overflow: hidden;
    .price {
      color: #ee6560;
    }
  }
  .price,
  .amount,
  .count {
    text-align: right;
    padding: 0 2px;
    overflow: hidden;
  }
  .price {
    width: 25%;
  }
  .amount {
    width: 30%;
  }
  .count {
    width: 40%;
  }
}
.trade {
  width: 270px;
  height: 100%;
  border: 1px solid #333;
  padding: 3px;
  .date,
  .type,
  .price,
  .amount {
    text-align: right;
    padding: 0 2px;
    overflow: hidden;
  }
  .date {
    width: 15%;
  }
  .type {
    width: 15%;
  }
  .price {
    width: 40%;
  }
  .amount {
    width: 30%;
  }
  .buy {
    color: #4db872;
  }
  .sell {
    color: #ee6560;
  }
}

.v3 {
  margin-top: 20upx;
}
</style>
