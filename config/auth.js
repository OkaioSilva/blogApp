const localStategy = require("passport-local").Strategy
const mongoose = require('mongoose')
const bcrypt = require("bcryptjs")

// model usuário
require("../models/Usuario")
const Usuario = mongoose.model('usuarios')



module.exports = function(passport){
    passport.use(new localStategy({usernameField: "email", passwordField: "senha"}, (email, senha, done)=>{
        Usuario.findOne({email: email}).lean().then((usuario)=>{
            if(!usuario){
                return done(null, false, {message: "Esta conta não existe"})
            }

            bcrypt.compare(senha, usuario.senha, (erro, batem)=>{
                if(batem){
                    return done(null, usuario)
                    
                }else{
                    return done(null, false, {message: "Senha incorreta"})
                }
            })
        })
    }))



    passport.serializeUser((usuario, done)=>{
        done(null, usuario._id)
    })

    passport.deserializeUser((id, done)=>{
        Usuario.findById(id, (e, usuario)=>{
            done(e, usuario)
        })
    })
}