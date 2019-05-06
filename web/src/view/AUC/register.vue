<template>
  <div class="register">
    <div class="register-con">
      <Card title="用户注册">
        <div class="form-con">
          <Form ref="form" :model="form" :rules="rules" @keydown.enter.native="handleSubmit">
            <FormItem prop="userName">
              <Input v-model="form.userName" placeholder="请输入账号">
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
            <FormItem prop="repeate">
              <Input type="password" v-model="form.repeate" placeholder="请再次输入密码">
              <span slot="prepend">
                <Icon :size="14" type="md-lock"></Icon>
              </span>
              </Input>
            </FormItem>
            <FormItem>
              <Button @click="handleSubmit" type="primary" long>注 册</Button>
            </FormItem>
          </Form>
        </div>
        <div class="footer">
          <p @click="$router.push({name: 'login'})">用户登录</p>
          <!-- <p @click="$router.push({name: 'passwordReset'})">重置密码</p> -->
        </div>
      </Card>
    </div>
  </div>
</template>
<script>
export default {
  name: 'register',
  data() {
    // const userName = (rule, value, callback) => {
    //   const reg = /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/
    //   if (value === '') {
    //     callback(new Error('请输入邮箱'))
    //   } else if (!reg.test(value)) {
    //     callback(new Error('邮箱格式不正确!'))
    //   } else {
    //     callback()
    //   }
    // }
    const password = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'));
      } else {
        if (this.form.repeate !== '') {
          this.$refs.form.validateField('repeate');
        }
        callback();
      }
    };
    const repeate = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'));
      } else if (value !== this.form.password) {
        callback(new Error('两次输入密码不一致!'));
      } else {
        callback();
      }
    };
    return {
      form: {
        userName: '',
        password: '',
        repeate: ''
      },
      rules: {
        // userName,
        password,
        repeate
      }
    };
  },
  computed: {},
  methods: {
    handleSubmit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.$ajax.post(this.$path.auc.register, this.form).then(data => {
            this.$Message.success('账号注册成功！');
            this.$router.push({
              name: 'login'
            });
          });
        }
      });
    }
  }
};
</script>

<style lang="less">
.register {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  &-con {
    width: 330px;
    margin: 0 auto;
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
