


let channels = [];

function setChannel(id,channel){
    channels[id] = channel;
}

function getChannel(id,callback){
    callback(channels[id]);
}

function closeChannel(channel){
    console.log("channel closed");
    channel.close();
}

function sendMessage(queue,channel,message){
    channel.assertQueue(queue);
    channel.sendToQueue(queue, Buffer.from(message.toString()));
}

function subscribeQueue(queue,channel,callback){
    channel.assertQueue(queue);
    channel.consume(queue, function(msg) {
        console.log(msg.content.toString());
        channel.ack(msg);
        callback(msg);
    });
}

function createChannel(callback){
    require('amqplib/callback_api')
    .connect('amqp://localhost', function(err, connection) {
        if (err != null) bail(err);
        connection.createChannel(function(err, ch) {
            callback(ch);
        });
    });
}

module.exports = {

}


if (process.argv[2].toString() === "producer") {
    createChannel(function(channel){
        sendMessage("mq-queue",channel,"message");
    });
}

if (process.argv[2].toString() === "consumer") {
    createChannel(function(channel){
        setChannel("consumer",channel);
        subscribeQueue("mq-queue",channel,function(msg){
            console.log("mesasge on subscriber");
            console.log(msg);
        });
    });

    setTimeout(function(){
        getChannel("consumer",function(channel){
            console.dir(channel)
            closeChannel(channel);
        });
    }, 5000)
}
