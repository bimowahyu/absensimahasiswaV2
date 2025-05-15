const express = require('express')
const  getAbsensiGrupDosen = require('../controllers/dosenController')
const { DosenOnly } = require('../middleware/AdminMiddleware')


const router = express.Router()

//router.get('/absensibydosen',DosenOnly,getAbsensiGrupDosen)

module.exports = router;