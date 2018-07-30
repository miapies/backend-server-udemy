var express = require('express');

var app = express();

// app.get('/', (req, res) => res.send('Hello World!'));
// app.get('/', (req, res, next));
app.get('/', (req, res) => {
    res.status(200).json({
        ok: true,
        mensaje: 'Petición realizada correctamente'
    });
});

module.exports = app;