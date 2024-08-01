const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Categoria')
require('../models/Postagem')
const Categoria = mongoose.model('categorias')
const Postagem = mongoose.model('postagens')
const {eAdmin} = require("../helpers/eAdmin")


// rotas admin

router.get('/', eAdmin ,(req, res)=>{
    res.render("admin/index")
})

router.get('/posts', eAdmin , (req, res)=>{
    res.send("Página de posts")
})

router.get('/categorias', eAdmin , (req, res)=>{
    Categoria.find().sort({date: 'desc'}).lean().then((categorias)=>{
        res.render("admin/categorias", {categorias: categorias})
        
    }).catch((e)=>{
        req.flash("Error_msg", "Houve um erro ao listar a catergoria:", e)
        res.redirect('/admin')
    })
})

// router to add 
router.get('/categorias/add', eAdmin , (req, res)=>{
    res.render("admin/addCategorias")
})

router.post('/categorias/nova',  eAdmin , (req, res)=>{
    // validação de formulário
    const erros = []
    if(!req.body.nome || typeof req.body.nome === undefined || req.body.nome === null ){
        erros.push({texto: "Nome inválido!"})
    }
    if(req.body.nome < 2 ){
        erros.push({texto: "Nome da categoria muito pequeno"})
    }
    if(!req.body.slug || typeof req.body.slug === undefined || req.body.slug === null ){
        erros.push({texto: "Slug inválido!"})
    }
    
    if(erros.length > 0){
        res.render('admin/addCategorias',{erros: erros})
    }else{
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
    
        new Categoria(novaCategoria).save().then(()=>{
            req.flash("success_msg", "Categoria salva com sucesso!")
            res.redirect('/admin/categorias')
        }).catch((e)=>{
            req.flash("error_msg", "Houve um erro ao salvar a categoria, tente novamente")
            res.redirect("/admin")
            console.log('Erro ao salvar categoria: ', e)
        })
    }
    
})

// button edit
router.get('/categorias/edit/:id', eAdmin , (req, res)=>{
    Categoria.findOne({_id:req.params.id}).lean().then((categoria)=>{
        res.render('admin/editCategorias', {categoria: categoria})

    }).catch((e)=>{
        req.flash("error_msg", "Essa categoria não existe: "+e)
        res.redirect('/admin/categorias')
    })
})

router.post('/categorias/edit', eAdmin , (req, res)=>{

    const error = []
    if(!req.body.nome || typeof req.body.nome === undefined ){
        error.push({texto: "Nome inválido!"})
    }
    if(req.body.nome < 2 ){
        error.push({texto: "Nome da categoria muito pequeno"})
    }
    if(!req.body.slug || typeof req.body.slug === undefined ){
        error.push({texto: "Slug inválido!"})
    }
    
    if(error.length > 0){
        res.render('admin/addCategorias',{error: error})
    }else{
        Categoria.findOne({_id: req.body.id}).then((categoria)=>{
            categoria.nome = req.body.nome
            categoria.slug = req.body.slug
    
            categoria.save().then(()=>{
                req.flash("success_msg", "Categoria editada com sucesso!")
                res.redirect('/admin/categorias')
            }).catch((e)=>{
                req.flash("error_msg", "Houve um erro ao interno ao salvar a editção da categoria: "+e)
                res.redirect('/admin/categorias')
            })
        }).catch((e)=>{
            req.flash("error_msg", "Houve um erro ao editar categoria: "+e)
            res.redirect('/admin/categorias')
        })

    }
})

// deletar

router.post('/categorias/deletar/:id', eAdmin ,(req, res)=>{
    Categoria.findOneAndDelete({_id: req.params.id}).then(()=>{
        req.flash("success_msg", "Categoria deletada com sucesso!")
        res.redirect('/admin/categorias')
    }).catch((e)=>{
        req.flash("error_msg", "Houve um erro ao deletar categoria"+ e)
        res.redirect('/admin/categorias')

    })
})

// postagem
router.get('/postagens', eAdmin , (req, res)=>{
    res.render("admin/postagens")
})

// add postagem
router.get('/postagens/add', eAdmin , (req, res)=>{
    Categoria.find().lean().then((categorias)=>{
        res.render("admin/addPostagem", {categorias: categorias})
        // req.flash("success_msg", "Categoria carregada com sucesso!")

    }).catch((e)=>{
        req.flash("error_msg", "Houve um erro ao carregar categoria"+ e)
        res.redirect('/admin/categorias')

    })

})

// add categoria no banco

router.post("/postagens/nova",  eAdmin , (req, res)=>{
    const erros = []
    if(!req.body.titulo || typeof req.body.nome === undefined ){
        erros.push({texto: "Título inválido!"})
    }
    if(req.body.nome < 2 ){
        erros.push({texto: "Nome da categoria muito pequeno"})
    }
    if(!req.body.slug || typeof req.body.slug === undefined ){
        erros.push({texto: "Slug inválido!"})
    }
    if(!req.body.descricao || typeof req.body.descricao === undefined ){
        erros.push({texto: "Descrição inválida!"})
    }
    if(!req.body.conteudo || typeof req.body.conteudo === undefined ){
        erros.push({texto: "Conteúdo inválido!"})
    }

    if(req.body.categoria === '0'){
        erros.push({texto:"Categoria inválida, registre uma nova categoria"})
    }
    if(erros.length > 0){
        res.render('admin/addPostagem', {erros: erros})
    }else{
        const novaPostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            slug: req.body.slug
        }

        new Postagem(novaPostagem).save().then(()=>{
            req.flash('success_msg', 'Postagem criada com sucesso!')
            res.redirect('/admin/postagens')
        }).catch((e)=>{
            req.flash('error_msg', 'Houve um erro ao criar a postagem'+ e)
            res.redirect('/admin/postagens')
        })
    }
})




module.exports = router