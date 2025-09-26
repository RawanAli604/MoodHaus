const express = require('express');
const router = express.Router();

const Furniture = require('../models/furniture.js');

router.get('/', async (req, res) => {
    res.send("Furniture rout");
});

module.exports = router;