const express = require('express');
const router = express.Router();
const MoodBoard = require('../models/moodBoard');
const Furniture = require('../models/furniture');

router.get('/', async (req, res) => {
  try {
    const ownerId = req.session.user._id;
    const populatedBoards = await MoodBoard.find({ owner: ownerId });
    res.render('moodBoard/index.ejs', { boards: populatedBoards });
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
});

router.get('/new', (req, res) => {
  res.render('moodBoard/new.ejs');
});

router.post('/', async (req, res) => {
  try {
    const ownerId = req.session.user._id;
    await MoodBoard.create({
      title: req.body.title,
      description: req.body.description || '',
      owner: ownerId,
      furnitures: []
    });
    res.redirect('/moodboards');
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
});

router.get('/:id', async (req, res) => {
  try {
    const currentBoard = await MoodBoard.findById(req.params.id).populate('furnitures');
    // this is for displaying the dropdown menu in the show page
    const allFurnitures = await Furniture.find({}).select('name price image');
    res.render('moodBoard/show.ejs', { board: currentBoard, allFurnitures });
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const currentBoard = await MoodBoard.findById(req.params.id);

    if (currentBoard.owner.equals(req.session.user._id)) {
      await MoodBoard.deleteOne({ _id: req.params.id });
      res.redirect('/moodboards');
    } else {
      res.send(`Permission denied, you're not authorized to do that!`);
    }
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
});

router.get('/:id/edit', async (req, res) => {
  try {
    const currentBoard = await MoodBoard.findById(req.params.id);
    if (currentBoard.owner.equals(req.session.user._id)) {
        res.render('moodBoard/edit.ejs', { board: currentBoard });
    } else {
        res.send(`Permission denied, you're not authorized to edit this board!`);
    }
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
});

router.put('/:id', async (req, res) => {
  try {
    const currentBoard = await MoodBoard.findById(req.params.id);
    if (currentBoard.owner.equals(req.session.user._id)) {
    currentBoard.title = req.body.title;
    currentBoard.description = req.body.description;
    await currentBoard.save();
    res.redirect(`/moodboards/${currentBoard._id}`);    } 
    else {
     res.send(`You don't have permession to do that.`);
    }
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
});

//add furniture
router.post('/:id/add', async (req, res) => {
  try {
    const currentBoard = await MoodBoard.findById(req.params.id);
    const furnitureId = req.body.furnitureId || req.body.furnitureIdSelect || req.body.furniture;

    // prevent duplicates
    if (!currentBoard.furnitures.map(String).includes(String(furnitureId))) {
      currentBoard.furnitures.push(furnitureId);
      await currentBoard.save();
    }
    res.redirect(`/moodboards/${currentBoard._id}`);
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
});

//remove furniture
router.post('/:id/remove', async (req, res) => {
  try {
    const currentBoard = await MoodBoard.findById(req.params.id);
    const furnitureId = req.body.furnitureId;

    currentBoard.furnitures = currentBoard.furnitures.filter(fid => fid.toString() !== furnitureId.toString());
    await currentBoard.save();

    res.redirect(`/moodboards/${currentBoard._id}`);
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
});


module.exports = router;
