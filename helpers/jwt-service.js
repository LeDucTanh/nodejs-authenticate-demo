const JWT = require('jsonwebtoken');
const createError = require('http-errors');
const client = require('../helpers/connections-redis');

const signAccessToken = async (userId) => {
    return new Promise( (resolve, reject) => {
        const payload = {
            userId
        }
        const secret = process.env.ACCESS_TOKEN_SECRET
        const options = {
            expiresIn: '1d'
        }

        JWT.sign(payload, secret, options, (err, token) => {
            if (err) reject(err)
            resolve(token)
        })
    })
}

const verifyAccessToken = (req, res, next) => {
    if (!req.headers['authorization']) {
        return next(createError.Unauthorized())
    }
    const auHeader = req.headers['authorization']
    const bearerToken = auHeader.split(' ')
    const token = bearerToken[1]

    JWT.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
        if (err) {
            if (err.name === 'JsonWebTokenError') {
                return next(createError.Unauthorized())
            }
            // if (err.name === 'jwt expired') {
            // }
            return next(createError.Unauthorized(err.message))
        }
        req.payload = payload
        next()
    })
}

const signRefreshToken = async (userId) => {
    return new Promise( (resolve, reject) => {
        const payload = {
            userId
        }
        const secret = process.env.REFRESH_TOKEN_SECRET
        const options = {
            expiresIn: '1y'
        }

        JWT.sign(payload, secret, options, async (err, token) => {
            if (err) reject(err)
            try {
                await client.set(userId.toString(), token)
                await client.expire(userId.toString(), 365 * 24 * 60 * 60)
                resolve(token)
            } catch (error) {
                reject(createError.InternalServerError())
            }
        })
    })
}

const verifyRefreshToken = (refreshToken) => {
    return new Promise( (resolve, reject) => {
        JWT.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, payload) => {
            if (err) reject(err)

            try {
                const reply = await client.get(payload.userId)
                if (refreshToken === reply) {
                    resolve(payload)
                }
                reject(createError.Unauthorized())
            } catch (error) {
                reject(createError.InternalServerError())
            }
        })
    })
}

module.exports = {
    signAccessToken, verifyAccessToken, signRefreshToken, verifyRefreshToken
}