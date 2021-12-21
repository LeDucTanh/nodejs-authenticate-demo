const express = require('express')
const router = express.Router();

const {verifyAccessToken} = require('../helpers/jwt-service');
const controller = require('../controllers/user.controller')

router.post('/register', controller.register)

router.post('/login', controller.login)

router.post('/refresh-token', controller.refreshToken)

router.post('/change-password', verifyAccessToken, controller.changePassword)

router.get('/getList', verifyAccessToken, controller.getList)

router.delete('/logout', controller.logout)

module.exports = router