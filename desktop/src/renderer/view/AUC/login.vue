<template>
  <div class="login">
    <div class="login-con">
      <Card title="用户登录" :bordered="false">
        <div class="form-con">
          <Form ref="form" :model="form" :rules="rules" @keydown.enter.native="handleSubmit">
            <FormItem prop="userName">
              <Input v-model="form.userName" placeholder="请输入用户名">
              <span slot="prepend">
                <Icon :size="16" type="ios-person"></Icon>
              </span>
              </Input>
            </FormItem>
            <FormItem prop="password">
              <Input type="password" v-model="form.password" placeholder="请输入密码">
              <span slot="prepend">
                <Icon :size="14" type="md-lock"></Icon>
              </span>
              </Input>
            </FormItem>
            <FormItem>
              <Button @click="handleSubmit" type="primary" long>登 录</Button>
            </FormItem>
          </Form>
        </div>
        <div class="footer">
          <p @click="$router.push({name: 'register'})">用户注册</p>
          <!-- <p @click="$router.push({name: 'passwordReset'})">重置密码</p> -->
        </div>
      </Card>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      form: {
        userName: '',
        password: ''
      },
      rules: {
        userName: [{ required: true, message: '用户名不能为空', trigger: 'blur' }],
        password: [{ required: true, message: '密码不能为空', trigger: 'blur' }]
      }
    };
  },
  methods: {
    handleSubmit(form) {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.$ajax.post(this.$path.auc.login, this.form).then(data => {
            this.$store.commit('setUserInfo', data);
            this.$router.push({ path: '/' });
          });
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.login {
  width: 100%;
  height: 100%;
  background-image: url("/static/login-bg.jpg");
  background-size: cover;
  background-position: center;
  position: relative;
  &-con {
    position: absolute;
    right: 160px;
    top: 50%;
    transform: translateY(-60%);
    width: 330px;
    .ivu-card {
      &-head {
        padding: 16px;
      }
    }
    .form-con {
      padding: 10px 0 0;
    }
    .footer {
      text-align: right;
      p {
        cursor: pointer;
        font-size: 12px;
        color: #6c6c6c;
        display: inline-block;
        margin-left: 1em;
      }
    }
  }
}
</style>
