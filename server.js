const mongoose = require('mongoose');
require('./config/db');

const express = require('express');
const router = require('./router/');
const path = require('path');
const hbs = require('hbs');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const createError = require('http-errors');
const expressValidator = require('express-validator');
const passport = require('./config/passport');

require('dotenv').config({ path: 'variables.env' });

const app = express();

//Habilitar body-parser
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded({ extend: true }) );

// validacion de campos
app.use( expressValidator() );

//Habilitar handlebars como viuw
require('./hbs/helper');
hbs.registerPartials(__dirname + '/views/partials');
app.set('view engine', 'hbs');

//static files
app.use( express.static( path.resolve(__dirname, 'public') ) );

app.use( cookieParser() );

app.use( session({
	secret: process.env.SECRETO,
	key: process.env.KEY,
	resave: false,
	saveUninitialized: false,
	store: new MongoStore({ mongooseConnection: mongoose.connection })
}) );

// inicializar passport
app.use( passport.initialize() );
app.use( passport.session() );

// Alertas y flash messages
app.use( flash() );

// crear nuestro middleware
app.use((req, res, next) => {
	
	res.locals.mensajes = req.flash();
	next();
})

app.use('/', router() );

// 404 pagina no existe
app.use((req, res, next) => next( createError(404, 'No encontrado') ));

// Administracion de los errores
app.use((error, req, res, next) => {

	res.locals.mensaje = error.message;
	const status = error.status || 500;
	res.locals.status = status;
	res.status(status);
	res.render('error');
});

app.listen(process.env.PUERTO, () => console.log('corriendo en el puerto ' + process.env.PUERTO));