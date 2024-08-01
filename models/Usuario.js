const mongoose = require('mongoose')
const Schema = mongoose.Schema


const Usuario = new Schema({
    nome:{
        type: String
    },
    email:{
        type: String
    },
    eAdmin:{
        type: Number,
        default: 0
    },
    senha:{
        type: String
    }
})

mongoose.model("usuarios", Usuario)