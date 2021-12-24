const express = require('express')
const router = express.Router();
const multer = require('multer');

const fileStorageEngine = multer.diskStorage({
    destination: (req, res, callback) => {
        callback(null, './uploaded-files')
    },
    filename: (req, file, callback) => {
        callback(null, Date.now() + '--' + file.originalname)
    }
})

const upload = multer({storage: fileStorageEngine})

router.post('/single', upload.single('image'), (req, res) => {
    console.log(req.file)
    res.send('Single file uploaded successfully')
})

router.post('/multiple', upload.array('images', 3), (req, res) => {
    console.log(req.files)
    res.send('Multiple files uploaded successfully')
})

// index mongodb
// swagger ui

module.exports = router;