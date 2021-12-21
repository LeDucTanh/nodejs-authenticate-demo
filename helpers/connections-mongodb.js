const mongoose = require('mongoose')

const conn = mongoose.connect('mongodb://127.0.0.1:27017/myapp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("MongoDB::: connected to the Database!");
})
.catch(err => {
    console.log(`MongoDB::: error::: ${JSON.stringify(err)}`)
});

process.on('SIGINT', async () => {
    mongoose.connection.close(() => {
        console.log(`MongoDB::: disconnected`)
        process.exit(0)
    })
})

module.exports = conn;