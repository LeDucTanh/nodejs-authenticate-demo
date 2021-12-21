const redis = require('redis');
const client = redis.createClient({ socket: { port: 6379 } });

client.connect();

client.on('connect', () => {
    console.log('Redis connected');
});

client.on('error', (err) => {
    console.log('Redis ' + err)
})

// (async () => {
//     try {
//       const client = redis.createClient({ socket: { port: 6379 } });
//       await client.connect();
//       console.log('connected');
//     } catch (err) {
//       console.error(err)
//     }
// })()

module.exports = client;