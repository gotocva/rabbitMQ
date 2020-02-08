



class MessageQueue {
    
    constructor(){
        this.channels = [];
    }

    setChannel(id,channel){
        this.channels[id] = channel;
    }

    getChannel(id,callback){
        callback(this.channels[id]);
    }

    createChannel(exchange,callback){
        require('amqplib/callback_api')
        .connect('amqp://localhost', function(err, connection) {
            if (err != null) bail(err);
            connection.createChannel(function(err, ch) {
                ch.assertExchange(exchange, 'fanout', {
                    durable: false
                });
                callback(ch);
            });
        });
    }

    closeChannel(channel){
        console.log("channel closed");
        channel.close();
    }

    sendMessage(exchange,channel,message){
        // channel.assertQueue(queue);
        // channel.sendToQueue(queue, Buffer.from(message.toString()));
        console.log("send mesage called exchange :"+exchange);
        channel.publish(exchange, '', Buffer.from(message.toString()));
        // console.dir(queueList);
        // queueList.forEach(function(_queue){
        //     console.log(";;;;;;;;;;"+_queue);
        //     channel.assertQueue(queue);
        //     channel.sendToQueue(queue, Buffer.from(message.toString()));
        // });
    }
    
    subscribeQueue(exchange,queue,channel,callback){
        channel.assertQueue('', { exclusive: true }, function(error2, q) {
            if (error2) {
              throw error2;
            }
            console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);
            channel.bindQueue(queue, exchange, '');
      
            channel.consume(queue, function(msg) {
              if(msg.content) {
                  console.log(" [x] %s", msg.content.toString());
                  callback(msg);
              }
            },{ noAck: true });
        });
        // channel.assertQueue(queue);
        // channel.consume(queue, function(msg) {
        //     console.log(msg.content.toString());
        //     channel.ack(msg);
        //     callback(msg);
        // });
    }

}

if (process.argv[2].toString() === "producer") {

    const MQ = new MessageQueue();

    MQ.createChannel("abc",function(channel){
        MQ.sendMessage("abc",channel,"message");
    });
}

if (process.argv[2].toString() === "consumer") {
    
    const MQ = new MessageQueue();
    let queueName = process.argv[3] || "mq-queue";

    if(process.argv[3]){
        console.log("*****"+process.argv[3]);
        queues.push(process.argv[3]);
    }else{
        queues.push("mq-queue");
    }
        
    console.dir(queues);

    MQ.createChannel("abc",function(channel){
        // console.dir(channel);
        MQ.setChannel("consumer",channel);
        MQ.subscribeQueue("abc",queueName,channel,function(msg){
            console.dir("message received on observer");
            console.dir(msg);
        })
        // setTimeout(function(){
        //     MQ.getChannel("consumer",function(channel){
        //         console.dir(channel)
        //         MQ.closeChannel(channel);
        //     });
        // }, 5000)
    })
}

