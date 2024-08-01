const mongoose = require("mongoose")
const Schema = mongoose.Schema

// import mongoose from "mongoose"
// const { Schema } = mongoose

const Postagem = new Schema({
    titulo:{
        type:String
    },
    slug:{
        type: String
    },
    descricao:{
        type: String
    },
    conteudo:{
        type: String
    },
    categoria:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: "categorias"
    }, 
    date:{
        type: Date,
        default: Date.now()
    }
})

mongoose.model('postagens', Postagem)

// export default Postagem
module.exports = Postagem
// categoria:{type: Schema.Types.ObjectId, ref:"categorias", required: true}, //"chave estrangeira" - armazena o ID de alguma categoria cadastrada
//data:{type: Date, default: Date.now()}