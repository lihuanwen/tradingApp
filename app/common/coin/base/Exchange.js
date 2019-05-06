import { EventEmitter } from 'events';
import WebSocket from 'ws';

export default class Exchange extends EventEmitter {
  describe() {
    return {
      id: null,
      name: null,
    };
  }

  constructor() {
    const config = this.describe();
    for (const [property, value] of Object.entries(config)) {
      this[property] = value;
    }

    this.socket = null;
  }

  connect() {
    if (!this.urls.socket) throw new Error('交易所初始化 错误 未找到socket连接地址');
    if (this.socket) this.socket.close();

    this.socket = new WebSocket(this.urls.socket);
    this.socket.on('open', () => this.onOpen());
    this.socket.on('close', (code, reason) => this.onClose(code, reason));
    this.socket.on('message', data => this.onMessage(data));

    uni.connectSocket({
      url: this.urls.socket,
      success: (res) => {
        console.log(res)
      },
      fail: (res) => {
        console.log(res)
      }
    });
    uni.onSocketMessage = (event) => {
      console.log(event)
      // const message = await new Response(event.data).arrayBuffer();
      // this.onMessage && this.onMessage(message);
    };
    uni.onSocketClose = (event) => {
      console.log(event)
      // this.onClose && this.onClose();
    };
    uni.onSocketOpen = (event) => {
      console.log(event)
      // this.onOpen && this.onOpen(socket);
    };
    uni.onSocketError = (error) => {
      console.log(error)
      // this.onError && this.onError(error);
    };
  }

  close() {
    if (this.socket) {
      this.socket.close();
      this.socket = undefined;
    }
    this.clearTimer()
  }

  onOpen() {
    this.initTimer();
    this.emit('open');
  }

  onMessage(msg) {
    this.emit('message', msg);
    let data = msg;

    // 检查是否需要解压
    if (msg !== 'pong_p') {
      data = this.compress ? this.compress(msg) : JSON.parse(msg);
    }

    switch (this.id) {
      case 'huobipro':
        if (data.ping) {
          this.send({
            pong: data.ping
          });
        } else if (data.tick) {
          this.formatData(data);
        } else {
          console.log(data);
        }
        break;
      case 'okex':
        if (data.event === 'pong') {
          this.lastHeartBeat = new Date().getTime();
        } else {
          if (data.table) {
            this.formatData(data[0]);
          } else {
            console.log(data);
          }
        }
        break;
      default:
        this.formatData(data);
        break;
    }
  }

  onClose(code, reason) {
    this.socket = undefined;
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.emit('close');
  }

  onError(error) {
    throw new Error(`连接错误 ${error.message}`);
  }

  formatData(data) {
    try {
      this.formatNewData(data);
    } catch (error) {
      throw new Error(`格式数据 错误 ${error.message} ${JSON.stringify(data)}`);
    }
  }

  initTimer() {
    if (this.options.checkTime) {
      this.lastHeartBeat = new Date().getTime();
      this.interval = setInterval(() => {
        this.checkConnect();
      }, this.options.checkTime);
    }
  }

  clearTimer() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  checkConnect() {
    this.socket.send('ping');
    if (new Date().getTime() - this.lastHeartBeat > this.options.overTime) {
      this.clearTimer();
    }
  }

  send(msg) {
    if (!this.socket) throw new Error('连接并未打开');
    this.socket.send(JSON.stringify(msg));
  }

}
