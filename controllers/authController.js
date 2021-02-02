const mongoose = require('mongoose');
const passport = require('passport');
const Vancante = require('../models/vacantes');
const Usuarios = require('../models/usuarios');
const crypto = require('crypto');
const enviarEmail = require('../handlers/email');

exports.autenticarUsuario = passport.authenticate('local', {
	successRedirect: '/administracion',
	failureRedirect: '/iniciar-sesion',
	failureFlash: true,
	badRequestMessage: 'Ambos campos son obligatorios',
});

// Revisar si el usuario esta autenticado
exports.verificarUsuario = (req, res, next) => {

	//Revisar el usuario
	if (req.isAuthenticated()) return next();

	res.redirect('/iniciar-sesion');
}

exports.mostrarPanel = async (req, res) => {
	
	// Consultar el usuario autentiucado
	const vacantes = await Vancante.find({ autor: req.user._id });

	res.render('administracion', {
		nombrePagina: 'Panel de Administracion',
		tagline: 'Crea y Administra tus vacantes desde aqui',
		cerrarSesion: true,
		nombre: req.user.nombre,
		imagen: req.user.imagen,
		vacantes,
	});
}

exports.cerrarSesion = (req, res) => {

	req.logout();
	req.flash('correcto', 'Cerraste Sesion Correctamente');
	
	return res.redirect('/iniciar-sesion');
}

// Formulario para Reiniciar el password

exports.formRestablecerPassword = (req, res) => {

	res.render('restablecer-password', {
		nombrePagina: 'Restablece tu password',
		tagline: 'Si ya tienes una cuenta pero olvidasre tu password, coloca tu email',
	});
}

exports.enviarToken = async (req, res) => {
	
	const usuario = await Usuarios.findOne({ email: req.body.email });
	
	if (!usuario) {

		req.flash('error', 'No existe esa cuenta');
		return res.redirect('/iniciar-sesion');
	}

	// El usuario existe, generar token
	usuario.token = crypto.randomBytes(20).toString('hex');
	usuario.espira = Date.now() + 3600000;
	console.log(usuario)
	// Guardar el usuario
	await usuario.save();
	const resetUrl = `http://${req.headers.host}/restablecer-password/${usuario.token}`;

	// Enviar notificacion por email
	await enviarEmail.enviar({
		usuario,
		subject: 'Password Reset',
		resetUrl,
		archivo: 'reset',
	});

	req.flash('correcto', 'Revisa tu email para las indicaciones');
	res.redirect('/iniciar-sesion');
}

// valida si el token es valido y el usuario existe, muestra la vista
exports.restablecerPassword = async (req, res) => {
	
	const usuario = await Usuarios.findOne({ 
		token: req.params.token,
	});

	console.log(usuario);
	
	if (!usuario) {

		req.flash('error', 'El formulario ya no es valido intenta denuevo');
		return res.redirect('/restablecer-password');
	}

	res.render('nuevo-password', {
		nombrePagina: 'Nuevo Password',
	});
}

exports.guardarPassword = async (req, res) => {
	
	const usuario = await Usuarios.findOne({ 
		token: req.params.token,
	});
	
	if (!usuario) {

		req.flash('error', 'El formulario ya no es valido intenta denuevo');
		return res.redirect('/restablecer-password');
	}

	usuario.password = req.body.password;
	usuario.token = undefined;
	usuario.expira = undefined;

	await usuario.save();

	req.flash('correcto', 'Password Modificado Correctamente');
	res.redirect('/iniciar-sesion');
}