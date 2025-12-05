const mongoose = require('mongoose')

const DataSchema = mongoose.Schema({

    Data_Type: {
        type: String
    },
    Data_Name: {
        type: String,
    },
    Data_Label: {
        type: String
    },
    Data_Status: {
        type: Boolean,
        default: true
    }
},
    {
        timestamps: true,
    }

)

module.exports = mongoose.model('Data', DataSchema)