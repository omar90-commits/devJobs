const hbs = require('hbs');

hbs.registerHelper('seleccionarSkills', (seleccionadas = [], opciones) => {
	
	const skills = ['HTML5', 'CSS3', 'CSSGrid', 'Flexbox', 'JavaScript', 'jQuery', 'Node', 'Angular', 'VueJS', 'ReactJS', 'React Hooks', 'Redux', 'Apollo', 'GraphQL', 'TypeScript', 'PHP', 'Laravel', 'Symfony', 'Python', 'Django', 'ORM', 'Sequelize', 'Mongoose', 'SQL', 'MVC', 'SASS', 'WordPress'];

	let html = '';
	skills.forEach((skill, i) => {
		html += `
			<li class="${seleccionadas.includes(skill) ? 'activo' : ''}">${skill}</li>
		`;
	});

	return opciones.fn().html = html;
});

hbs.registerHelper('tipoContrato', (seleccionado, opciones) => {
	
	
	return opciones.fn(this).replace(new RegExp(`value="${seleccionado}"`), "$& selected");
});

hbs.registerHelper('mostrarAlertas', (errores = {}, alertas) => {

	const categoria = Object.keys(errores);
	let html = '';

	if (categoria.length) {

		errores[categoria].forEach(error => {

			html += `
				<div class="${categoria} alerta">
					${error}
				</div>
			`;
		});
	}

	return alertas.fn().html = html;
});