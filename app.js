// Requires - Importación de librerías de terceros o personalizadas que necesitamos
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

// Obtenemos el puerto del enviroment para otros servidores
var port = process.env.PORT || 3000;

// Inicializar variables
var app = express();

// Forma simple de configurar el CORS en ExpressJS 
// que no requiere instalación de ningún paquete
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
    next();
});


// Body Parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// Importar rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');
var hospitalRoutes = require('./routes/hospital');
var medicoRoutes = require('./routes/medico');
var busquedaRoutes = require('./routes/busqueda');
var uploadRoutes = require('./routes/upload');
var imagenesRoutes = require('./routes/imagenes');

// Conexión a la base de datos
// mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', { useNewUrlParser: true },
mongoose.connection.openUri('mongodb://miapies78:sm180278@ds219832.mlab.com:19832/heroku_84mxphwz', { useNewUrlParser: true },
    (err, res) => {
        if (err) throw err;
        console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online');
    });

// Server index config - Una forma de publicar     
// un directorio estático para que sea accesible desde la url
// var serveIndex = require('serve-index');
// app.use(express.static(__dirname + '/'))
// app.use('/uploads', serveIndex(__dirname + '/uploads'));

// Rutas
app.use('/usuario', usuarioRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/medico', medicoRoutes);
app.use('/login', loginRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/upload', uploadRoutes);
app.use('/img', imagenesRoutes);

app.use('/', appRoutes);

// Escuchar peticiones
app.listen(port, () => {
    console.log('Express server puerto %s: \x1b[32m%s\x1b[0m', port, 'online');
});