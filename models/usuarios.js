const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const bcrypt = require('bcrypt');

const Schema = mongoose.Schema;

const usuariosSchema = new Schema({
	email: {
		type: String,
		unique: true,
		lowercase: true,
		trim: true,
	},
	nombre: {
		type: String,
		required: [true, 'El nombre es necesaria'],
		trim: true,
	},
	password: {
		type: String,
		required: true,
		trim: true,
	},
	token: String,
	espira: Date,
	imagen: String,
});

// Metodo para hashear los password
usuariosSchema.pre('save', async function(next) {
	
	if (!this.isModified('password')) return next();

	const hash = await bcrypt.hash(this.password, 12);
	this.password = hash;
	next();
});

// Envia alerta cuando un usuario ya esta registrado
usuariosSchema.post('save', function(error, doc, next) {
	
	if (error.name === 'MongoError' && error.code === 11000) next('Ese correo ya esta registrado');
	else next(error);
});

// Autenticar usuario
usuariosSchema.methods = {
	compararPassword: function(password) {
		return bcrypt.compareSync(password, this.password);
	}
}

module.exports = mongoose.model( 'Usuarios', usuariosSchema );