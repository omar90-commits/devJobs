const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slug');
const shortid = require('shortid');

const Schema = mongoose.Schema;

const vacantesSchema = new Schema({
	titulo: {
		type: String,
		required: [true, 'El titulo es necesaria'],
		trim: true,
	},
	empresa: {
		type: String,
		trim: true,
	},
	ubicacion: {
		type: String,
		trim: true,
		required: [true, 'La ubicacion es necesaria']
	},
	salario: {
		type: String,
		trim: true,
		default: 0,
	},
	contrato: {
		type: String,
		trim: true,
	},
	descripcion: {
		type: String,
		trim: true,
	},
	url: {
		type: String,
		lowercase: true,
	},
	skills:[String],
	candidatos: [{
		nombre: String,
		email: String,
		cv: String,
	}],
	autor: {
		type: mongoose.Schema.ObjectId,
		ref: 'Usuarios',
		require: [true, 'El autor es obligatorio'],
	}
});

vacantesSchema.pre('save', function(next) {

	const url = slug(this.titulo);
	this.url = `${url}-${shortid.generate()}`;
	
	next();
});

// Crear un indice
vacantesSchema.index({ titulo: 'text' });

module.exports = mongoose.model( 'vacante', vacantesSchema );