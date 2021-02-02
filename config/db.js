const mongoose = require('mongoose');
require('dotenv').config({ path: 'variables.env' });

mongoose.connect(process.env.DATABASE, { useNewUrlParser: true, useUnifiedTopology: true }, (err, res) => {
	
	if (err) console.log(err)
	else console.log('base de datos online')
});

// Importar los modelos
require('../models/vacantes');
require('../models/usuarios');