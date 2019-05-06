
const puppeteer = require('puppeteer');
const util = require('../libs/util');
const { URL } = require('url');

class Renderer {
  constructor() {
    this.browser = null;
    this.targets = {};
    this.config = {
      okex: {
        loginUrl: 'https://www.okex.com/account/login',
        createApi: ''
      },
      binance: {
        loginUrl: 'https://www.binance.com/login.html',
        createApi: 'https://www.binance.com/userCenter/createApi.html'
      }
    };
    this.init();
  }
  async init() {
    this.browser = await puppeteer.launch({
      // ignoreHTTPSErrors: true,
      headless: false,
      devtools: true,
      // args: [
      //   '--no-sandbox',
      //   '--disable-setuid-sandbox',
      //   '--disable-accelerated-2d-canvas',
      //   '--disable-gpu'
      // ]
    });
  }
  async getPage(pageName) {
    if (this.targets[pageName]) {
      return this.targets[pageName];
    } else {
      const page = await this.browser.newPage();
      this.targets[pageName] = page;
      return page;
    }
  }
  async closePage(pageName) {
    if (this.targets[pageName]) { this.targets[pageName].close() }
  }
  async closeBrowser() {
    await this.browser.close();
  }

  async getToken(pageName, marketName, OAuth, websocket) {
    return new Promise(async (resolve, reject) => {
      const page = await this.getPage(pageName);
      let btnPosition = null;
      let times = 0; // 执行重新滑动的次数
      const distanceError = [-10, 2, 3, 5]; // 距离误差

      /**
       * 从request上提取token
       * @param {*} request request对象
       */
      const requestListener = async (request) => {
        const url = new URL(request._url);
        const headers = request.headers();
        switch (marketName) {
          case 'okex': {
            switch (url.pathname) {
              // 登录
              case `/v3/users/login/login`: {
                // 需要验证码
                const resData = await request.response().json();
                if (resData.data.step2Type === 2) {
                  await page.tap('.send-code-btn');
                  // 等待回传验证码
                  websocket.on('message', async (data) => {
                    const query = JSON.parse(data);
                    if (query.path === 'input') {
                      page.type('#loginBox > div > div.login-item-wrap > div > div > div > input', '');
                      page.type('#loginBox > div > div.login-item-wrap > div > div > div > input', query.msg);
                      await page.tap('.login-btn');
                    }
                  });
                  // 提示客户端输入验证码
                  websocket.sendJSON({ path: 'input', msg: '请输入收到的验证码' });
                } else {
                  resolve(resData.data.token);
                }
                break;
              }
              // 验证码验证
              case `/v3/users/login-auth/login-step2`: {
                // 验证码错误
                const resData = await request.response().json();
                if (resData.code === 3323) {
                  await page.tap('.send-code-btn');
                  websocket.sendJSON({ path: 'input', msg: '验证码错误，请重新输入' });
                }
                break;
              }
              // 登录成功
              case `/v3/users/security/profile`: {
                resolve(headers.authorization);
                break;
              }
            }
            break;
          }
          case 'binance': {
            switch (url.pathname) {
              // 登录
              case `/user/login.html`: {
                // 判断是否登录成功及是否需要重新发送验证码
                const resData = await request.response().json();
                // console.log(resData);
                if (resData.code === '200001016') {
                  await util._sleep(800);
                  await page.tap('#sendBtn');
                  websocket.sendJSON({ path: 'input', msg: '验证码错误，请重新输入' });
                } else if (resData.success) {
                  resolve(resData.token);
                }
                break;
              }
              // 验证码验证
              case `/user/sendMobileVerifyCode.html`: {
                websocket.on('message', async (data) => {
                  const query = JSON.parse(data);
                  if (query.path === 'input') {
                    await page.type('#password', '');
                    await page.type('#password', query.msg);
                    await page.tap('#mobile-btn');
                  }
                });
                // 提示客户端输入验证码
                websocket.sendJSON({ path: 'input', msg: '请输入收到的验证码' });
                break;
              }
            }
            break;
          }
        }
      };

      /**
       * 计算按钮需要滑动的距离
       */
      const calculateDistance = async () => {
        const distance = await page.evaluate(() => {
          // 比较像素,找到缺口的大概位置
          const ctx1 = document.querySelector('.geetest_canvas_fullbg'); // 完成图片
          const ctx2 = document.querySelector('.geetest_canvas_bg');  // 带缺口图片
          const pixelDifference = 30; // 像素差
          let res = []; // 保存像素差较大的x坐标

          // 对比像素
          for (let i = 57; i < 260; i++) {
            for (let j = 1; j < 160; j++) {
              const imgData1 = ctx1.getContext('2d').getImageData(Number(i), Number(j), 1, 1);
              const imgData2 = ctx2.getContext('2d').getImageData(Number(i), Number(j), 1, 1);
              const data1 = imgData1.data;
              const data2 = imgData2.data;
              const res1 = Math.abs(data1[0] - data2[0]);
              const res2 = Math.abs(data1[1] - data2[1]);
              const res3 = Math.abs(data1[2] - data2[2]);
              if (!(res1 < pixelDifference && res2 < pixelDifference && res3 < pixelDifference)) {
                if (!res.includes(i)) {
                  res.push(i);
                }
              }
            }
          }
          // 返回像素差最大值跟最小值，经过调试最小值往左小7像素，最大值往左54像素
          return { min: res[0] - 5, max: res[res.length - 1] - 54 };
        });
        return distance;
      };

      /**
       * 计算滑块位置
       */
      const getBtnPosition = async () => {
        await util._sleep(1800); // 等待弹出层展示
        const element = await page.$('.geetest_slider_button');
        const box = await element.boundingBox();
        return { x: box.x + (box.width / 2), y: box.y + (box.height / 2) }; // 取中心点
      };

      /**
      * 尝试滑动按钮
      * @param {*} distance  滑动距离
      */
      const tryValidation = async (distance) => {
        let isSuccess = false;
        let reDistance = true;
        let retry = false;

        // 以按钮的中心点加入一定的偏移，不能放在按钮的中心点
        let { x, y } = btnPosition;
        x += util._randomNum(1, 5, 4);
        y += util._randomNum(1, 5, 6);

        // 第一次移动的距离取随机数。
        const distance1 = distance - util._randomNum(5, 20);

        // 将距离拆分成两段，模拟正常人的行为
        // console.log('开始移动');
        await page.mouse.move(x, y);
        await page.mouse.down();

        // console.log('移动第一段', distance1);
        y -= util._randomNum(1, 5, 5);
        await page.mouse.move(x + distance1, y, { steps: 50 });

        // console.log('移动第二段', distance);
        y += util._randomNum(1, 5, 5);
        await page.mouse.move(x + distance, y, { steps: 80 });

        // console.log('结束移动');
        await page.mouse.up();

        // await page.mouse.click(btnPosition.x, btnPosition.y, { delay: 2000 });
        // await page.mouse.down(btnPosition.x, btnPosition.y);
        // await page.mouse.move(btnPosition.x + distance1, btnPosition.y, { steps: 30 });
        // await page.mouse.move(btnPosition.x + distance1 + distance2, btnPosition.y, { steps: 20 });
        // await page.mouse.up();
        await util._sleep(1000); // 等待判断完成

        // 判断是否刷新
        retry = await page.$eval('.geetest_panel_error', el => {
          return el.style.display === 'block';
        });
        if (retry) {
          await page.tap('.geetest_panel_error_content');
        } else {
          // 判断是否验证成功
          isSuccess = await page.evaluate(() => {
            return document.querySelector('.geetest_panel_success') && document.querySelector('.geetest_panel_success').style.display === 'block';
          });
          // 判断是否需要重新计算距离
          reDistance = await page.evaluate(() => {
            return document.querySelector('.geetest_result_content') && document.querySelector('.geetest_result_content').innerHTML.includes('Try again in 3 seconds');
          });
        }

        // console.log(retry, isSuccess, reDistance);
        return { isSuccess, reDistance };
      };

      /**
       * 拖动滑块
       * @param {*} distance 滑动距离
       */
      const drag = async (distance) => {
        await util._sleep(1200);  // 等待图片加载
        distance = distance || await calculateDistance();
        // console.log('新距离', distance.min, distance.max);
        const result = await tryValidation(distance.min);
        if (result.isSuccess) {
          await util._sleep(2000);  // 等待页面跳转
          // 验证成功 发送验证码
          await page.tap('#sendBtn');
          // console.log('验证成功');
          // page.click('#modal-member-login button');
        } else if (result.reDistance) {
          // console.log('重新计算距离，重新滑动');
          times = 0;
          await drag(null);
        } else {
          if (distanceError[times]) {
            times++;
            // console.log('重新滑动');
            await drag({ min: distance.max, max: distance.max + distanceError[times] });
          } else {
            // console.log('滑动失败');
            times = 0;
            run();
          }
        }
      };

      const run = async () => {
        await page.goto(this.config[marketName].loginUrl, { waitUntil: 'load' });
        switch (marketName) {
          case 'okex': {
            await page.tap('.ok-auth-switch-login .item');
            await page.type('#loginBox > div > div.login-item-wrap > div:nth-child(2) > div > div > input', OAuth.userName);
            await page.type('#loginBox > div > div.login-item-wrap > div:nth-child(3) > div > div > input', OAuth.password);
            await page.tap('.login-btn');
            break;
          }
          case 'binance': {
            await page.type('#email', OAuth.userName);
            await page.type('#pwd', OAuth.password);
            await page.tap('#login-btn');

            btnPosition = await getBtnPosition();
            await drag(null);
            break;
          }
        }
      };

      page.on('requestfinished', requestListener);
      //   await page.setRequestInterception(true);
      //   page.on('request', request => {
      //     if (request.resourceType() === 'document') {
      //       request.continue();
      //     } else {
      //       request.abort();
      //     }
      //   });
      await run();
    });
  }

  async createApi(pageName, marketName, OAuth, websocket) {
    return new Promise(async (resolve, reject) => {
      const page = await this.getPage(pageName);

      /**
       *
       * @param {*} request request对象
       */
      const requestListener = async (request) => {
        const url = new URL(request._url);
        const headers = request.headers();
        switch (marketName) {
          case 'okex': {
            break;
          }
          case 'binance': {
            switch (url.pathname) {
              case `manageApi/saveApi.html`: {
                const resData = await request.response().json();
                // console.log(resData);
                if (resData.code === '200001016') {
                  await util._sleep(800);
                  await page.tap('#sendBtn');
                  websocket.sendJSON({ path: 'input', msg: '验证码错误，请重新输入' });
                } else if (resData.success) {
                  resolve(resData.token);
                }
                break;
              }
              // 验证码验证
              case `/user/sendMobileVerifyCode.html`: {
                websocket.once('message', async (data) => {
                  const query = JSON.parse(data);
                  if (query.path === 'input') {
                    await page.type('#verifyCode', '');
                    await page.type('#verifyCode', query.msg);
                    await page.tap('#mobile-btn');
                  }
                });
                // 提示客户端输入验证码
                websocket.sendJSON({ path: 'input', msg: '请输入收到的验证码' });
                break;
              }
            }
            break;
          }
        }
      };

      const run = async () => {
        await page.goto(this.config[marketName].createApi, { waitUntil: 'load' });
        switch (marketName) {
          case 'okex': {
            break;
          }
          case 'binance': {
            await page.type('.addApi > input[type="text"]', '统一管理API');
            await page.tap('.addApi > input[type="button"]');
            await util._sleep(200);
            await page.tap('#sendBtn');
            break;
          }
        }
      };

      page.on('requestfinished', requestListener);
      await run();
    });
  }
}

module.exports = new Renderer();