const express = require('express');
const router = express.Router();
const MoodBoard = require('../models/moodBoard');
const Furniture = require('../models/furniture');
const isSignedIn = require('../middleware/is-signed-in'); // reuse your auth middleware

// index: list user's boards
router.get('/', isSignedIn, async (req, res) => {
  const boards = await MoodBoard.find({ owner: req.session.user._id }).sort('-createdAt');
  res.render('moodboards/index.ejs', { boards });
});

// new form
router.get('/new', isSignedIn, (req, res) => {
  res.render('moodboards/new.ejs');
});

// create
router.post('/', isSignedIn, async (req, res) => {
  const board = new MoodBoard({
    title: req.body.title,
    description: req.body.description,
    owner: req.session.user._id
  });
  await board.save();
  res.redirect('/moodboards');
});

// show board with populated furnitures
router.get('/:id', isSignedIn, async (req, res) => {
  const board = await MoodBoard.findById(req.params.id).populate({
    path: 'furnitures',
    populate: { path: 'owner' } // optional nested populate
  });
  if (!board) return res.redirect('/moodboards');
  res.render('moodboards/show.ejs', { board });
});

// add a furniture to a board
router.post('/:id/add', isSignedIn, async (req, res) => {
  const board = await MoodBoard.findById(req.params.id);
  if (!board) return res.redirect('/moodboards');

  // authorization: only owner can modify
  if (!board.owner.equals(req.session.user._id)) return res.status(403).send('Forbidden');

  const furnitureId = req.body.furnitureId; // from a button/form
  // prevent duplicates
  if (!board.furnitures.includes(furnitureId)) {
    board.furnitures.push(furnitureId);
    await board.save();
  }
  res.redirect(`/moodboards/${board._id}`);
});

// remove furniture from a board
router.post('/:id/remove', isSignedIn, async (req, res) => {
  const board = await MoodBoard.findById(req.params.id);
  if (!board) return res.redirect('/moodboards');
  if (!board.owner.equals(req.session.user._id)) return res.status(403).send('Forbidden');

  board.furnitures = board.furnitures.filter(fid => fid.toString() !== req.body.furnitureId);
  await board.save();
  res.redirect(`/moodboards/${board._id}`);
});

// delete a board
router.delete('/:id', isSignedIn, async (req, res) => {
  const board = await MoodBoard.findById(req.params.id);
  if (!board.owner.equals(req.session.user._id)) return res.status(403).send('Forbidden');
  await MoodBoard.deleteOne({ _id: req.params.id });
  res.redirect('/moodboards');
});

module.exports = router;
