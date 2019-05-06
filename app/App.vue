<script>
import { mapMutations } from "vuex";
export default {
  onLaunch() {
    // #ifdef  APP-PLUS
    this.addEventListener(); //监听推送信息
    // #endif
  },
  onShow() {
    console.log("App Show");
  },
  onHide() {
    console.log("App Hide");
  },
  onError(err) {
    console.log(err);
  },
  methods: {
    ...mapMutations(["updatePushMessage"]),
    /**
     * 检查版本升级
     */
    checkUpdate() {
      this.$ajax.post("https://uniapp.dcloud.io/update", plus.runtime).then(
        res => {
          if (res.isUpdate) {
            uni.showModal({
              title: "更新提示",
              content: res.note ? res.note : "是否选择更新",
              success: showResult => {
                if (showResult.confirm) {
                  plus.runtime.openURL(
                    plus.os.name === "iOS" ? res.iOS : res.Android
                  );
                }
              }
            });
          }
        },
        err => {}
      );
    },
    /**
     * 监听推送信息
     */
    addEventListener() {
      plus.push.addEventListener("click", this.updatePushMessage); //监听系统通知栏消息点击事件
      plus.push.addEventListener("receive", this.updatePushMessage); //监听接收透传消息事件
    }
  }
};
</script>

<style lang="less">
@import "./common/uni.less";

page {
  min-height: 100%;
  display: flex;
  overflow: hidden;
  .content {
    display: flex;
    flex: 1;
    flex-direction: column;
    background-color: #efeff4;
    padding: 10upx;
    overflow: hidden;
  }
}

.input-group {
  background-color: #ffffff;
  margin-top: 40upx;
  position: relative;
  &:before {
    position: absolute;
    right: 0;
    top: 0;
    left: 0;
    height: 1upx;
    content: "";
    -webkit-transform: scaleY(0.5);
    transform: scaleY(0.5);
    background-color: #c8c7cc;
  }
  &:after {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    height: 1upx;
    content: "";
    -webkit-transform: scaleY(0.5);
    transform: scaleY(0.5);
    background-color: #c8c7cc;
  }
  .input-row {
    display: flex;
    flex-direction: row;
    position: relative;
    .title {
      width: 20%;
      height: 50upx;
      min-height: 50upx;
      padding: 15upx 0;
      padding-left: 30upx;
      line-height: 50upx;
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

.btn-row {
  margin-top: 50upx;
  padding: 20upx;
}

button {
  &.primary {
    background-color: #0faeff;
  }
}

.pagination {
  background-color: #fff;
  text-align: center;
  padding: 5px 0;
}
</style>
