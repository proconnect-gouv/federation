export function validateRnippForm(element) {
	const inputs = element.getElementsByTagName('input');

	for (let i = 0; i < inputs.length; ++i) {
		// check if inputs which change are valid
		inputs[i].addEventListener('input', function(event){
			// special check for link radio input
			if (document.getElementById('male').checked || document.getElementById('female').checked) {
				document.getElementById('male').classList.remove('is-invalid');
				document.getElementById('male').classList.add('is-valid');
				document.getElementById('female').classList.remove('is-invalid');
				document.getElementById('female').classList.add('is-valid');
			}

			// check input pattern
			if (inputs[i].checkValidity() === false) {
				inputs[i].classList.remove('is-valid');
				inputs[i].classList.add('is-invalid');
			} else {
				inputs[i].classList.remove('is-invalid');
				inputs[i].classList.add('is-valid');
			}
		}, false);

		// check on submit if form is valid
		element.addEventListener('submit', function(event) {
			if (inputs[i].checkValidity() === false) {
				inputs[i].classList.remove('is-valid');
				inputs[i].classList.add('is-invalid');
				event.preventDefault();
				event.stopPropagation();
			} else {
				inputs[i].classList.remove('is-invalid');
				inputs[i].classList.add('is-valid');
			}
		}, false);
	}
}
