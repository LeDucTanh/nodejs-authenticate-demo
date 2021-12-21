const {userValidate, passwordValidate} = require('../helpers/validation')
const createError = require('http-errors')
const User = require('../mongo-models/user.model')
const {
    signAccessToken,
    signRefreshToken,
    verifyRefreshToken
} = require('../helpers/jwt-service');
const client = require('../helpers/connections-redis');

module.exports = {
    register: async (req, res, next) => {
        try {
            const {email, password} = req.body
            const {error} = userValidate(req.body)
            
            if (error) {
                throw createError(error.details[0].message)
            }
    
            // if (!email || !password) {
            //     throw createError.BadRequest();
            // }
    
            const isExist = await User.findOne({
                username: email
            })
    
            if (isExist) {
                throw createError.Conflict(`${email} has been registerd`);
            }

            // user = new User(_.pick(req.body, ["name", "email", "password"]));

            const user = new User({
                username: email,
                password
            })
    
            const savedUser = await user.save() // call pre function
    
            return res.json({
                status: 'okay',
                elements: savedUser
            })
        } catch (error) {
            next(error)
        }
    },

    login: async (req, res, next) => {
        try {
            const {email, password} = req.body
            console.log('tanh::: ' + req.body)
            const {error} = userValidate(req.body)
            
            if (error) {
                throw createError(error.details[0].message)
            }
    
            const user = await User.findOne({
                username: email
            })
            if (!user) {
                throw createError.NotFound('User has not registered yet')
            }
    
            const isValid = await user.isCheckPassword(password)
            if (!isValid) {
                throw createError.Unauthorized()
            }
    
            const accessToken = await signAccessToken(user._id)
            const freshToken = await signRefreshToken(user._id)
            res.json({
                accessToken,
                freshToken
            })
        } catch (error) {
            console.log('here::::')
            next(error)
        }
    },

    refreshToken: async (req, res, next) => {
        try {
            const {refreshToken} = req.body
            if (!refreshToken) throw createError.BadRequest()
            const {userId} = await verifyRefreshToken(refreshToken)
            const accessToken = await signAccessToken(userId)
            const refToken = await signRefreshToken(userId)
    
            res.json({
                accessToken,
                refToken
            })
        } catch (error) {
            next(error)
        }
    },

    getList: async (req, res, next) => {
        try {
            const users = await User.find()
            res.json({
                users
            })
        } catch (error) {
            next(error)
        }
    },

    changePassword: async (req, res, next) => {
        try {
            const {currentPassword, newPassword} = req.body;
            const {error} = passwordValidate(req.body);
            if (error) {
                throw createError.Unauthorized(error.details[0].message)
            }
            if (currentPassword === newPassword) {
                throw createError.Unauthorized('current password and new password must not be the same')
            }
            const {userId} = req.payload
            // const user = await User.findOne({
            //     _id: userId.toString()
            // })
            const userToUpdate = await User.findById(userId)
            const isValid = await userToUpdate.isCheckPassword(currentPassword)
            if (!isValid) {
                throw createError.Unauthorized('wrong password')
            }
            userToUpdate.set({ password: newPassword })
    
            await userToUpdate.save()
            res.json({
                'message': 'Change password successfully'
            })
        } catch (error) {
            next(error)
        }
    },

    logout: async (req, res, next) => {
        try {
            const {refreshToken} = req.body
            if (!refreshToken) {
                throw createError.BadRequest()
            }
            const {userId} = await verifyRefreshToken(refreshToken)
            const reply = await client.del(userId.toString())
            console.log('del ' +reply)
            
            res.json({
                message: 'Logout!'
            })
        } catch (error) {
            next(error)
        }
    }
}