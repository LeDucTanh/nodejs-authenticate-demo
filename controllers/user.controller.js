const {userValidate, passwordValidate} = require('../helpers/validation')
const createError = require('http-errors')
const User = require('../mongo-models/user.model')
const {
    signAccessToken,
    signRefreshToken,
    verifyRefreshToken
} = require('../helpers/jwt-service');
const client = require('../helpers/connections-redis');

const register = async (req, res, next) => {
    try {
        const {email, password} = req.body
        const {error} = userValidate(req.body)
        
        if (error) {
            throw createError.UnprocessableEntity(error.details[0].message)
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
            status: 'success',
            data: savedUser
        })
    } catch (error) {
        next(error)
    }
}

const login = async (req, res, next) => {
    try {
        const {email, password} = req.body
        const {error} = userValidate(req.body)
        
        if (error) {
            throw createError.UnprocessableEntity(error.details[0].message)
        }

        const user = await User.findOne({
            username: email
        })
        if (!user) {
            throw createError.NotFound('User has not registered yet')
        }

        const isValid = await user.isCheckPassword(password)
        if (!isValid) {
            throw createError.Unauthorized('wrong password')
        }

        const accessToken = await signAccessToken(user._id)
        const refreshToken = await signRefreshToken(user._id)
        res.json({
            status: 200,
            data: {
                'access-token': accessToken,
                refreshToken
            }
        })
    } catch (error) {
        next(error)
    }
}

const refreshToken = async (req, res, next) => {
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
}

const getList = async (req, res, next) => {
    try {
        const users = await User.find()
        res.json({
            users
        })
    } catch (error) {
        next(error)
    }
}

const changePassword = async (req, res, next) => {
    try {
        const {currentPassword, newPassword} = req.body;
        const {error} = passwordValidate(req.body);
        if (error) {
            throw createError.UnprocessableEntity(error.details[0].message)
        }
        if (currentPassword === newPassword) {
            throw createError.UnprocessableEntity('current password and new password must not be the same')
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
        next(error);
    }
}

const logout = async (req, res, next) => {
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

module.exports = {
    register,
    login,
    refreshToken,
    getList,
    changePassword,
    logout
}