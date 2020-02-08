const amqp = require("amqplib");

const msg = {number: 11}
connect();
async function connect() {

    try {
        const connection = await amqp.connect("amqp://localhost:5672")
        const channel = await connection.createChannel();
        const result = await channel.assertQueue("jobs");
        channel.sendToQueue("jobs", Buffer.from(JSON.stringify(msg)))
        console.log(`Job sent successfully ${msg.number}`);
        channel.close();
    }
    catch (ex){
        console.error(ex)
    }

}