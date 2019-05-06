<template>
  <section class="ui-flex-1 ui-content">
    <div class="ui-flex">
      <Form ref="search" inline :label-width="80" class="ui-flex-1">
        <FormItem label="交易所：">
          <Select v-model="search.marketConfigID" style="width:200px" filterable>
            <Option
              v-for="item in marketConfigList"
              :value="item.ID"
              :key="item.ID"
            >{{item.market}} : {{item.note}}</Option>
          </Select>
        </FormItem>
        <FormItem label="交易对：">
          <Select v-model="search.symbol" style="width:200px" filterable>
            <Option v-for="item in marketSymbolList" :value="item" :key="item">{{item}}</Option>
          </Select>
        </FormItem>
      </Form>
    </div>
    <!-- <div class="ui-flex">
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
    <div>
      <div class="ui-flex">
        <div class="kline" id="kline_container"></div>
        <div class="addOrder ui-flex-1">
          <div class="side ui-flex">
            <div
              @click="formItem.side = 'buy'"
              class="buy"
              :class="{active:formItem.side ===  'buy'}"
            >买入</div>
            <div
              @click="formItem.side = 'sell'"
              class="sell"
              :class="{active:formItem.side ===  'sell'}"
            >卖出</div>
          </div>
          <Form :model="formItem" :label-width="40" class="form">
            <FormItem label="类型">
              <Select v-model="formItem.type">
                <Option value="limit">限价单</Option>
                <Option value="market">市价单</Option>
              </Select>
            </FormItem>
            <FormItem label="价格" v-if="formItem.type ==='limit' ">
              <InputNumber :min="0" v-model="formItem.price" style="width:100%"></InputNumber>
            </FormItem>
            <FormItem label="数量" v-if="formItem.type ==='limit' || formItem.side=== 'sell'">
              <InputNumber :min="0" v-model="formItem.amount" style="width:100%"></InputNumber>
            </FormItem>
            <FormItem label="金额" v-if="formItem.type ==='market' &&formItem.side=== 'buy'">
              <InputNumber :min="0" v-model="formItem.price" style="width:100%"></InputNumber>
            </FormItem>
            <Button
              :type="formItem.side ==='buy' ? 'success' : 'error'"
              @click="createOrder"
              style="width:100%"
            >{{formItem.side === 'buy' ? "买 入" : "卖 出"}}</Button>
          </Form>
        </div>
      </div>
      <Tabs v-model="orders.orderType">
        <TabPane label="未成交" name="open"></TabPane>
        <TabPane label="历史委托" name="closed"></TabPane>
      </Tabs>
      <data-table
        :data="orders.data"
        :columns="orders.columns"
        :tableProps="orders.tableProps"
        :loading="orders.loading"
        :pagination="orders.pagination"
      />
    </div>
    <!-- <loading v-if="loading == true"></loading>
    <error v-else-if="loading == 'err'" @click.native="getList()"></error>
    <no-data v-else-if="data == null"></no-data>-->
  </section>
</template>

<script>
import coin from '@/coin';
// import Kline from '@/libs/kline';
import Kline from 'kline';
import $ from 'jquery';
import mousewheel from 'jquery-mousewheel';
$.mousewheel = mousewheel;
window.$ = $;
export default {
  components: {},
  data() {
    return {
      marketConfigList: null,
      marketSymbolList: null,
      search: {
        marketConfigID: null,
        symbol: null
      },
      market: null,
      Kline: null,
      formItem: {
        type: 'limit',
        side: 'sell',
        amount: 0,
        price: 0
      },
      orders: {
        orderType: 'open',
        columns: [
          {
            title: '交易对',
            key: 'symbol',
            align: 'center',
            width: 100
          },
          {
            title: '委托时间',
            key: 'datetime',
            align: 'right',
            width: 200
          },
          {
            title: '类型',
            key: 'type',
            align: 'center',
            render: (h, params) => {
              return h('div', [
                h('span', {}, params.row.type === 'limit' ? '限价' : '市价'),
                h('span', {}, params.row.side === 'buy' ? '买入' : '卖出')
              ]);
            }
          },
          {
            title: '状态',
            key: 'status',
            align: 'center',
            width: 140,
            render: (h, params) => {
              const row = params.row;
              const color =
                row.status === 'open'
                  ? 'error'
                  : row.status === 'canceled'
                    ? 'warning'
                    : row.remaining > 0
                      ? 'primary'
                      : 'success';
              const text =
                row.status === 'open'
                  ? '未成交'
                  : row.status === 'canceled'
                    ? '已取消'
                    : row.remaining > 0
                      ? '部分成交'
                      : '完全成交';
              return h(
                'Tag',
                {
                  props: {
                    type: 'dot',
                    color: color
                  }
                },
                text
              );
            }
          },
          {
            title: '单价',
            key: 'price',
            align: 'right'
          },
          {
            title: '币量',
            key: 'amount',
            align: 'right'
          },
          {
            title: '交易额',
            key: 'amount',
            align: 'right',
            render: (h, params) => {
              return h('div', [
                h('span', {}, params.row.cost)
              ]);
            }
          },
          {
            title: '操作',
            width: 80,
            align: 'center',
            render: (h, params) => {
              if (params.row.status === 'open') {
                return h('div', [
                  h(
                    'Button',
                    {
                      props: {
                        type: 'error',
                        size: 'small'
                      },
                      on: {
                        click: () => {
                          this.cancelOrder(params.row.id);
                        }
                      }
                    },
                    '撤 单'
                  )
                ]);
              } else {
                return '';
              }
            }
          }
        ],
        tableProps: { size: 'small' },
        data: [],
        loading: false,
        pagination: {
          show: false
        }
      }
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      this.$ajax
        .post(this.$path.setting.marketConfig.list, { state: [1] })
        .then(data => {
          this.marketConfigList = data.rows;
        });
      this.Kline = new Kline({
        element: '#kline_container',
        disableFirebase: true,
        width: 1000,
        height: 500,
        ranges: ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w'],
        onRangeChange: range => {
          if (this.market) {
            // 订阅新数据
            this.Kline.Control.pushData();
            this.market.sub(this.search.symbol, 'kline', range);
          }
        }
        // symbol: 'BTC',
        // symbolName: '比特币',
      });
      this.Kline.draw();
    },
    getSymbols(marketConfigID) {
      this.$ajax
        .post(this.$path.capital.symbols, { ID: marketConfigID })
        .then(data => {
          this.marketSymbolList = data;
        });
    },
    async addListen() {
      const marketName = this.marketConfigList.filter(item => {
        return item.ID === this.search.marketConfigID;
      })[0].market;
      if (!this.market || this.market.id !== marketName) {
        // 新建交易所对象，并连接交易所，吧交易所对象保存下来。
        const market = new coin[marketName]();
        await market.initWebSocket();
        let Kline = this.Kline;
        market.events.on('depth', data => {
          Kline.Control.pushData('Depth', data);
        });
        market.events.on('kline', data => {
          Kline.Control.pushData('Kline', data);
        });
        market.events.on('trade', data => {
          Kline.Control.pushData('Trade', data);
        });
        this.market = market;
      }
      // 订阅新数据
      this.market.sub(this.search.symbol);
    },
    createOrder() {
      this.$ajax
        .post(this.$path.capital.createOrder, {
          ID: this.search.marketConfigID,
          symbol: this.search.symbol,
          ...this.formItem
        })
        .then(
          data => {
            this.getOrderList();
          },
          err => {
            this.getOrderList();
          }
        );
    },
    cancelOrder(orderID) {
      this.$ajax
        .post(this.$path.capital.cancelOrder, {
          ID: this.search.marketConfigID,
          symbol: this.search.symbol,
          orderID: orderID
        })
        .then(
          data => {
            this.getOrderList();
          },
          err => {
            this.getOrderList();
          }
        );
    },
    getOrderList() {
      let orders = this.orders;
      orders.loading = true;
      this.$ajax
        .post(this.$path.capital.fetchOrder, {
          ID: this.search.marketConfigID,
          symbol: this.search.symbol,
          orderType: orders.orderType
        })
        .then(data => {
          orders.loading = false;
          orders.data = data;
        })
        .catch(() => {
          orders.loading = false;
        });
    }
  },
  watch: {
    'search.marketConfigID'(val) {
      this.getSymbols(val);
    },
    'search.symbol'(val) {
      this.addListen();
      this.getOrderList();
    },
    'orders.orderType'(val) {
      this.getOrderList();
    }
  }
};
</script>

<style lang="less" scoped>
.addOrder {
  max-width: 300px;
  padding: 0 10px;
  .side {
    width: 100%;
    div {
      width: 50%;
      // background-color: #000;
      text-align: center;
      padding: 3px 5px;
      font-size: 14px;
      cursor: pointer;
    }
    .buy {
      &.active {
        color: #fff;
        background-color: green;
      }
    }

    .sell {
      &.active {
        color: #fff;
        background-color: red;
      }
    }
  }
  .form {
    margin-top: 10px;
  }
}
// .depth {
//   width: 270px;
//   height: 100%;
//   border: 1px solid #333;
//   padding: 3px;
//   .bid {
//     height: 200px;
//     overflow: hidden;
//     .price {
//       color: green;
//     }
//   }
//   .ask {
//     height: 200px;
//     overflow: hidden;
//     .price {
//       color: red;
//     }
//   }
//   .price,
//   .amount,
//   .count {
//     text-align: right;
//     padding: 0 2px;
//     overflow: hidden;
//   }
//   .price {
//     width: 25%;
//   }
//   .amount {
//     width: 30%;
//   }
//   .count {
//     width: 40%;
//   }
// }
// .trade {
//   width: 270px;
//   height: 100%;
//   border: 1px solid #333;
//   padding: 3px;
//   .date,
//   .type,
//   .price,
//   .amount {
//     text-align: right;
//     padding: 0 2px;
//     overflow: hidden;
//   }
//   .date {
//     width: 15%;
//   }
//   .type {
//     width: 15%;
//   }
//   .price {
//     width: 40%;
//   }
//   .amount {
//     width: 30%;
//   }
//   .buy {
//     color: green;
//   }
//   .sell {
//     color: red;
//   }
// }
</style>
