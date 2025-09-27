// controllers/moodBoard.js
const express = require('express');
const router = express.Router();
const MoodBoard = require('../models/moodBoard');
const Furniture = require('../models/furniture');
const isSignedIn = require('../middleware/is-signed-in');

// Helper: ensure owner
function ensureOwner(board, userId) {
  return board.owner && board.owner.toString() === userId.toString();
}

// INDEX - list user's boards
router.get('/', isSignedIn, async (req, res) => {
  try {
    const ownerId = req.session.user._id;
    const boards = await MoodBoard.find({ owner: ownerId }).sort('-createdAt');
    res.render('moodBoard/index.ejs', { boards });
  } catch (err) {
    console.error('Moodboards index error:', err);
    res.redirect('/');
  }
});

// NEW - form
router.get('/new', isSignedIn, (req, res) => {
  res.render('moodBoard/new.ejs');
});

// CREATE
router.post('/', isSignedIn, async (req, res) => {
  try {
    const ownerId = req.session.user._id;
    await MoodBoard.create({
      title: req.body.title,
      description: req.body.description || '',
      owner: ownerId,
      furnitures: []
    });
    res.redirect('/moodboards');
  } catch (err) {
    console.error('Create moodboard error:', err);
    res.redirect('/moodboards');
  }
});

// SHOW - populated furnitures, also pass allFurnitures for select
router.get('/:id', isSignedIn, async (req, res) => {
  try {
    const board = await MoodBoard.findById(req.params.id).populate('furnitures');
    if (!board) return res.status(404).redirect('/moodboards');

    // Authorization: only owner can view their boards (optional: allow others to view)
    if (!ensureOwner(board, req.session.user._id)) {
      return res.status(403).send('Forbidden');
    }

    // For the "Add an item" select: fetch catalog items (light fields only)
    const allFurnitures = await Furniture.find({}).select('name price image');

    res.render('moodBoard/show.ejs', { board, allFurnitures });
  } catch (err) {
    console.error('Show moodboard error:', err);
    res.redirect('/moodboards');
  }
});

// EDIT - form
router.get('/:id/edit', isSignedIn, async (req, res) => {
  try {
    const board = await MoodBoard.findById(req.params.id);
    if (!board) return res.status(404).redirect('/moodboards');

    if (!ensureOwner(board, req.session.user._id)) {
      return res.status(403).send('Forbidden');
    }

    res.render('moodBoard/edit.ejs', { board });
  } catch (err) {
    console.error('Edit moodboard error:', err);
    res.redirect('/moodboards');
  }
});

// UPDATE
router.put('/:id', isSignedIn, async (req, res) => {
  try {
    const board = await MoodBoard.findById(req.params.id);
    if (!board) return res.status(404).redirect('/moodboards');

    if (!ensureOwner(board, req.session.user._id)) {
      return res.status(403).send('Forbidden');
    }

    board.title = req.body.title || board.title;
    board.description = req.body.description || board.description;
    await board.save();

    res.redirect(`/moodboards/${board._id}`);
  } catch (err) {
    console.error('Update moodboard error:', err);
    res.redirect('/moodboards');
  }
});

// ADD furniture to board (prevents duplicates)
router.post('/:id/add', isSignedIn, async (req, res) => {
  try {
    const board = await MoodBoard.findById(req.params.id);
    if (!board) return res.status(404).redirect('/moodboards');

    if (!ensureOwner(board, req.session.user._id)) {
      return res.status(403).send('Forbidden');
    }

    const furnitureId = req.body.furnitureId || req.body.furnitureIdSelect || req.body.furniture; // flexible
    if (!furnitureId) return res.redirect(`/moodboards/${board._id}`);

    // prevent duplicates
    if (!board.furnitures.map(String).includes(String(furnitureId))) {
      board.furnitures.push(furnitureId);
      await board.save();
    }

    res.redirect(`/moodboards/${board._id}`);
  } catch (err) {
    console.error('Add to moodboard error:', err);
    res.redirect('/moodboards');
  }
});

// REMOVE furniture from board
router.post('/:id/remove', isSignedIn, async (req, res) => {
  try {
    const board = await MoodBoard.findById(req.params.id);
    if (!board) return res.status(404).redirect('/moodboards');

    if (!ensureOwner(board, req.session.user._id)) {
      return res.status(403).send('Forbidden');
    }

    const furnitureId = req.body.furnitureId;
    board.furnitures = board.furnitures.filter(fid => fid.toString() !== furnitureId.toString());
    await board.save();

    res.redirect(`/moodboards/${board._id}`);
  } catch (err) {
    console.error('Remove from moodboard error:', err);
    res.redirect('/moodboards');
  }
});

// DELETE board
router.delete('/:id', isSignedIn, async (req, res) => {
  try {
    const board = await MoodBoard.findById(req.params.id);
    if (!board) return res.status(404).redirect('/moodboards');

    if (!ensureOwner(board, req.session.user._id)) {
      return res.status(403).send('Forbidden');
    }

    await MoodBoard.deleteOne({ _id: req.params.id });
    res.redirect('/moodboards');
  } catch (err) {
    console.error('Delete moodboard error:', err);
    res.redirect('/moodboards');
  }
});

module.exports = router;

