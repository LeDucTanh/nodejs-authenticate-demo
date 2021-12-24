const express = require('express')
const router = express.Router();
const Meta = require('html-metadata-parser');
const createError = require('http-errors')

router.post('/getInfo', async (req, res, next) => {
    try {
        const {url} = req.body;
        if (!url) {
            throw createError.BadRequest();
        }
        const result = await Meta.parser(url);
        const og = result['og'];
        res.json({
            'title': og.title,
            'image': og.image,
            'description': og.description
        })
        res.send('Abc')
    } catch (error) {
        next(error)
    }
})

module.exports = router;