const express = require('express')
const router = express.Router();
const Meta = require('html-metadata-parser');
const createError = require('http-errors')
const urlMetadata = require('url-metadata');
const cheerio = require('cheerio');
const axios = require('axios');
const fetch = require('node-fetch');

const getMetadataParser = async (req, res, next) => {
    try {
        const {url} = req.body;
        if (!url) {
            throw createError.BadRequest();
        }
        const result = await Meta.parser(url);
        // console.log(JSON.stringify(result, null, 3));
        const og = result['og'];
        const {title, image, description} = og;

        if (!title && !image && !description) {
            next()
        } else {
            console.log('getMetadataParser')
            res.json({
                title,
                image,
                description
            })
        }
    } catch (error) {
        res.json({
            title: '',
            image: '',
            description: ''
        })
    }
}

const getUrlMetadata = async (req, res, next) => {
    try {
        // console.log(JSON.stringify(url, null, 3));
        // const {url} = req.body;
        // fetch(url).then( async (res1) => {
        //     const html = await res1.text();
        //     // console.log(html);
        //     const $ = cheerio.load(html);

        //     const getMetatag = (name) =>  
        //     $(`meta[property=${name}]`).attr('content') ||  
        //     $(`meta[property="og:${name}"]`).attr('content') ||  
        //     $(`meta[property="twitter:${name}"]`).attr('content');

        //     // console.log($('meta).get(1).attr('content')));
        //     const data = $('title').toString();
        //     console.log(data);

        //     res.json({ 
        //         // title: $('title').first().text(),
        //         title: getMetatag('site_name'),
        //         // description: $('meta[name=description]').attr('content'),
        //         description: getMetatag('description'),
        //         image: getMetatag('image'),
        //         author: getMetatag('author'),
        //     })
        // })
        const {url} = req.body;
        if (!url) {
            throw createError.BadRequest();
        }
        const {data: html} = await axios.get(url);
        // console.log(html);
        const $ = cheerio.load(html);

        const getMetatag = (name) =>  
        $(`meta[property=${name}]`).attr('content') ||  
        $(`meta[property="og:${name}"]`).attr('content') ||  
        $(`meta[property="twitter:${name}"]`).attr('content');

        const span = $('[data-nav="followers"] .ProfileNav-value');
        const data = span.data('count');
        console.log(data);
        // console.log(span.html());
        res.json({ 
            title: getMetatag('title'),
            description: getMetatag('description'),
            image: getMetatag('image')
        })
    } catch (error) {
        next(error)
    }
}

router.post('/getInfo', getUrlMetadata)

module.exports = router;