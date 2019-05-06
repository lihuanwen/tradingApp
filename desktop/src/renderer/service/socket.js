import io from 'socket.io-client';

// import socket from "@/service/socket";
// this.$socket = new socket("http://localhost:3000");
class socket {
  constructor(uri) {
    this.socket = io(uri || null);
    this.messages = [];
    this.notifications = [];
    this.setupSocketListeners();
  }

  setupSocketListeners() {
    this.socket.on('connect', () => {
      this.addNotification('连接到服务器。');
    });
    this.socket.on('disconnect', () => {
      this.addNotification('连接丢失。');
    });

    this.socket.on('_MESSAGE', message => {
      this.addMessage(message);
    });
  }

  joinRoom(roomName) {
    this.socket.emit('JOIN', roomName);
  }

  sendMessage(newMsg) {
    let message = {
      msg: newMsg,
      sender: this.socketID
    };
    this.socket.emit('MESSAGE', message);
  }

  addMessage(message) {
    this.messages.push(message);
  }

  addNotification(message) {
    const timestamp = new Date().toLocaleTimeString();
    this.notifications.push({
      message,
      timestamp
    });
  }
}


export default socket;
