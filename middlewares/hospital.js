var Hospital = require('../models/hospital');

// ================================================
// Verifica que el hospital exista en BBDD
// ================================================
exports.verificaHospital = function(req, res, next) {

    var id = req.body.hospital;

    Hospital.findById(id, (err, hospital) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: `El hospital con el id ${id} no existe`,
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }

        req.hospital = hospital;

        next();

    });
};