const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload'); 

const Furniture = require('../models/furniture');
const MoodBoard = require('../models/moodBoard'); // import the model

router.get('/', async (req, res) => {
    try{
    const populatedFurnitures = await Furniture.find({}).populate('owner');

    let userBoards = [];
    if (req.session.user) {
      userBoards = await MoodBoard.find({ owner: req.session.user._id });
    }
       res.render("furnitures/index.ejs", {
        furnitures: populatedFurnitures,
        userBoards: userBoards,
       });
    }catch(error){
        console.log(error);
        res.redirect('/');
    }
});

router.get('/new', async (req, res) => {
res.render('furnitures/new.ejs')
});

router.post('/', upload.single('image'), async (req, res) => {
    try {
    await Furniture.create({
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      price: req.body.price,
      owner: req.session.user._id,
      image: req.file ? '/uploads/' + req.file.filename : null
      });

    res.redirect('/furnitures');
    } catch(error){
        console.log(error);
        res.redirect('/furnitures');
    }
});

router.get('/:furnitureId', async (req, res) => {
try{
    const populatedFurnitures = await Furniture.findById(req.params.furnitureId).populate('owner');
res.render("furnitures/show.ejs",{
    furniture: populatedFurnitures,
});
} catch(error){
    console.log(error);
    res.redirect('/');
}
});

router.delete('/:furnitureId', async (req, res) => {
try{
const furniture = await Furniture.findById(req.params.furnitureId);
if(furniture.owner.equals(req.session.user._id)){
    await Furniture.deleteOne();
    res.redirect('/furnitures');
} else {
     res.send(`Permession denied, you're not authorized to do that!`);
}
} catch(error){
    console.log(error);
    res.redirect('/');
}
});

router.get('/:furnitureId/edit', async (req, res) => {
    try {
       const currentFurniture = await Furniture.findById(req.params.furnitureId);
       res.render('furnitures/edit.ejs', {
        furniture : currentFurniture,
       });
    } catch(error){
        console.log(error);
        res.redirect('/');
    }
});

router.put('/:furnitureId', upload.single('image'), async (req, res) => {
try {
    const currentFurniture = await Furniture.findById(req.params.furnitureId);
    if(currentFurniture.owner.equals(req.session.user._id)){
      await currentFurniture.updateOne({
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      price: req.body.price,
      owner: req.session.user._id,
      image: req.file ? '/uploads/' + req.file.filename : null});
      res.redirect('/furnitures');
    } else {
            res.send(`You don't have permession to do that.`);
    }
} catch (error) {
    console.log(error);
    res.redirect('/');
}
});

module.exports = router;