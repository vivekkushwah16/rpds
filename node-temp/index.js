const express = require('express');
const { createServer } = require('http'); // Using 'http' module for createServer
const { Server } = require('socket.io');
const rdp = require('node-rdpjs');
const cors = require('cors');

const app = express();
const server = createServer(app); // Creating server using 'http' module
const io = new Server(server);

// Enable CORS
app.use(cors());

io.on('connection', (socket) => {
  console.log('New client connected');

var client = rdp
  .createClient({
    domain: 'my_domain',
    userName: 'my_username',
    password: 'my_password',
    enablePerf: true,
    autoLogin: true,
    decompress: false,
    screen: { width: 800, height: 600 },
    locale: 'en',
    logLevel: 'INFO',
  })
  .on('connect', function () {})
  .on('close', function () {})
  .on('bitmap', function (bitmap) {})
  .on('error', function (err) {
    
  })
  .connect('XXX.XXX.XXX.XXX', "port");

  //   Handle client connection events
  client.on('connect', () => {
    console.log('RDP client connected');
  });

  client.on('bitmap', (bitmap) => {
    console.log('Received bitmap data');
    socket.emit('bitmap', bitmap);
  });

  client.on('error', (err) => {
    console.error('RDP client error:', err);
    // Handle errors (e.g., disconnect socket)
    socket.disconnect();
  });

  client.on('close', () => {
    console.log('RDP client connection closed');
  
  });

  socket.on('mouse', (event) => {
    console.log('Mouse event:', event);
    client.sendPointerEvent(event.x, event.y, event.button, event.wheel);
  });

  socket.on('keyboard', (event) => {
    console.log('Keyboard event:', event);
    client.sendKeyEventScancode(event.code, event.down);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    client.close();
  });

  // Connect RDP client
  client.connect('3.109.139.48',3389);
});

server.listen(4000, () => {
  console.log('Server is running on http://localhost:4000');
});
