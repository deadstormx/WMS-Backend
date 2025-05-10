const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
    routeId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    routeName: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['In Progress', 'Scheduled', 'No Schedule', 'Completed'],
        default: 'No Schedule'
    }
}, {
    timestamps: true
});

const Route = mongoose.model('Route', routeSchema);

module.exports = Route; 