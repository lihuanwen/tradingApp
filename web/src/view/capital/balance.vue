<template>
  <section class="ui-flex-1 ui-content">
    <div class="ui-flex">
      <Form ref="search" inline class="ui-flex-1 inlineForm">
        <FormItem label="交易所：">
          <Select v-model="marketConfigID" style="width:200px">
            <Option
              v-for="item in marketConfigList"
              :value="item.ID"
              :key="item.ID"
            >{{item.market}} : {{item.note}}</Option>
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
    <div class="ui-flex" v-if="marketConfigID">
      <div class="balance">
        <h2>{{balance.total ? balance.total.toFixed(5) : '-'}}</h2>
        <p class="ui-flex">
          <label>可用($)</label>
          <span class="ui-flex-1">{{balance.free ? balance.free.toFixed(5) : '-'}}</span>
        </p>
        <p class="ui-flex">
          <label>冻结($)</label>
          <span class="ui-flex-1">{{balance.used ? balance.used.toFixed(5) : '-'}}</span>
        </p>
        <div ref="echart" style="width: 200px; height: 200px;"></div>
      </div>
      <div class="table">
        <data-table
          ref="table"
          :data="table.data"
          :columns="table.columns"
          :tableProps="table.tableProps"
          :loading="table.loading"
          :pagination="table.pagination"
        />
      </div>
    </div>
  </section>
</template>

<script>
import echarts from 'echarts';
// import tdTheme from './theme.json'
// echarts.registerTheme('tdTheme', tdTheme)
export default {
  components: {},
  data() {
    return {
      marketConfigList: null,
      marketConfigID: null,
      table: {
        search: {
          keyWord: '',
          state: [1]
        },
        columns: [
          {
            title: '币种',
            key: 'asset',
            align: 'center'
          },
          {
            title: '可用',
            key: 'free',
            align: 'right',
            sortable: true
          },
          {
            title: '冻结',
            key: 'used',
            align: 'right',
            sortable: true
          },
          {
            title: '总量',
            key: 'total',
            align: 'right',
            sortable: true
          },
          {
            title: '总折合美元',
            key: 'totalUSDT',
            align: 'right',
            sortable: true
          }
        ],
        tableProps: {
          size: 'small',
          height: 300
        },
        data: [],
        loading: false,
        pagination: {
          show: false
        }
      },
      balance: {
        free: 0,
        used: 0,
        total: 0,
        echart: []
      }
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    getFullNum(num) {
      // 处理非数字
      if (isNaN(num)) {
        return num;
      }

      // 处理不需要转换的数字
      let str = String(num);
      if (!/e/i.test(str)) {
        return num;
      }

      return num.toFixed(18).replace(/\.?0+$/, '');
    },
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
    async getList() {
      let table = this.table;
      table.loading = true;
      try {
        const balance = await this.$ajax.post(this.$path.capital.balance, {
          ID: this.marketConfigID
        });
        const markets = await this.$ajax.post(this.$path.capital.markets, {
          ID: this.marketConfigID
        });
        const tickers = await this.$ajax.post(this.$path.capital.tickers, {
          ID: this.marketConfigID
        });
        let temp = {
          free: 0,
          used: 0,
          total: 0,
          echart: []
        };
        let temp2 = [];
        for (const key in balance) {
          if (balance.hasOwnProperty(key)) {
            const item = balance[key];
            // if (item.total != null ) {
            if (item.total) {
              const market = markets[`${key}/USDT`];
              const ticker = tickers[`${key}/USDT`];
              let price = key === 'USDT' || !ticker ? 1 : ticker.last;
              if (
                key === 'USDT' ||
                (market && item.total > market.limits.amount.min)
              ) {
                let free = item.free * price;
                let used = item.used * price;
                let total = item.total * price;
                temp.free += free;
                temp.used += used;
                temp.total += total;
                temp.echart.push({ name: key, value: total });
              }
              temp2.push({
                asset: key,
                free: this.getFullNum(item.free),
                used: this.getFullNum(item.used),
                total: this.getFullNum(item.total),
                totalUSDT:
                  key === 'USDT' ||
                  (market && item.total > market.limits.amount.min)
                    ? item.total * price
                    : ''
              });
            }
          }
        }
        table.loading = false;
        this.balance = temp;
        table.data = temp2;
        echarts.init(this.$refs.echart, 'tdTheme').setOption({
          tooltip: {
            trigger: 'item',
            formatter: '{b} : {c} ({d}%)'
          },
          series: [
            {
              type: 'pie',
              radius: '55%',
              center: ['50%', '60%'],
              data: temp.echart,
              itemStyle: {
                emphasis: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
              }
            }
          ]
        });
      } catch (error) {
        table.loading = false;
        table.data = [];
      }
    },
    exportData(type) {
      switch (type) {
        case 1:
          this.$refs.table.$refs.table.exportCsv({
            filename: '原始币量数据'
          });
          break;
        case 2:
          this.$refs.table.$refs.table.exportCsv({
            filename: '筛选后币量数据',
            original: false
          });
          break;
      }
    }
  }
};
</script>

<style lang="less" scoped>
.balance {
  width: 200px;
  padding-right: 10px;
  span {
    text-align: right;
  }
}
.table {
  flex: 1;
}
</style>
