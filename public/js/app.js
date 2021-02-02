import axios from 'axios';
import Swal from 'sweetalert2';

document.addEventListener('DOMContentLoaded', () => {

	const skills = document.querySelector('.lista-conocimientos');

	// limpiar las alertas
	let alertas = document.querySelector('.alertas');

	if (alertas) {

		limpiarAlertas(alertas);
	}

	if (skills) {

		skills.addEventListener('click', agregarSkills);

		// una vez que estamos en editar llamar a la funciion
		skillsSeleccionados();
	}

	const vacantesListado = document.querySelector('.vacante');

	if (vacantesListado) {

		vacantesListado.addEventListener('click', accionesListado);
	}
});

const skills = new Set();

const agregarSkills = e => {

	if (e.target.tagName === 'LI') {
		
		skills.add(e.target.textContent);
		e.target.classList.toggle('activo');
		!e.target.classList.contains('activo') && skills.delete(e.target.textContent);
	}

	const skillsArray = [...skills];
	document.querySelector('#skills').value = skillsArray;
}

const skillsSeleccionados = () => {

	const seleccionados = Array.from(document.querySelectorAll('.lista-conocimientos .activo'));

	seleccionados.forEach(seleccionada => skills.add(seleccionada.textContent));

	const skillsArray = [...skills];
	document.querySelector('#skills').value = skillsArray;
}

const limpiarAlertas = alertas => {

	let interval = setInterval(() => {
		
		if (alertas.children.length > 0) {
		
			alertas.removeChild(alertas.children[0]);

		} else if (alertas.children.length === 0) {

			alertas.parentElement.removeChild(alertas);
			clearInterval(interval);
		}

	}, 2000);
}

const accionesListado = e => {

	e.preventDefault();

	if (e.target.dataset.eliminar) {

		Swal.fire({
			title: '¿Confirmar Eliminacion?',
			text: "Una vez eliminado no vas a poder recuperar!",
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Si, eliminar!',
			cancelButtonText: 'No, cancelar',
		}).then((result) => {
			if (result.isConfirmed) {

				const url = `${location.origin}/vacantes/eliminar/${e.target.dataset.eliminar}`;
				
				axios.delete(url, { params: url })
					.then(res => {
						if (res.status === 200) {
							
							Swal.fire(
								'Eliminado!',
								res.data,
								'success'
							);
							
							e.target.parentElement.parentElement.remove();
						}
					});

			}
		})
		.catch(() => {
			Swal.fire({
				type: 'error',
				title: 'Hubo un error',
				text: 'No se pudo eliminar',
			})
		})

	} else if (e.target.tagName === 'A') {

		window.location.href = e.target.href;
	}
} 