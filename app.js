'use strict';

const express = require('express');
const app = express();

const userRoutes = require('./routes/user.routes');
const sessionRoutes = require('./routes/session.routes');
const uploadFileRoutes = require('./routes/upload-file');
const metadataRoutes = require('./routes/metadata.routes');

const cookieParser = require('cookie-parser')
const createError = require('http-errors')
require('./helpers/connections-mongodb')
require('dotenv').config()
require('./helpers/connections-redis')
const Redis = require('ioredis');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const clientRedis = new Redis();
const cors = require('cors');
const swaggerUI = require('swagger-ui-express');
const YAML = require('yamljs');

const path = require('path');
const swaggerLocation = path.join(__dirname, 'swagger.json');
const swaggerJsDocs = require(swaggerLocation);

app.use(cors());

// Express configuration
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerJsDocs));

app.use(cookieParser())

app.get('/cookie/get', (req, res) => {
    const cookies = req.cookies
    res.send(cookies)
})

app.get('/cookie/set', (req, res) => {
    res.cookie('username', 'leductanh', {
        // maxAge: 5 * 1000,
        httpOnly: true
    }).cookie('abc', '123', {
        httpOnly: true
    })
    res.send('Set cookies')
})

app.get('/cookie/del', (req, res) => {
    res.clearCookie('abc')
    res.send('Delete cookie')
})

/**
 * In this case, we will allow any origin to avoid CORS problems that 
 * does not matter for the purpose of this demo example.
 */
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", '*');
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    } else {
        next();
    }
});

// Session
app.use(session({
    secret: 'keyboard cat',
    store: new RedisStore({client: clientRedis}),
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: false,
        httpOnly: true,
        maxAge: 5 * 60 * 1000
    }
}))

// Routes
app.use('/user', userRoutes);
app.use('/session', sessionRoutes);
app.use('/upload-file', uploadFileRoutes);
app.use('/metadata', metadataRoutes);

// Middlewares
app.use((req, res, next) => {
    next(createError.NotFound('This route does not exist.'))
})

app.use((err, req, res, next) => {
    res.json({
        status: err.status || 500,
        message: err.message
    })
})

app.listen(3000);
console.log('Server init at port ' + 3000);

module.exports = app;