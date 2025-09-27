const mongoose = require('mongoose');

const moodBoardSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true,
    },
    description : {
        type: String,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    furnitures: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Furniture'
    }]
});

const moodBoard = mongoose.model('MoodBoard', moodBoardSchema);
module.exports = moodBoard;
