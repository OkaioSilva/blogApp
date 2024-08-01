const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
require("../models/Usuario")
const Usuario = mongoose.model('usuarios')
const bcrypt = require('bcryptjs')

const passport = require('passport');



router.get('/registro', (req, res)=>{
    res.render("usuarios/registro")
})

router.post('/registro', (req, res)=>{
    const erros = []

    if(!req.body.nome || typeof req.body.nome == undefined){
        erros.push({texto: "Nome inválido"})
    }
    if(!req.body.email || typeof req.body.email == undefined){
        erros.push({texto: "Email inválido"})
    }

    if(!req.body.senha || typeof req.body.senha === undefined){
        erros.push({texto: "Senha inválida"})
    }

    if(req.body.senha.length < 8){
        erros.push({texto:'Senha menor que 8 caractéres'})
    }

    if(req.body.senha != req.body.senha2){
        erros.push({texto: "Senhas diferentes. Tente novamente!"})
    }

    if(erros.length > 0){
        res.render('usuarios/registro', {erros: erros})
    }else{
        Usuario.findOne({email: req.body.email}).lean().then((usuario)=>{
            if(usuario){
                req.flash("error_msg", "Já existe uma usuário registrado")
                res.redirect('/usuarios/registro')
            }else{
                const novoUsuarios = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                })

                bcrypt.genSalt(10, (erro, salt)=>{
                    // salt é um valor aleatório misturado com o hash da senha para dificultar o vazamento
                    bcrypt.hash(novoUsuarios.senha, salt, (erro, hash)=>{
                        if(erro){
                            req.flash('error_msg', 'Houve um erro durante o salvamento do usuário')
                            res.redirect('/')
                        }

                        novoUsuarios.senha = hash
                        novoUsuarios.save().then(()=>{
                            req.flash('success_msg', 'Usuário criado com sucesso!')
                            res.redirect('/')
                        }).catch((e)=>{
                            req.flash('error_msg', 'Houve um erro ao criar usuário, tente novamente')
                            res.redirect('/usuarios/registro')
                        })
                    })
                })

            }
        }).catch((e)=>{
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/")
        })
    }
})


router.get("/login", (req, res)=>{
    res.render('usuarios/login')
})

router.post("/login", (req, res, next)=>{
    passport.authenticate('local', {
        successRedirect: "/",
        failureRedirect: "/usuarios/login",
        failureFlash: true
    })(req, res, next)
})

router.get('/logout', (req, res)=>{
    req.logOut((e)=>{
        if(e){
            return next(e)
        }
        req.flash('success_msg', "Volte logo 😊")
        res.redirect('/')
    })
})


module.exports = router