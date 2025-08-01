export function toggleByRadio(enableRadio) {
  const disableRadioId = `not-${enableRadio.id}`;
  const disableRadio = document.getElementById(disableRadioId);

  const target = document.getElementById(
    enableRadio.getAttribute('data-target'),
  );

  // Initial render
  toggleTarget(target, enableRadio.checked);

  enableRadio.addEventListener('change', () => {
    toggleTarget(target, true);
  });

  disableRadio.addEventListener('change', () => {
    toggleTarget(target, false);
  });
}

function toggleTarget(target, state) {
  target.style.display = state ? 'block' : 'none';

  const children = [
    ...target.getElementsByTagName('input'),
    ...target.getElementsByTagName('textarea'),
  ];

  children.forEach(child => {
    const required = child.className.split(' ').includes('required');
    child.required = state && required;
    child.readOnly = !state;
  });
}
