var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var imagenSchema = new Schema({
    filename: { type: String, required: [true, 'El nombre del archivo es necesario'] },
    file: { type: Buffer, required: true }
}, { collection: 'imagenes' });

module.exports = mongoose.model('Imagen', imagenSchema);