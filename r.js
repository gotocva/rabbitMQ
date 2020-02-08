
const express = require("express");

const app = express();
const expressWs = require('express-ws')(app);

app.get('/ping',function(req,res){ 
    res.send("Pong");
}); 

// start of rabbitmq

var q = 'tasks';
 
function bail(err) {
  console.error(err);
  process.exit(1);
}
 
 
let conn;

var amqp = require('amqp');
var _connection = amqp.createConnection({ host: "localhost", port: 5672 });
var count = 1;
var _exchange;

_connection.on('ready', function () {
  _connection.exchange("my_exchange", options={type:'fanout'}, function(exchange) {   
    _exchange = exchange;
    // var sendMessage = function(exchange, payload) {
    //   console.log('about to publish')
    //   var encoded_payload = JSON.stringify(payload);
    //   exchange.publish('', encoded_payload, {})
    // }

    // // Recieve messages
    // connection.queue("my_queue_name", function(queue){
    //   console.log('Created queue')
    //   queue.bind(exchange, ''); 
    //   queue.subscribe(function (message) {
    //     console.log('subscribed to queue')
    //     var encoded_payload = unescape(message.data)
    //     var payload = JSON.parse(encoded_payload)
    //     console.log('Recieved a message:')
    //     console.log(payload)
    //   })
    // })

    // setInterval( function() {    
    //   var test_message = 'TEST '+count
    //   sendMessage(exchange, test_message)  
    //   count += 1;
    // }, 2000) 
 })
})

require('amqplib/callback_api')
.connect('amqp://localhost', function(err, connection) {
    if (err != null) bail(err);
        // consumer(conn);
        // publisher(conn);
        conn = connection;
        // console.dir(connection);
});

// end of rabbitmq

let clients = [];

app.ws('/chat',function(ws,req){
    
    //let listener;

    req.query.id = parseInt(req.query.id);
    console.log("Client connected to socket"+req.query.id);
    
    clients[req.query.id] = ws;

    ws.on('message',function(msg){
        if(parseInt(req.query.id) === 1){
            // conn.createChannel(function(err, ch) {
            //     if (err != null) bail(err);
            //     ch.assertQueue(q);
            //     ch.sendToQueue(q, Buffer.from(msg.toString()));
            // });

            var encoded_payload = JSON.stringify(msg);
            _exchange.publish('', encoded_payload, {})
        }
    });

    ws.on('close',function(){
        console.log("client disconnected from socket"+req.query.id);
        clients[req.query.id].listener.close();
        clients[req.query.id] = null;
    });

    if(parseInt(req.query.id) != 1){

        // conn.createChannel(function(err, ch) {
        //     if (err != null) bail(err);
        //     clients[req.query.id].listener = ch;
        //     ch.assertQueue(q);
        //     ch.consume(q, function(msg) {
        //       if (msg !== null) {
        //         console.log(msg.content.toString());
        //         console.log("msg received for client "+req.query.id);
        //         if(clients[req.query.id] != null){
        //             ws.send("message from rabbitmq "+msg.content.toString())
        //             ch.ack(msg);
        //         }
        //       }
        //     });
        // });

        _connection.queue(req.query.id.toString(), function(queue){
          console.log('Created queue'+req.query.id.toString())
          queue.bind(_exchange, ''); 
          queue.subscribe(function (message) {
            console.log('subscribed to queue')
            var encoded_payload = unescape(message.data)
            var payload = JSON.parse(encoded_payload)
            console.log('Recieved a message:')
            console.log(payload);
          })
        })
    }

});

// catch 404 and shows not found message
app.use(function(req, res, next){
    //bitgo.createWallet("testing");
    res.send("path not found");
});

app.listen(8888, () => {
  console.log('application running on PORT 8888');
});

