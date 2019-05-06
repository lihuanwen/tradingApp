<template>
  <view class="content">
    <view class="input-group">
      <view class="input-row border">
        <text class="title">交易所：</text>
        <picker
          class="picker-view"
          @change="bindPickerChange"
          :range="marketList"
          range-key="market"
        >
          <view class="picker-input">{{marketName}}</view>
        </picker>
      </view>
      <view class="input-row border">
        <text class="title">账号：</text>
        <m-input type="text" clearable v-model="form.data.OAuth.userName" placeholder="请输入账号"></m-input>
      </view>
      <view class="input-row border">
        <text class="title">密码：</text>
        <m-input
          type="password"
          clearable
          displayable
          v-model="form.data.OAuth.password"
          placeholder="请输入密码"
        ></m-input>
      </view>
      <view class="input-row border">
        <text class="title">apiKey：</text>
        <m-input type="text" clearable v-model="form.data.OAuth.apiKey" placeholder="请输入apiKey"></m-input>
      </view>
      <view class="input-row border">
        <text class="title">secret：</text>
        <m-input type="text" clearable v-model="form.data.OAuth.secret" placeholder="请输入secret"></m-input>
      </view>
      <view class="input-row border">
        <text class="title">备注：</text>
        <m-input type="text" clearable v-model="form.data.note" placeholder="请输入备注"></m-input>
      </view>
      <view class="input-row">
        <text class="title">状态：</text>
        <switch class="switch-view" :checked="form.data.state == 1" @change="switch1Change"/>
      </view>
    </view>
    <view class="btn-row">
      <button type="primary" class="primary" @tap="save()" :loading="form.loading">保 存</button>
    </view>
  </view>
</template>

<script>
import mInput from "@/components/m-input.vue";
export default {
  components: {
    mInput
  },
  data() {
    return {
      form: {
        loading: false,
        data: {
          ID: "",
          marketID: 1,
          OAuth: {
            userName: "",
            password: "",
            apiKey: "",
            secret: ""
          },
          note: "",
          state: 1
        }
      },
      rules: {
        notNull: [
          {
            required: true,
            message: "此项必填",
            trigger: "blur"
          }
        ],
        notNullAndEmail: [
          {
            required: true,
            message: "此项必填",
            trigger: "blur"
          },
          { type: "email", message: "Incorrect email format", trigger: "blur" }
        ]
      },
      marketList: []
    };
  },
  computed: {
    marketName() {
      let market = this.marketList.filter(item => {
        return item.ID === this.form.data.marketID;
      });
      return market.length ? market[0].market : "选择交易所";
    }
  },
  mounted() {},
  onLoad(option) {
    this.init(option);
  },
  methods: {
    async init(option) {
      const marketList = await this.$store.dispatch("getCache", "market");
      this.marketList = marketList.rows;
      this.form.data = Object.assign(
        {
          ID: "",
          marketID: 1,
          OAuth: {
            userName: "",
            password: "",
            apiKey: "",
            secret: ""
          },
          note: "",
          state: 1
        },
        option
      );
      this.form.data.marketID = Number(this.form.data.marketID);
    },
    async save() {
      try {
        this.form.loading = true;
        // 验证API
        // await this.$ajax.post(
        //   this.$path.setting.marketConfig.validate,
        //   this.form.data
        // );
        // 保存API
        await this.$ajax.post(
          this.$path.setting.marketConfig.edit,
          this.form.data
        );
        this.form.loading = false;
        uni.showToast({
          title: "操作成功",
          icon: "success"
        });
        this.$store.commit("setCache", { key: "marketConfig" });
      } catch (error) {
        uni.showToast({
          title: error.msg,
          icon: "none"
        });
        this.form.loading = false;
      }
    },

    bindPickerChange(e) {
      this.form.data.marketID = this.marketList[e.target.value].ID;
    },
    switch1Change(e) {
      this.form.data.state = e.target.value ? 1 : 0;
    }
  }
};
</script>

<style lang="less">
.input-group {
  margin: 0;
}
.picker-view {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  flex: 1;
  padding: 0 10rpx;
  .picker-input {
    flex: 1;
    width: 100%;
  }
}
.switch-view {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  flex: 1;
  padding: 0 10rpx;
}

.list {
  height: 250px;
  overflow: auto;
}
.list-item {
  list-style: none;
  overflow-wrap: break-word;
}
.log {
  color: #909399;
  text-align: left;
}
.message {
  color: #67c23a;
  text-align: left;
}
.err {
  color: #f56c6c;
  text-align: left;
}
</style>
