const Vancante = require('../models/vacantes');

exports.mostrarTrabajo = async (req, res, next) => {

	const vacantes = await Vancante.find();

	if (!vacantes) return next();

	res.render('layaut', {
		nombrePagina: 'devJobs',
		tagLine: 'Encuentra y Publica trabajos para desarrolladores web',
		vacantes,
		barra: true,
		boton: true,
	})
}