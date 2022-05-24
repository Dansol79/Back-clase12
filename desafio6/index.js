const express = require('express');
const Contenedor = require('./class/contenedor');
const handlebars = require('express-handlebars');
const {Server: HttpServer} = require('http');
const {Server: IOServer} = require('socket.io');

const app = express();
const httpServer = new HttpServer(app);
const ioServer = new IOServer(httpServer);

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('./views/layouts'));

const Producto = new Contenedor(__dirname + '/data/productos.json');
const menssages = [];

app.engine(
    'hbs',
    handlebars.engine({
        extname: '.hbs',
        partialsDir: __dirname + '/views/partials',
    })
);

app.set('views', './views');
app.set('view engine', 'hbs');

app.get('/', (req, res) => {
    let content = Producto.content;
  let boolean = content.length !== 0;
  return res.render('layouts/main.hbs', {
    list: content,
    showList: boolean,
  });
});

app.post('/', (req, res) => {
    Producto.save(req.body);
    let content = Producto.content;
    let boolean = content.length !== 0;
    return res.render("layouts/main.hbs", { list: content, showList: boolean });
  
})


httpServer.listen(process.env.PORT || 8080, () => {
    console.log('Servidor corriendo en el puerto 8080');
});

/* CHAT */
ioServer.on('connection', (socket) => {
    socket.emit('messages', menssages);
    socket.on('send', (data) => {
        menssages.push(data);
        ioServer.emit('messages', menssages);
    });
});
