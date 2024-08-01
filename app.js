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



//2 - configurações
    // sessão
    app.use(session({
        secret: 'cursodenode',
        resave: true,
        saveUninitialized: true
    }))

    //flash
    app.use(flash())

    //middleware
    app.use((req,res, next)=>{
        //variavel global da menssagem 
        res.locals.success_msg = req.flash('success_msg')
        res.locals.error_msg = req.flash('error_msg')
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
        Postagem.find().lean().sort({data: 'desc'}).limit(3).then((postagens)=>{
            res.render('index', {postagens:postagens})
            
        }).catch((e)=>{
            req.flash("error_msg", "Houve um erro ao listar as postagens"+ e)
            res.redirect('/404')
        })
    })
    app.get('/404', (req, res)=>{
        res.send("Error 404!")
    })
    app.use('/admin', admin)

//4 - outros
const Port = 8081
app.listen(Port, ()=>{
    console.log('servidor rodando')
})