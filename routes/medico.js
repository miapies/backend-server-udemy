var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');
var mdHospital = require('../middlewares/hospital');

var app = express();
var Medico = require('../models/medico');

// ================================================
// Obtener todos los médicos
// ================================================
app.get('/', (req, res) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);
    var limit;
    if (req.query.limit) {
        limit = Number(req.query.limit);
    }

    Medico.find({}, 'nombre usuario hospital img')
        .skip(desde)
        .limit(limit)
        .populate('usuario', 'nombre email')
        .populate('hospital', 'nombre usuario')
        .exec(
            (err, medicos) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando médicos',
                        errors: err
                    });
                }

                Medico.countDocuments({}, (err, cuenta) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error contando médicos',
                            errors: err
                        });
                    }

                    res.status(200).json({
                        ok: true,
                        medicos,
                        total: cuenta
                    });

                });
            });

});

// ================================================
// Obtener médico
// ================================================
app.get('/:id', (req, res) => {

    var id = req.params.id;

    Medico.findById(id)
        .populate('usuario', 'nombre email img')
        .populate('hospital')
        .exec(
            (err, medico) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al buscar médico',
                        errors: err
                    });
                }

                if (!medico) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: `El médico con el id ${id} no existe`,
                        errors: { message: 'No existe un médico con ese ID' }
                    });
                }

                res.status(200).json({
                    ok: true,
                    medico
                });
            });

});

// ================================================
// Actualizar médico
// ================================================
app.put('/:id', [mdAutenticacion.verificaToken, mdHospital.verificaHospital], (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar médico',
                errors: err
            });
        }

        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: `El médico con el id ${id} no existe`,
                errors: { message: 'No existe un médico con ese ID' }
            });
        }

        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = req.hospital._id;

        medico.save((err, medicoGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar médico',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });

        });
    });

});

// ================================================
// Crear un nuevo médico
// ================================================
app.post('/', [mdAutenticacion.verificaToken, mdHospital.verificaHospital], (req, res) => {

    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id,
        hospital: req.hospital._id
    });

    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear médico',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            medico: medicoGuardado
        });

    });

});

// ================================================
// Borrar un médico por el id
// ================================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar médico',
                errors: err
            });
        }

        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un médico con ese id',
                errors: { message: 'No existe un médico con ese id' }
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });

    });
});

module.exports = app;