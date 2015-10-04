var d = require("rolling-spider");
var temporal = require('temporal');

var ACTIVE = true;
var STEPS = 5;
var STOP = false;
var d = new d({uuid:"e1ca57a94b48461fa8d2cc4d92bb91b3"}); //各々書き換えましょう。

function cooldown() {
  ACTIVE = false;
  setTimeout(function () {
    ACTIVE = true;
  }, STEPS);
}

function forwardMove (d) {
  var cnt = 0;
  var maxCnt = 5;
  var timer = null;
  var delay = 1000;
  function forward(d) {
    if (cnt < maxCnt && STOP) {
      cnt ++;
      d.forward({steps: STEPS});
      if (timer) {
        clearInterval(timer);
        turnRight(d);
      }
    }
  }
  timer = setInterval('foward(d)', delay);
}

function turnRight (d) {
  d.turnRight({steps: 17}, function () {
    forwardMoveGone(d);
  });
}

function forwardMoveGone (d) {
  var cnt = 0;
  var maxCnt = 5;
  var timer = null;
  var delay = 1000;
  function forward(d) {
    if (cnt < maxCnt && STOP) {
      cnt ++;
      d.forward({steps: STEPS});
      if (timer) {
        clearInterval(timer);
        //turnRight(d);
      }
    }
  }
  timer = setInterval('foward(d)', delay);
}

function demoMove(d, cb) {
  temporal.queue([
     {
       delay: 0,
       task: function () {
         d.takeOff();
         d.flatTrim();
       }
     },
     {
       delay: 5000,
       task: function () {
         d.forward();
       }
     },
     {
       delay: 5000,
       task: function () {
         d.turnRight({steps: 17});
       }
     },
    {
       delay: 10000,
       task: function () {
         d.forward();
       }
     },
     {
       delay: 15000,
       task: function () {
         d.land();
       }
     },
     {
       delay: 5000,
       task: function () {
         temporal.clear();
         cb();
       }
     }
   ]);

}

module.exports = function (app) {
  var io = require('socket.io')(app);
  d.connect(function(){

    d.setup(function () {
      console.log('Configured for Rolling Spider! ', d.name);
      d.flatTrim();
      d.startPing();
      d.flatTrim();
    });

    setTimeout(function () {
      console.log(d.name + ' => SESSION START');
      ACTIVE = true;
    }, 1000);

  });

  io.on('connection', function (socket) {
    console.log('connect');

    socket.on('come', function(position){
      console.log('come message from client');
      demoMove(d, function(){
        socket.emit('gone', {});
      });
    });

    socket.on('disconnect', function(){
      //d.disconnect();
      console.log('err i lost socket');
    });

    d.on('battery', function(){
      socket.emit('battery', {});
    });

    d.on('disconnect', function(){
      socket.emit('disconnect');
    });

    process.on('exit', function() {
      console.log('exit');
      if (d) {
        d.land();
        d.disconnect();
      }
    });

  });
}
