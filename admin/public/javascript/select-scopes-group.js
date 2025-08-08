export function selectScopesGroup(element) {
  const fd = element.id;
  const groupCheckbox = document.getElementById(`group-${fd}`);

  groupCheckbox.addEventListener('click', event => {
    document.querySelectorAll(`[data-fd=${fd}]`).forEach(checkbox => {
      checkbox.checked = groupCheckbox.checked;
    });
  });
}
