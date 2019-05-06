<template>
  <view class="div-table" v-if="data.length > 0">
    <view class="thead">
      <view class="th">
        <view class="td" v-for="(item,index) in columns" :key="index">{{item.title}}</view>
      </view>
    </view>
    <view class="tbody">
      <view class="tr" v-for="(item,index) in data" :key="index">
        <view class="td" v-for="(e,i) in columns" :key="i">{{item[e.key]}}</view>
      </view>
    </view>
    <!-- <view class="tfoot">
      <view class="tr">
        <view class="td">1</view>
        <view class="td">2</view>
        <view class="td">3</view>
      </view>
    </view>-->
  </view>
</template>

<script>
export default {
  props: {
    data: Array,
    columns: Array
  },
  data() {
    return {};
  }
};
</script>

<style lang="scss">
$div-table-border-color: #c8c7cc;
$div-table-border-width: 1upx;

.div-table {
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
