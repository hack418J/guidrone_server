socket = io.connect('http://192.168.126.20:3000');

function send() {
  socket.emit('come', {});
}
