const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const vacantesController = require('../controllers/vacantesController');
const usuariosController = require('../controllers/usuariosController');
const authController = require('../controllers/authController');

module.exports = () => {

	router.get('/', homeController.mostrarTrabajo);

	//Crear vacantes
	router.get('/vacantes/nueva', 
		authController.verificarUsuario,
		vacantesController.formularioNuevaVacante);
	router.post('/vacantes/nueva', 
		authController.verificarUsuario,
		vacantesController.validarVacante,
		vacantesController.agregarVacante,
	);

	// Mostrar Vacante
	router.get('/vacantes/:url', vacantesController.mostrarVacante);

	// Editar vacante
	router.get('/vacantes/editar/:url',
		authController.verificarUsuario, 
		vacantesController.formEditarVacante
	);
	router.post('/vacantes/editar/:url', 
		authController.verificarUsuario,
		vacantesController.validarVacante,
		vacantesController.editarVacante
	);

	// Eliminar vacante
	router.delete('/vacantes/eliminar/:id', vacantesController.eliminarVacante);

	// Crear cuentas
	router.get('/crear-cuenta', usuariosController.formCrearCuenta);
	router.post('/crear-cuenta', 
		usuariosController.validarRegistro,
		usuariosController.crearUsuario
	);

	// Autenticar usuarios
	router.get('/iniciar-sesion', usuariosController.formIniciarSesion);
	router.post('/iniciar-sesion', authController.autenticarUsuario);

	//Cerrar sesion
	router.get('/cerrar-sesion', 
		authController.verificarUsuario,
		authController.cerrarSesion,
	);

	// Resetear password
	router.get('/restablecer-password', authController.formRestablecerPassword);
	router.post('/restablecer-password', authController.enviarToken);

	// Resetear Password
	router.get('/restablecer-password/:token', authController.restablecerPassword);
	router.post('/restablecer-password/:token', authController.guardarPassword);

	// Panel de administracion
	router.get('/administracion', 
		authController.verificarUsuario,
		authController.mostrarPanel
	);

	// Editar perfil
	router.get('/editar-perfil', 
		authController.verificarUsuario,
		usuariosController.formEditarPerfil,
	);
	router.post('/editar-perfil', 
		authController.verificarUsuario,
		// usuariosController.validarPerfil,
		usuariosController.subirImagen,
		usuariosController.editarPerfil
	);

	// Recibir Mensajes de Candidatos
	router.post('/vacantes/:url',
		vacantesController.subirCV,
		vacantesController.contactar,
	);

	// Muestra los candidatos por vacante
	router.get('/candidatos/:id', 
		authController.verificarUsuario,
		vacantesController.mostrarCandidatos,
	);

	// Buscador de vacantes
	router.post('/buscador', vacantesController.buscarVacantes);

	return router;
}