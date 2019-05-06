<template>
  <section>
    <Modal v-model="form.show" title="交易所配置编辑" :mask-closable="false" width="40">
      <Form v-if="form.show" :model="form.data" ref="form" :label-width="80">
        <FormItem label="交易所" prop="marketID">
          <Select v-model="form.data.marketID" placeholder="选择交易所" filterable>
            <Option
              v-for="item in marketList"
              :value="item.ID"
              :key="item.ID"
            >{{item.ID}} : {{item.market}}</Option>
          </Select>
        </FormItem>
        <Alert type="warning" closable>没有API时输入账号密码将自动创建API</Alert>
        <FormItem label="账号">
          <Input v-model="form.data.OAuth.userName" placeholder/>
        </FormItem>
        <FormItem label="密码">
          <Input v-model="form.data.OAuth.password" placeholder/>
        </FormItem>
        <FormItem label="apiKey">
          <Input v-model="form.data.OAuth.apiKey" placeholder/>
        </FormItem>
        <FormItem label="secret">
          <Input v-model="form.data.OAuth.secret" placeholder/>
        </FormItem>
        <FormItem label="备注" prop="note">
          <Input v-model="form.data.note" placeholder/>
        </FormItem>
        <FormItem label="状态" prop="state">
          <i-switch size="large" :true-value="1" :false-value="0" v-model="form.data.state">
            <span slot="open">启用</span>
            <span slot="close">禁用</span>
          </i-switch>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button @click="form.show = false">取 消</Button>
        <Button @click="save()" type="primary" :loading="form.loading">提 交</Button>
      </div>
    </Modal>
    <Modal v-model="socket.show" title="在线申请API" :mask-closable="false" width="40">
      <ul class="list">
        <li v-for="(item,index) in socket.log" :key="index" class="list-item" :class="item.type">
          <p>{{item.time}}</p>
          <p>{{item.message}}</p>
        </li>
      </ul>
      <div slot="footer" class="ui-flex">
        <Input ref="input" v-model="socket.txtInput" placeholder="提交数据"/>
        <Button @click="input()" type="primary">提 交</Button>
      </div>
    </Modal>
  </section>
</template>

<script>
export default {
  props: {
    value: Object
  },
  data() {
    return {
      form: {
        show: false,
        loading: false,
        data: null
      },
      rules: {
        notNull: [
          {
            required: true,
            message: '此项必填',
            trigger: 'blur'
          }
        ],
        notNullAndEmail: [
          {
            required: true,
            message: '此项必填',
            trigger: 'blur'
          },
          { type: 'email', message: 'Incorrect email format', trigger: 'blur' }
        ]
      },
      marketList: [],
      socket: {
        websocket: null,
        show: false,
        log: [],
        Online: false,
        txtInput: '',
        query: null
      }
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      this.$ajax.post(this.$path.config.market).then(data => {
        this.marketList = data.rows;
      });
    },
    save() {
      this.$refs.form.validate(async valid => {
        if (valid) {
          this.form.loading = true;
          // 只有账号和密码就马上申请API
          if (this.form.data.OAuth.userName && !this.form.data.OAuth.apiKey) {
            // 申请连接服务器
            this.login(this.form.data);
            this.form.loading = false;
          } else if (this.form.data.OAuth.apiKey) {
            try {
              // 验证API
              await this.$ajax.post(
                this.$path.setting.marketConfig.validate,
                this.form.data
              );
              // 保存API
              await this.$ajax.post(
                this.$path.setting.marketConfig.edit,
                this.form.data
              );
              this.form.loading = false;
              this.form.show = false;
              this.form.data = null;
              this.$emit('over');
              this.$Message.success('操作成功');
            } catch (error) {
              this.form.loading = false;
            }
          }
        }
      });
    },
    connect() {
      let socket = this.socket;
      socket.log.push({
        type: ['log'],
        message: 'connecting...',
        time: new Date()
      });
      const websocket = new WebSocket('ws://127.0.0.1:8355');
      websocket.sendJSON = function(data) {
        websocket.send(JSON.stringify(data));
        socket.log.push({
          type: ['err'],
          message: `提交： ${JSON.stringify(data)}`,
          time: new Date()
        });
      };
      websocket.onopen = e => {
        websocket.sendJSON({
          path: 'auth',
          token: this.$store.state.user.token
        });
        socket.Online = true;
        socket.log.push({
          type: ['log'],
          message: 'websocket open',
          time: new Date()
        });
        if (socket.query) {
          this.send(socket.query);
        }
      };
      websocket.onmessage = e => {
        socket.log.push({
          type: ['message'],
          message: e.data,
          time: new Date()
        });
        this.controller(JSON.parse(e.data));
      };
      websocket.onerror = e => {
        socket.Online = false;
        socket.log.push({
          type: ['err'],
          message: e,
          time: new Date()
        });
      };
      websocket.onclose = e => {
        socket.Online = false;
        socket.log.push({
          type: ['err'],
          message: e,
          time: new Date()
        });
      };
      socket.websocket = websocket;
    },
    login(config) {
      this.socket.log = [];
      this.socket.show = true;
      this.send({ path: 'login', config });
    },
    input() {
      this.send({ path: 'input', msg: this.socket.txtInput });
      this.socket.txtInput = '';
    },
    send(query) {
      let socket = this.socket;
      socket.query = query;
      if (socket.Online) {
        socket.websocket.sendJSON(socket.query);
        socket.query = null;
      } else {
        this.connect();
      }
    },
    controller(query) {
      switch (query) {
        case 'input': {
          let input = this.$refs.input;
          input.focus();
          break;
        }
        case 'end':
          this.socket.show = false;
          this.socket.log = [];
          break;
      }
    }
  },
  watch: {
    value(val) {
      this.form.data = Object.assign(
        {
          ID: '',
          marketID: 1,
          OAuth: {
            userName: '',
            password: '',
            apiKey: '',
            secret: ''
          },
          note: '',
          state: 1
        },
        val
      );
      this.form.show = true;
    }
  }
};
</script>

<style lang="less" scoped>
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
