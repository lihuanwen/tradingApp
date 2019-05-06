import EventEmitter from 'events';
import pako from 'pako';

export default class Exchange {
  describe() {
    return {
      id: null,
      name: null,
    };
  }

  constructor() {
    // 初始化配置
    const config = this.describe();
    for (const [property, value] of Object.entries(config)) {
      this[property] = value;
    }

    this.socket = null;
    this.pako = pako;
    this.events = new EventEmitter();
    this.lastHeartBeat = new Date().getTime();
  }

  async initWebSocket() {
    if (!this.urls.socket) {
      throw new Error('交易所初始化 错误 未找到socket连接地址');
    }
    const socket = new WebSocket(this.urls.socket);

    socket.onmessage = async (event) => {
      // 二进制转字符串
      // const message = await new Response(event.data).text();
      // 二进制转Buffer
      const message = await new Response(event.data).arrayBuffer();
      this.onMessage && this.onMessage(message);
    };
    socket.onclose = async (event) => {
      this.onClose && this.onClose();
    };
    // socket.addEventListener('ping', ts => {
    //   let msg = ts.toString('utf8');
    //   console.log('ping ', msg);
    //   debugger;
    // });

    // socket.addEventListener('pong', ts => {
    //   let msg = ts.toString('utf8');
    //   console.log('pong ', msg);
    //   debugger;
    // });

    this.socket = socket;
    return new Promise((resolve, reject) => {
      socket.onopen = async (event) => {
        resolve();
        this.onOpen && this.onOpen(socket);
      };
      socket.onerror = async (error) => {
        reject(error);
        this.onError && this.onError(error);
      };
    });
  }

  onMessage(msg) {
    const socket = this.socket;
    let data = msg;

    // 检查是否需要解压
    if (msg !== 'pong_p') {
      data = this.compress ? this.compress(msg) : JSON.parse(msg);
    }

    switch (this.id) {
      case 'huobipro':
        if (data.ping) {
          socket.send(
            JSON.stringify({
              pong: data.ping
            })
          );
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

  formatData(data) {
    try {
      this.formatNewData(data);
    } catch (error) {
      throw new Error(`格式数据 错误 ${error.message} ${JSON.stringify(data)}`);
    }
  }

  onClose() {
    // this.initWebSocket();
    throw new Error(`连接 关闭`);
  }

  onError(error) {
    // this.initWebSocket();
    throw new Error(`连接错误 ${error.message}`);
  }
}
