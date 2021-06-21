const mongoose = require('mongoose');

const activitiesSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    activity : {
        type : String
    }
},
{
    timestamps: true
});

module.exports = mongoose.model('activities', activitiesSchema);