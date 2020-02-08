
class MessageQueue {

    constructor(){
        this.channels = [];
    }

    connect(callback){
        require('amqplib/callback_api')
        .connect('amqp://localhost', function(err, connection) {
            if (err != null) throw err;
                callback(connection);
        });
    }

    subscribe(ch,q,callback){ 
        ch.assertQueue(q);
        ch.consume(q, function(msg) {
            if (msg !== null) {
                console.log(msg.content.toString());
                console.log("msg received for client ");
                ch.ack(msg);
                callback(msg.content.toString());
            }
        });
    }

    send(conn,queue,msg){
        conn.createChannel(function(err, ch) {
            if (err != null) throw err;
            ch.assertQueue(queue);
            ch.sendToQueue(queue, Buffer.from(msg.toString()));
            ch.close();
        });
    }

    sendMany(conn,queues,msg){
        conn.createChannel(function(err, ch) {
            if (err != null) throw err;
            queues.forEach((_q) => {
                ch.assertQueue(_q);
                ch.sendToQueue(_q, Buffer.from(msg.toString()));
            })
            ch.close();
        });
    }

    pushChannel(channel){
        this.channels.push(channel);
    }

    closeChannels(){
        this.channels.forEach(function(channel){
            console.dir(channel);
            channel.close();
        });
    }
}


module.exports = MessageQueue;