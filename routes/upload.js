var express = require('express');

var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');
var Imagen = require('../models/imagen');

// default options
app.use(fileUpload());

app.put('/:tipo/:id', (req, res) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // Tipos de colección
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de colección no es válida',
            errors: { message: 'Tipo de colección no es válida' }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No seleccionó ningún archivo',
            errors: { message: 'Debe seleccionar una imagen' }
        });
    }

    // Obtener nombre del archivo
    var archivo = req.files.imagen;
    var aNombre = archivo.name.split('.');
    var extension = aNombre[aNombre.length - 1];

    // Sólo aceptamos las siguientes extensiones
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];
    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extensión no válida',
            errors: {
                message: 'Las extensiones permitidas son ' +
                    extensionesValidas.join(', ')
            }
        });
    }

    // Nombre de archivo personalizado
    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;

    // Mover el archivo del temporal a un path
    // var path = `./uploads/${tipo}/${nombreArchivo}`;

    // archivo.mv(path, err => {
    //     if (err) {
    //         return res.status(500).json({
    //             ok: false,
    //             mensaje: 'Error al mover archivo',
    //             errors: err
    //         });
    //     }

    //     subirPorTipo(tipo, id, nombreArchivo, res);
    // });

    // Guardamos las imágenes en la BBDD Mongo en vez de en un directorio
    subirPorTipo(tipo, id, nombreArchivo, archivo, res);
});

function subirPorTipo(tipo, id, nombreArchivo, archivo, res) {
    if (tipo === 'usuarios') {
        // return validarYGuardar(Usuario, id, nombreArchivo, res, 'usuarios', 'usuario');
        return guardarEnBBDD(Usuario, id, nombreArchivo, archivo, res, 'usuario');
    }
    if (tipo === 'medicos') {
        // return validarYGuardar(Medico, id, nombreArchivo, res, 'medicos', 'medico');
        return guardarEnBBDD(Medico, id, nombreArchivo, archivo, res, 'medico');
    }
    if (tipo === 'hospitales') {
        // return validarYGuardar(Hospital, id, nombreArchivo, res, 'hospitales', 'hospital');
        return guardarEnBBDD(Hospital, id, nombreArchivo, archivo, res, 'hospital');
    }
}

function validarYGuardar(model, id, nombreArchivo, res, nombreColeccion, tipoModel) {

    var pathNuevo = `./uploads/${nombreColeccion}/${nombreArchivo}`;

    model.findById(id, (err, data) => {

        if (err) {
            // Si existe elimina la imagen subida
            if (fs.existsSync(pathNuevo)) {
                fs.unlinkSync(pathNuevo);
            }

            return res.status(500).json({
                ok: false,
                mensaje: `Error al buscar ${tipoModel}`,
                errors: err
            });
        }

        if (!data) {
            // Si existe elimina la imagen subida
            if (fs.existsSync(pathNuevo)) {
                fs.unlinkSync(pathNuevo);
            }

            return res.status(400).json({
                ok: false,
                mensaje: `El ${tipoModel} con el id ${id} no existe`,
                errors: { message: `No existe un ${tipoModel} con ese ID` }
            });
        }

        if (data.img && data.img.length > 0) {
            var pathViejo = `./uploads/${nombreColeccion}/${data.img}`;
            // Si existe elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }
        }

        data.img = nombreArchivo;

        data.save((err, dataActualizada) => {

            if (err) {
                // Si existe elimina la imagen subida
                if (fs.existsSync(pathNuevo)) {
                    fs.unlinkSync(pathNuevo);
                }

                return res.status(500).json({
                    ok: false,
                    mensaje: `Error al actualizar imagen de ${tipoModel}`,
                    errors: err
                });
            }

            if (dataActualizada.password) {
                dataActualizada.password = ':)';
            }

            return res.status(200).json({
                ok: true,
                mensaje: `Imagen de ${tipoModel} actualizada'`,
                [tipoModel]: dataActualizada
            });

        });
    });

}

function guardarEnBBDD(model, id, nombreArchivo, archivo, res, tipoModel) {

    model.findById(id, (err, data) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: `Error al buscar ${tipoModel}`,
                errors: err
            });
        }

        if (!data) {
            return res.status(400).json({
                ok: false,
                mensaje: `El ${tipoModel} con el id ${id} no existe`,
                errors: { message: `No existe un ${tipoModel} con ese ID` }
            });
        }

        if (data.img && data.img.length > 0 && !data.img.startsWith('https')) {
            // Si existe se actualiza la imagen anterior
            var photo = new Imagen({
                _id: data.img,
                filename: nombreArchivo,
                file: archivo.data
            });

            Imagen.findByIdAndUpdate(data.img, photo, (err) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error al actualizar imagen',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    mensaje: `Imagen de ${tipoModel} actualizada'`,
                    [tipoModel]: data
                });

            });
        } else {
            // Si no existe se crea un nuevo registro y
            // se actualiza el model
            var nuevaFoto = new Imagen({
                filename: nombreArchivo,
                file: archivo.data
            });

            nuevaFoto.save((err, imagenGuardada) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error al crear imagen',
                        errors: err
                    });
                }

                data.img = imagenGuardada._id;

                data.save((err, dataActualizada) => {

                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: `Error al actualizar imagen de ${tipoModel}`,
                            errors: err
                        });
                    }

                    if (dataActualizada.password) {
                        dataActualizada.password = ':)';
                    }

                    return res.status(200).json({
                        ok: true,
                        mensaje: `Imagen de ${tipoModel} actualizada'`,
                        [tipoModel]: dataActualizada
                    });

                });

            });
        }

    });

}

module.exports = app;