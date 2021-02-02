const Vacante = require('../models/vacantes');
const multer = require('multer');
const shortid = require('shortid');

exports.formularioNuevaVacante = (req, res) => {
	
	res.render('nueva-vacante', {
		nombrePagina: 'Nueva vacante',
		tagline: 'LLena el formulario y publica tu vacante',
		barra: true,
		cerrarSesion: true,
		nombre: req.user.nombre,
		imagen: req.user.imagen,
	})
}

exports.agregarVacante = async (req, res) => {
	
	const vacante = new Vacante(req.body);

	// usuario autor de la vacante
	vacante.autor = req.user._id;
	
	//crear arreglo de abilidades
	vacante.skills = req.body.skills.split(',');
		
	// almacenarlo en la base de datos
	const nuevaVacante = await vacante.save();

	// redireccionar
	res.redirect(`/vacantes/${nuevaVacante.url}`);
}

exports.mostrarVacante = async (req, res, next) => {

	const vacante = await Vacante.findOne({ url: req.params.url }).populate('autor');

	// si no hay resultados
	if (!vacante) return next();

	res.render('vacante', {
		vacante,
		nombrePagina: vacante.titulo,
	});
}

exports.formEditarVacante = async (req, res, next) => {

	const vacante = await Vacante.findOne({ url: req.params.url });

	// si no hay resultados
	if (!vacante) return next();

	res.render('editar-vacante', {
		vacante,
		nombrePagina: `Editar - ${vacante.titulo}`,
		cerrarSesion: true,
		nombre: req.user.nombre,
		imagen: req.user.imagen,
	});
}

exports.editarVacante = async (req, res) => {
	
	const vacanteActualizada = req.body;
	vacanteActualizada.skills = req.body.skills.split(',');

	const vacante = await Vacante.findOneAndUpdate({ url: req.params.url }, vacanteActualizada, {
		new: true,
		runValidators: true,
	});

	res.redirect(`/vacantes/${vacante.url}`);
}

// Validar y Sanititizar los campos de las nuevas vacantes

exports.validarVacante = async (req, res, next) => {

	// sanatizar los campos
	
	req.sanitizeBody('titulo').escape();
	req.sanitizeBody('empresa').escape();
	req.sanitizeBody('ubicacion').escape();
	req.sanitizeBody('salario').escape();
	req.sanitizeBody('contrato').escape();
	req.sanitizeBody('skills').escape();

	// validar
	req.checkBody('titulo', 'Agrega un titulo a la vacante').notEmpty();
	req.checkBody('empresa', 'Agrega un empresa a la vacante').notEmpty();
	req.checkBody('ubicacion', 'Agrega la ubicacion a la vacante').notEmpty();
	req.checkBody('contrato', 'Agrega un contrato a la vacante').notEmpty();
	req.checkBody('skills', 'Agrega al menos una habilidad').notEmpty();

	const errores = req.validationErrors();

	if (errores) {

		req.flash('error', errores.map(error => error.msg));

		res.render('nueva-vacante', {
			nombrePagina: 'Nueva Vacante',
			tagLine: 'LLena el formulario y publica tu vacante',
			cerrarSesion: true,
			nombre: req.user.nombre,
			mensajes: req.flash(),
		});
	}

	next();
}

exports.eliminarVacante = async (req, res) => {

	const { id } = req.params;
	
	const vacante = await Vacante.findById(id);
	

	if (verificarAutor(vacante, req.user)) {
		
		vacante.remove();
		res.status(200).send('Vacante eliminada correctamente');
	
	} else {

		res.status(403).send('Error');
	}
}

const verificarAutor = (vacante = {}, usuario = {}) => {

	if (!vacante.autor.equals(usuario._id)) {
		
		return false;
	}

	return true;
}

// Subir archivos en PDF

exports.subirCV = (req, res, next) => {

	upload(req, res, function(error) {
		
		if (error) {

			if (error instanceof multer.MulterError) {
				
				if (error.code === 'LIMIT_FILE_SIZE') {
					req.flash('error', 'El archivo es muy grande: Maximo 100kb');
				
				} else req.flash('error', error.message);

			} else req.flash('error', error.message);

			res.redirect('back');
			return;
		
		} else return next();
	});	
}

// Opciones de multer
const configuracionMulter = {
	limits: { fileSize: 100000 },
	storage: fileStorage = multer.diskStorage({
		destination: (req, file, cb) => {

			cb(null, __dirname + '../../public/uploads/cv');
		},
		filename: (req, file, cb) => {
			const extension = file.mimetype.split('/')[1];
			cb(null, `${shortid.generate()}.${extension}`);
		}
	}),
	fileFilter(req, file, cb) {
		if (file.mimetype === 'application/pdf') cb(null, true);
		else cb(new Error('formato no valido'), false);
	},
}

const upload = multer(configuracionMulter).single('cv');

// Almacenar los candidatos en la BD
exports.contactar = async (req, res, next) => {

	const vacante = await Vacante.findOne({ url: req.params.url });
	
	if (!vacante) return next();

	const nuevoCandidato = {
		nombre: req.body.nombre,
		email: req.body.email,
		cv: req.file.filename,
	}
	
	// Almacenar vacante
	vacante.candidatos.push(nuevoCandidato);
	await vacante.save();

	req.flash('correcto', 'Se envio tu Curriculum Correctamente');
	res.redirect('/');
}

exports.mostrarCandidatos = async (req, res, next) => {
	
	const vacante = await Vacante.findById( req.params.id );

	if (vacante.autor != req.user._id.toString()) return next();

	if (!vacante) return next();
	
	res.render('candidatos', {
		nombrePagina: `Candidatos Vacante - ${vacante.titulo}`,
		cerrarSesion: true,
		nombre: req.user.nombre,
		imagen: req.user.imagen,
		candidatos: vacante.candidatos,
	});
}

// Buscador de vacantes
exports.buscarVacantes = async (req, res) => {

	const vacantes = await Vacante.find({
		$text: {
			$search: req.body.q
		}
	});

	// mostrar las vacantes
	res.render('layaut', {
		nombrePagina: `Resultados para la busqueda: ${req.body.q}`,
		barra: true,
		vacantes,
	});
}