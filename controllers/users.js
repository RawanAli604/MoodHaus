const express = require('express');
const router = express.Router();
const Furniture = require('../models/furniture.js');

router.get('/profile', async (req, res) => {
    try {
const myFurniture = await Furniture.find({
    owner: req.session.user._id,
}).populate('owner');

res.render('users/show.ejs', {
    myFurniture,
});
    } catch (error) {
        console.log(error);
        res.redirect('/');
    }
});

module.exports = router;