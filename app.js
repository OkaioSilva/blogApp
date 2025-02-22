// 1 - carregando módulos
    const express = require('express')
    const app = express()
    const { engine } = require ('express-handlebars');
    const admin = require('./routes/admin')
    const path = require("path")
    const mongoose = require('mongoose')
    const session = require('express-session')
    const flash = require('connect-flash')
    
    require('./models/Postagem')
    const Postagem = mongoose.model('postagens')
    require('./models/Categoria')
    const Categoria = mongoose.model('categorias')
    const usuarios = require('./routes/usuario');
    const passport = require('passport');
    require("./config/auth")(passport)



//2 - configurações
    // sessão
    app.use(session({
        secret: 'cursodenode',
        resave: true,
        saveUninitialized: true
    }))



    app.use(passport.initialize())
    app.use(passport.session())

    //flash
    app.use(flash())

    //middleware
    app.use((req,res, next)=>{
        //variavel global da menssagem 
        res.locals.success_msg = req.flash('success_msg')
        res.locals.error_msg = req.flash('error_msg')
        res.locals.error = req.flash('error')
        res.locals.user = req.user || null

        next()
    })


    //- Boyd parser express
    app.use(express.urlencoded({extended:true}))
    app.use(express.json())
    
    //- Template engine (handlebars)
    app.engine('handlebars', engine({defaultLayout: 'main'}))
    app.set('view engine', 'handlebars')
    
    //mongoose
    mongoose.Promise = global.Promise;
    mongoose.connect("mongodb://localhost/blogApp").then(()=>{
        console.log('conectado ao mongo')
    }).catch((e)=>{
        console.log('Erro ao se conectar ao banco: ', e)
    })
    
    // Public
        app.use(express.static(path.join(__dirname, "public")))

//3 - rotas
    app.get('/', (req, res)=>{
        Postagem.find().lean().populate("categoria").sort({data: 'desc'}).limit(10).then((postagens)=>{
            res.render('index', {postagens:postagens})
            
        }).catch((e)=>{
            req.flash("error_msg", "Houve um erro ao listar as postagens"+ e)
            res.redirect('/404')
        })
    })

    app.get('/postagem/:slug', (req,res) => {
        
        Postagem.findOne({slug: req.params.slug}).lean().then(postagem => {
                if(postagem){
                    res.render('postagem/index', {postagem: postagem})
                }else{
                    req.flash("error_msg", "Essa postagem nao existe")
                    res.redirect("/")
                }
            })
            .catch(err => {
                req.flash("error_msg", "Houve um erro interno")
                res.redirect("/")
            })
    })

    app.get('/categorias', (req, res)=>{
        Categoria.find().lean().then((categorias)=>{
            res.render("categorias/index", {categorias: categorias})
        }).catch((e)=>{
            req.flash("error_msg", "Houve um erro ao listas as categorias")
            res.redirect('/')
        })
    })
    app.get("/categorias/:slug", (req, res)=>{
        Categoria.findOne({slug: req.params.slug}).lean().then((categoria)=>{
            if(categoria){
                Postagem.find({categoria: categoria._id}).lean().then((postagens)=>{
                    res.render('categorias/postagens', {postagens:postagens, categoria: categoria})
                }).catch((e)=>{
                    req.flash("error_msg", "Houve um erro ao listas os posts")
                    res.redirect('/')
                })
            }else{
                req.flash("error_msg", "Essa categoria não existe")
                res.redirect('/')
            }
        }).catch((e)=>{
            req.flash("error_msg", "Houve um erro interno ao carregar a página dessa categoria")
            res.redirect('/')
        })
    })

    app.get('/404', (req, res)=>{
        res.send("Error 404!")
    })
    
    app.use('/admin', admin)

    app.use('/usuarios', usuarios)

//4 - outros
const Port = 8081
app.listen(Port, ()=>{
    console.log('servidor rodando')
})