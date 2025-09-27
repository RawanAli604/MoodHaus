const mongoose = require('mongoose');

const furnitureSchema = new mongoose.Schema({
    name: {
    type: String,
    required: true,
    },
    description: {
    type: String,
    required: true,
    },
    category: {
     type: String,
     required: true,
    }, 
    price: {
     type: Number,
     required: true,
    },
    image: {
     type: String, 
       },
    owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'User'
    },
});

const Furniture = mongoose.model('Furniture', furnitureSchema);
module.exports = Furniture;