const express = require('express')
const router = express.Router();

router.get('/get', (req, res) => {
    res.send(req.session)
})

router.get('/set', (req, res) => {
    req.session.user = {
        username: 'Le Duc Tanh',
        age: 26,
        email: 'tanh13t2@gmail.com'
    }
    res.send('Set OK')
})

module.exports = router;
