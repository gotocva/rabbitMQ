
const express = require("express");

const app = express();
const expressWs = require('express-ws')(app);

app.get('/ping',function(req,res){ 
    res.send("Pong");
}); 

// start of rabbitmq


let conn;
let pub_channel;
let sub_channel; 

require('amqplib/callback_api')
.connect('amqp://localhost', function(err, connection) {
    if (err != null) bail(err);
        // consumer(conn);
        // publisher(conn);
        conn = connection;
        conn.createChannel(function(err, ch) {
            pub_channel = ch;
        });
        conn.createChannel(function(err, ch) {
            sub_channel = ch;
        });
});


// end of rabbitmq

let clients = [];

let __clients = [];
let __queues = [];

app.ws('/chat/:pair',function(ws,req){

    let q = "_testing-queue";

    let pairs = req.params.pair.split("-");
    let id = req.query.id;
    __clients[id] = ws;

    ws.on('message',function(msg){
        if(parseInt(req.query.id) === 1){
            pub_channel.assertQueue(q);
            pub_channel.sendToQueue(q, Buffer.from(msg.toString()));
        }
    });
    if(parseInt(req.query.id) === 2){
        conn.createChannel(function(err, ch) {
            sub_channel = ch;
            sub_channel.assertQueue(q);
            sub_channel.consume(q, function(msg) {
            if (msg !== null) {
                console.log(msg.content.toString());
                console.log("msg received for client "+req.query.id);
                if(__clients[id] != null){
                    ws.send("message from rabbitmq "+msg.content.toString())
                    sub_channel.ack(msg);
                }
            }
            });
        });
    }

    ws.on('close',function(){
        console.log("client disconnected");
        if(parseInt(req.query.id) === 2){
            sub_channel.close();
        }
    })

});

app.ws('/chat',function(ws,req){
    
    //let listener;
    queues.push(req.query.id.toString());
    req.query.id = parseInt(req.query.id);
    console.log("Client connected to socket"+req.query.id);
    
    clients[req.query.id] = ws;

    ws.on('message',function(msg){
        if(parseInt(req.query.id) === 1){
            conn.createChannel(function(err, ch) {
                if (err != null) bail(err);
                queues.forEach(function(q){
                    ch.assertQueue(q);
                    ch.sendToQueue(q, Buffer.from(msg.toString()));
                });
            });
        }
    });

    ws.on('close',function(){
        if(clients[req.query.id].listener != undefined)
            clients[req.query.id].listener.close();
        clients[req.query.id] = null;
        console.log("client disconnected from socket"+req.query.id);
    });

    if(parseInt(req.query.id) != 1){

        if (clients[req.query.id] === undefined) {
            q = req.query.id.toString();
            conn.createChannel(function(err, ch) {
                console.log("queue name "+q);
                
                if (err != null) bail(err);
                clients[req.query.id].listener = ch;
                ch.assertQueue(q);
                ch.consume(q, function(msg) {
                if (msg !== null) {
                    console.log(msg.content.toString());
                    console.log("msg received for client "+req.query.id);
                    if(clients[req.query.id] != null){
                        ws.send("message from rabbitmq "+msg.content.toString())
                        ch.ack(msg);
                    }
                }
                });
            });
        }
        
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

