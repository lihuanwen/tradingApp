<template>
  <section class="ui-flex-1 ui-content">
    <Alert type="warning" closable>查询全部交易对的订单将非常缓慢，谨慎使用。</Alert>
    <div class="ui-flex">
      <Form ref="search" inline class="ui-flex-1 inlineForm">
        <FormItem label="交易所：">
          <Select v-model="table.search.marketConfigID" style="width:200px" filterable>
            <Option
              v-for="item in marketConfigList"
              :value="item.ID"
              :key="item.ID"
            >{{item.market}} : {{item.note}}</Option>
          </Select>
        </FormItem>
        <FormItem label="交易对：">
          <Select v-model="table.search.symbol" style="width:100px" filterable>
            <Option v-for="item in marketSymbolList" :value="item" :key="item">{{item}}</Option>
          </Select>
        </FormItem>
        <FormItem label="状态：">
          <Select v-model="table.search.orderType" style="width:100px" filterable>
            <Option value="all">全部</Option>
            <Option value="open">未成交</Option>
            <Option value="closed">已成交</Option>
          </Select>
        </FormItem>
        <FormItem>
          <Button type="primary" @click="getList()" icon="ios-search">查 询</Button>
        </FormItem>
      </Form>
      <div>
        <Button type="success" @click="exportData(1)" icon="ios-download-outline">导出</Button>
      </div>
    </div>
    <!-- <loading v-if="loading == true"></loading>
    <error v-else-if="loading == 'err'" @click.native="getList()"></error>
    <no-data v-else-if="data == null"></no-data>-->
    <data-table
      ref="table"
      :data="table.data"
      :columns="table.columns"
      :tableProps="table.tableProps"
      :loading="table.loading"
      :pagination="table.pagination"
    />
  </section>
</template>

<script>
export default {
  data() {
    return {
      marketConfigList: null,
      marketSymbolList: null,
      table: {
        search: {
          marketConfigID: null,
          symbol: null,
          orderType: 'all'
        },
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
        .then(
          data => {
            this.marketConfigList = data.rows;
          },
          err => {
            this.marketConfigList = [];
          }
        );
    },
    getSymbols(marketConfigID) {
      this.$ajax.post(this.$path.capital.symbols, { ID: marketConfigID }).then(
        data => {
          this.marketSymbolList = data;
        },
        err => {
          this.marketSymbolList = [];
        }
      );
    },
    getList() {
      let table = this.table;
      table.loading = true;
      this.$ajax
        .post(this.$path.capital.fetchOrder, {
          ID: table.search.marketConfigID,
          symbol: table.search.symbol,
          orderType: table.search.orderType
        })
        .then(
          data => {
            table.loading = false;
            table.data = data;
          },
          err => {
            table.loading = false;
            table.data = [];
          }
        );
    },
    cancelOrder(orderID) {
      let search = this.table.search;
      this.$ajax
        .post(this.$path.capital.cancelOrder, {
          ID: search.marketConfigID,
          symbol: search.symbol,
          orderID: orderID
        })
        .then(
          data => {
            this.getList();
          },
          err => {
            this.getList();
          }
        );
    },
    exportData(type) {
      switch (type) {
        case 1:
          this.$refs.table.$refs.table.exportCsv({
            filename: '原始订单记录'
          });
          break;
      }
    }
  },
  watch: {
    'table.search.marketConfigID'(val) {
      this.getSymbols(val);
    }
  }
};
</script>

<style lang="less" scoped>
</style>
