<template>
  <div class="main">
    <div id="userLayout">
      <div class="login_panel">

        <el-form ref="loginRef" :model="loginForm" :rules="loginRules" class="login-form">
          <div class="title_area">
            <img class="title_logo" src="../assets/logo/logo.png">
            <h3 class="title">人力资源后台管理系统</h3>
          </div>
          
          <el-form-item prop="username">
            <el-input v-model="loginForm.username" type="text" size="large" auto-complete="off" placeholder="账号">
              <template #prefix><svg-icon icon-class="user" class="el-input__icon input-icon" /></template>
            </el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input v-model="loginForm.password" type="password" size="large" auto-complete="off" placeholder="密码"
              @keyup.enter="handleLogin">
              <template #prefix><svg-icon icon-class="password" class="el-input__icon input-icon" /></template>
            </el-input>
          </el-form-item>
          <el-form-item prop="code" v-if="captchaEnabled">
            <el-input v-model="loginForm.code" size="large" auto-complete="off" placeholder="验证码" style="width: 63%"
              @keyup.enter="handleLogin">
              <template #prefix><svg-icon icon-class="validCode" class="el-input__icon input-icon" /></template>
            </el-input>
            <div class="login-code">
              <img :src="codeUrl" @click="getCode" class="login-code-img" />
            </div>
          </el-form-item>
          <el-checkbox v-model="loginForm.rememberMe" style="margin:0px 0px 25px 0px;">记住密码</el-checkbox>
          <el-form-item style="width:100%;">
            <el-button :loading="loading" size="large" type="primary" style="width:100%;" @click.prevent="handleLogin">
              <span v-if="!loading">登 录</span>
              <span v-else>登 录 中...</span>
            </el-button>
            <div style="float: right;" v-if="register">
              <router-link class="link-type" :to="'/register'">立即注册</router-link>
            </div>
          </el-form-item>
        </el-form>


        <div class="login_panel_right"></div>
        <div class="login_panel_foot">
          <div class="copyright">
            <div class="bottom-info">
              <span>Copyright © 2022-203 diandian All Rights Reserved.</span>
            </div>
          </div>
        </div>
      </div>


    </div>
  </div>
</template>

<script setup>
import { getCodeImg } from "@/api/login";
import Cookies from "js-cookie";
import { encrypt, decrypt } from "@/utils/jsencrypt";
import useUserStore from '@/store/modules/user'

const userStore = useUserStore()
const router = useRouter();
const { proxy } = getCurrentInstance();

const loginForm = ref({
  username: "admin",
  password: "admin123",
  rememberMe: false,
  code: "",
  uuid: ""
});

const loginRules = {
  username: [{ required: true, trigger: "blur", message: "请输入您的账号" }],
  password: [{ required: true, trigger: "blur", message: "请输入您的密码" }],
  code: [{ required: true, trigger: "change", message: "请输入验证码" }]
};

const codeUrl = ref("");
const loading = ref(false);
// 验证码开关
const captchaEnabled = ref(true);
// 注册开关
const register = ref(false);
const redirect = ref(undefined);

function handleLogin () {
  proxy.$refs.loginRef.validate(valid => {
    if (valid) {
      loading.value = true;
      // 勾选了需要记住密码设置在 cookie 中设置记住用户名和密码
      if (loginForm.value.rememberMe) {
        Cookies.set("username", loginForm.value.username, { expires: 30 });
        Cookies.set("password", encrypt(loginForm.value.password), { expires: 30 });
        Cookies.set("rememberMe", loginForm.value.rememberMe, { expires: 30 });
      } else {
        // 否则移除
        Cookies.remove("username");
        Cookies.remove("password");
        Cookies.remove("rememberMe");
      }
      // 调用action的登录方法
      userStore.login(loginForm.value).then(() => {
        router.push({ path: redirect.value || "/" });
      }).catch(() => {
        loading.value = false;
        // 重新获取验证码
        if (captchaEnabled.value) {
          getCode();
        }
      });
    }
  });
}

function getCode () {
  getCodeImg().then(res => {
    captchaEnabled.value = res.captchaEnabled === undefined ? true : res.captchaEnabled;
    if (captchaEnabled.value) {
      codeUrl.value = "data:image/gif;base64," + res.img;
      loginForm.value.uuid = res.uuid;
    }
  });
}

function getCookie () {
  const username = Cookies.get("username");
  const password = Cookies.get("password");
  const rememberMe = Cookies.get("rememberMe");
  loginForm.value = {
    username: username === undefined ? loginForm.value.username : username,
    password: password === undefined ? loginForm.value.password : decrypt(password),
    rememberMe: rememberMe === undefined ? false : Boolean(rememberMe)
  };
}

getCode();
getCookie();
</script>

<style lang='scss' scoped>
.main {
  background: #eee;
  height: 100vh;
  overflow: hidden;
  font-weight: 400 !important;
}

#userLayout {
  margin: 0;
  padding: 0;
  background-image: url("../assets/images/login_background.jpg");
  background-size: cover;
  width: 100%;
  height: 100%;
  position: relative;
}

.login_panel {
  position: absolute;
  top: 3vh;
  left: 2vw;
  width: 96vw;
  height: 94vh;
  background-color: rgba(255, 255, 255, .8);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: space-evenly;

  .login_panel_right {
    background-image: url("../assets/images/login_left.svg");
    background-size: cover;
    width: 40%;
    height: 60%;
    float: right !important;
  }

  .login_panel_foot {
    position: absolute;
    bottom: 10px;

    .copyright {
      color: #777;
      margin-top: 5px;

      .bottom-info {
        color: #888;
        height: 30px;
        font-size: 13px;
      }
    }
  }
}


.title_area {
  display: flex;
  align-items: center;
  margin: 5px 0;
  .title_logo{
    width: 50px;
    height: 50px;
  }
  .title {
    font-size:25px;
    padding-left: 20px;
  }
}


.login-form {
  width: 480px;
  background-color: #fff;
  padding: 20px 40px;
  border-radius: 10px;
  box-shadow: 2px 3px 7px rgb(0 0 0 / 20%);

  .el-input {
    height: 40px;

    input {
      height: 40px;
    }
  }

  .input-icon {
    height: 39px;
    width: 14px;
    margin-left: 0px;
  }
}

.login-tip {
  font-size: 13px;
  text-align: center;
  color: #bfbfbf;
}

.login-code {
  width: 33%;
  height: 40px;
  float: right;

  img {
    cursor: pointer;
    vertical-align: middle;
  }
}


.login-code-img {
  height: 40px;
  padding-left: 12px;
}
</style>
