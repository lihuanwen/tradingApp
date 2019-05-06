<template>
  <view class="content">
    <pageLoading :loading="loading" :errMsg="loadingErrMsg" @click="getList()"></pageLoading>
    <template v-if="balance">
      <uniNoticeBar show-close text="币值小于0.1元的币种不加入统计。"></uniNoticeBar>
      <uniCard title="资产统计" :extra="'￥ '+balance.info.total">
        <view class="uni-flex">
          <text>可用：</text>
          <text class="text">￥ {{balance.info.free ? balance.info.free : '-'}}</text>
        </view>
        <view class="uni-flex">
          <text>冻结：</text>
          <text class="text">￥ {{balance.info.used ? balance.info.used : '-'}}</text>
        </view>
        <!-- <mpvue-echarts class="ec-canvas" :onInit="pieInit" canvasId="pie" ref="pieChart"/> -->
      </uniCard>
      <view class="balance" v-for="(item,index) in balance.detail" :key="index">
        <view class="balanceHeader uni-flex">
          <text>{{item.market+ ' ' + item.note}}</text>
          <text class="text">￥ {{item.info.total ? item.info.total : '-'}}</text>
        </view>
        <uniNoticeBar v-if="item.err.length" :text="'未找到汇率：'+item.err.join('，')"></uniNoticeBar>
        <view class="balanceCenter">
          <view class="uni-flex">
            <text>可用：</text>
            <text class="text">￥ {{item.info.free ? item.info.free : '-'}}</text>
          </view>
          <view class="uni-flex">
            <text>冻结：</text>
            <text class="text">￥ {{item.info.used ? item.info.used : '-'}}</text>
          </view>
          <dataTable :data="item.detail" :columns="columns"/>
        </view>
      </view>
      <!-- <uni-collapse>
        <uni-collapse-item
          v-for="(item,index) in balance.detail"
          :key="index"
          :title="item.market+ ' ' + item.note"
          :show-animation="true"
        ></uni-collapse-item>
      </uni-collapse>-->
    </template>
  </view>
</template>

<script>
import uniNoticeBar from "@/components/uni-notice-bar/uni-notice-bar.vue";
import pageLoading from "@/components/page-loading.vue";

import uniCard from "@/components/uni-card/uni-card.vue";
// import uniCollapse from "@/components/uni-collapse/uni-collapse.vue";
// import uniCollapseItem from "@/components/uni-collapse-item/uni-collapse-item.vue";
import dataTable from "@/components/dataTable.vue";

// import * as echarts from "@/components/echarts/echarts.simple.min.js";
// import mpvueEcharts from "@/components/mpvue-echarts/src/echarts.vue";

export default {
  components: {
    uniNoticeBar,
    pageLoading,

    uniCard,
    // uniCollapse,
    // uniCollapseItem,
    dataTable

    // mpvueEcharts,
  },
  data() {
    return {
      columns: [
        {
          title: "币种",
          key: "asset",
          align: "center"
        },
        {
          title: "可用",
          key: "free",
          align: "right"
        },
        {
          title: "冻结",
          key: "used",
          align: "right"
        },
        {
          title: "总量",
          key: "total",
          align: "right"
        },
        {
          title: "折合人民币",
          key: "totalCNY",
          align: "right"
        }
      ],
      data: [],
      loading: 1,
      loadingErrMsg: "",
      balance: null
    };
  },
  mounted() {
    this.getList();
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
      return num.toFixed(18).replace(/\.?0+$/, "");
    },
    async getList() {
      this.loading = 1;
      this.$ajax.post(this.$path.capital.balance).then(
        data => {
          this.balance = data;
          this.loading = 0;
          uni.stopPullDownRefresh();
        },
        err => {
          this.loadingErrMsg = err.msg;
          this.loading = -1;
          uni.showToast({
            title: err.msg,
            icon: "none"
          });
          uni.stopPullDownRefresh();
        }
      );
    }
    // pieInit(canvas, width, height) {
    //   echarts.setCanvasCreator(() => canvas);
    //   let pieChart = echarts.init(canvas, null, { width, height });
    //   canvas.setChart(pieChart);

    //   pieChart.setOption({
    //     animation: false,
    //     backgroundColor: "#F8F8F8",
    //     color: [
    //       "#37A2DA",
    //       "#32C5E9",
    //       "#67E0E3",
    //       "#91F2DE",
    //       "#FFDB5C",
    //       "#FF9F7F"
    //     ],
    //     series: [
    //       {
    //         label: {
    //           normal: {
    //             fontSize: 14
    //           }
    //         },
    //         type: "pie",
    //         center: ["50%", "50%"],
    //         radius: [0, "60%"],
    //         data: [
    //           {
    //             value: 55,
    //             name: "北京"
    //           },
    //           {
    //             value: 38,
    //             name: "上海"
    //           },
    //           {
    //             value: 20,
    //             name: "广州"
    //           }
    //         ],
    //         itemStyle: {
    //           emphasis: {
    //             shadowBlur: 10,
    //             shadowOffsetX: 0,
    //             shadowColor: "rgba(0, 2, 2, 0.3)"
    //           }
    //         }
    //       }
    //     ]
    //   });
    //   return pieChart;
    // }
  },
  onPullDownRefresh() {
    this.getList();
  }
};
</script>

<style lang="less">
.total {
  font-size: 28upx;
  font-weight: bold;
}
.uni-card {
  margin: 20upx 0;
  .uni-card__header-extra-text {
    font-size: 32upx;
  }
}
// .ec-canvas {
//   width: 100%;
//   height: 200px;
// }
.text {
  flex: 1;
  text-align: right;
}
.uni-noticebar {
  margin-bottom: 0;
}
.balance {
  border-radius: 8upx;
  background-color: #fff;
  position: relative;
  margin-bottom: 20upx;
  &:after {
    content: "";
    position: absolute;
    transform-origin: center;
    box-sizing: border-box;
    pointer-events: none;
    top: -50%;
    left: -50%;
    right: -50%;
    bottom: -50%;
    border: 2upx solid #c8c7cc;
    border-radius: 12upx;
    transform: scale(0.5);
  }
  .balanceHeader {
    padding: 16upx;
    font-size: 32upx;
    position: relative;
    &:after {
      position: absolute;
      bottom: 0;
      right: 0;
      left: 0;
      height: 2upx;
      content: "";
      transform: scaleY(0.5);
      background-color: #c8c7cc;
    }
  }
  .balanceCenter {
    padding: 16upx;
  }
}
</style>
