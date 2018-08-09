var express = require('express');

var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

/// ================================================
// Búsqueda por colección
// ================================================
app.get('/coleccion/:tabla/:busqueda', (req, res) => {

    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i')

    var promesa;

    switch (tabla) {

        case 'hospitales':
            promesa = buscarHospitales(regex);
            break;
        case 'medicos':
            promesa = buscarMedicos(regex);
            break;
        case 'usuarios':
            promesa = buscarUsuarios(regex);
            break;
        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de búsqueda son: usuarios, medicos y hospitales',
                errors: { message: 'Tipo de colección no válido' }
            });

    }

    promesa.then(data => {
        res.status(200).json({
            ok: true,
            [tabla]: data
        });
    }).catch(err => {
        res.status(500).json({
            ok: false,
            mensaje: 'Error en la búsqueda por colección',
            errors: err
        });
    });
});

/// ================================================
// Búsqueda general
// ================================================
app.get('/todo/:busqueda', (req, res) => {

    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i')

    Promise.all([
            buscarHospitales(regex),
            buscarMedicos(regex),
            buscarUsuarios(regex)
        ])
        .then(respuestas => {
            res.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });
        })
        .catch(err => {
            res.status(500).json({
                ok: false,
                mensaje: 'Error en la búsqueda',
                errors: err
            });
        });

});

function buscarHospitales(regex) {

    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regex }, 'nombre img usuario')
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {
                if (err) {
                    reject('Error al cargar hospitales', err);
                } else {
                    resolve(hospitales);
                }
            });
    });
}

function buscarMedicos(regex) {

    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regex }, 'nombre img usuario hospital')
            .populate('usuario', 'nombre email')
            .populate('hospital', 'nombre usuario')
            .exec((err, medicos) => {
                if (err) {
                    reject('Error al cargar médicos', err);
                } else {
                    resolve(medicos);
                }
            });
    });
}

function buscarUsuarios(regex) {

    return new Promise((resolve, reject) => {
        // Usuario.find({ $or: [{ nombre: regex }, { email: regex }] },
        Usuario.find({}, 'nombre email img role google')
            .or([{ nombre: regex }, { email: regex }])
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error al cargar usuarios', err);
                } else {
                    resolve(usuarios);
                }
            });
    });
}

module.exports = app;