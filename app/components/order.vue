<template>
  <view class="div-table" v-if="data.length>0">
    <view class="thead">
      <view class="th">
        <view class="td" v-for="(item,index) in columns" :key="index">{{item.title}}</view>
      </view>
    </view>
    <view class="tbody">
      <view class="tr" v-for="(item,index) in data" :key="index">
        <template v-for="(e,i) in columns">
          <view
            class="td"
            :key="i"
            v-if="e.key === 'type'"
            :class="item.side === 'buy'
              ? 'success'
              : 'error'
              "
          >
            {{item.type === "limit"
            ? "限价"
            : "市价"}}{{item.side === "buy"
            ? "买入"
            : "卖出"
            }}
          </view>
          <view
            class="td"
            :key="i"
            v-else-if="e.key === 'status'"
            :class="item.status === 'open'
              ? 'error'
              : item.status === 'canceled'
              ? 'warning'
              : item.remaining > 0
              ? 'primary'
              : 'success'"
          >
            {{item.status === "open"
            ? "未成交"
            : item.status === "canceled"
            ? "已取消"
            : item.remaining > 0
            ? "部分成交"
            : "完全成交"}}
          </view>
          <view class="td" :key="i" v-else-if="e.key === 'ctrl'">
            <view v-if="item.status === 'open'" class="warning" @tap="cancelOrder(item)">撤单</view>
          </view>
          <view
            class="td"
            :key="i"
            v-else
            :style="e.align ? 'text-align:'+e.align : ''"
          >{{item[e.key]}}</view>
        </template>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    data: Array
  },
  data() {
    return {
      columns: [
        // {
        //   title: "交易对",
        //   key: "symbol"
        // },
        {
          title: "类型",
          key: "type"
        },
        {
          title: "状态",
          key: "status"
        },
        {
          title: "单价",
          key: "price",
          align: "right"
        },
        {
          title: "币量",
          key: "amount",
          align: "right"
        },
        {
          title: "交易额",
          key: "cost",
          align: "right"
        },
        {
          title: "操作",
          key: "ctrl"
        }
      ]
    };
  },
  methods: {
    cancelOrder(item) {
      this.$emit("cancelOrder", item.id);
    }
  }
};
</script>

<style lang="scss">
$div-table-border-color: #c8c7cc;
$div-table-border-width: 1upx;
.error {
  color: #ed4014;
}
.warning {
  color: #ff9900;
}
.primary {
  color: #2db7f5;
}
.success {
  color: #19be6b;
}
.div-table {
  background-color: #fff;
  display: table;
  width: 100%;
  height: 100%;
  border: $div-table-border-width solid $div-table-border-color;
  box-sizing: border-box;
  table-layout: fixed;
  position: relative;
  .celspan {
    display: table;
    width: 100%;
    height: 100%;
    .td {
      display: table-cell;
      border: none !important;
    }
    .td + .td {
      border-left: $div-table-border-width solid $div-table-border-color !important;
    }
  }
  .rowspan {
    display: table;
    width: 100%;
    height: 100%;
    .tr {
      display: table-row;
      border: none !important;
    }
  }

  &.fixed-thead {
    .tbody,
    .thead,
    .tr,
    .th,
    .td {
      display: block;
    }
    .tr,
    .th {
      &:after {
        content: "";
        display: block;
        visibility: hidden;
        clear: both;
        height: 0;
      }
    }
    .td {
      float: left;
      width: 33.33%;
    }
    .tbody {
      height: 400upx;
      overflow-y: auto;
      overflow-x: hidden;
    }
  }

  .tr,
  .th {
    display: table-row;
    & + .tr,
    & + .th {
      .td,
      .th {
        border-top: $div-table-border-width solid $div-table-border-color;
        word-break: break-word;
      }
    }
  }
  .rowspan {
    .tr,
    .th {
      display: table-row;
      .td,
      .th {
        border: none;
      }
      & + .tr,
      & + .th {
        .td,
        .th {
          border-top: $div-table-border-width solid $div-table-border-color;
        }
      }
    }
  }
  .td {
    display: table-cell;
    vertical-align: middle;
    text-align: center;
    box-sizing: border-box;
    padding: 6upx 4upx;
    &.noPadding {
      padding: 0;
    }
    & + .td {
      border-left: $div-table-border-width solid $div-table-border-color;
    }
  }
  .th .td {
    // font-weight: bold;
  }
  .tbody {
    display: table-row-group;
  }
  .thead {
    display: table-header-group;
    .tr,
    .th {
      .td,
      .th {
        border-bottom: $div-table-border-width solid $div-table-border-color;
      }
    }
  }
  .tfoot {
    display: table-footer-group;
    .tr,
    .th {
      .td,
      .th {
        border-top: $div-table-border-width solid $div-table-border-color;
      }
    }
  }
  .colgroup {
    display: table-column-group;
  }
  .col {
    display: table-column;
  }
  .caption {
    display: table-caption;
  }
}
</style>
