var express = require('express');

var Imagen = require('../models/imagen');

var app = express();

const path = require('path');
const fs = require('fs');

app.get('/:tipo/:img', (req, res) => {

    var tipo = req.params.tipo;
    var img = req.params.img;
    var pathNoImage = path.resolve(__dirname, `../assets/no-img.jpg`);

    Imagen.findById(img, (err, data) => {

        if (err) {
            return res.sendFile(pathNoImage);
        }

        if (!data) {
            return res.sendFile(pathNoImage);
        }

        var extension = data.filename.split('.')[1];
        res.contentType(`image/${extension}`);
        res.end(data.file, 'binary');
    });

    // var pathImagen = path.resolve(__dirname, `../uploads/${tipo}/${img}`);
    // if (fs.existsSync(pathImagen)) {
    //     res.sendFile(pathImagen);
    // } else {
    //     var pathNoImage = path.resolve(__dirname, `../assets/no-img.jpg`);
    //     res.sendFile(pathNoImage);
    // }

});

module.exports = app;