const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose)

const donationSchema = new mongoose.Schema(
    {
        donorName: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        project: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Project'
        },
        mobile: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        },
        year: {
            type: Number,
            required: true
        },
        month: {
            type: Number,
            required: true
        },
        day: {
            type: Number,
            required: true
        },
        paymentMethod: {
            type: String,
            required: true
        },
        donationAmount: {
            type: Number,
            required: true
        }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model('Donations', donationSchema)