const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose)

const donorSchema = new mongoose.Schema(
    {
        donorName: {
            type: String,
            required: true
        },
        project: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Project'
        },
        email: {
            type: String,
            required: true
        },
        amount: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
)

donorSchema.plugin(AutoIncrement, {
    inc_field: 'donor',
    id: 'donorNums',
    start_seq: 500
})

module.exports = mongoose.model('Donor', donorSchema)