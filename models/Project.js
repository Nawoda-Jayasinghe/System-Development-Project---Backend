const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose)

const projectSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        budget: {
            type: String,
            required: true
        },
        startingDate: {
            type: String,
            required: true
        },
        endingDate: {
            type: String,
            required: true
        },
        projectCategory: {
            type: String,
            required: true
        },
        imgURL: {
            type: String,
            required: true
        },
        completed: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
)

projectSchema.plugin(AutoIncrement, {
    inc_field: 'project',
    id: 'projectNums',
    start_seq: 500
})

module.exports = mongoose.model('Project', projectSchema)