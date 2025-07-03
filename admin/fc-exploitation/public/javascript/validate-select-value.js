export function checkSelectValue(element){
  element.addEventListener('input', function(){
    if(element.value === 'Choix'){
      element.classList.add('is-invalid');
    } else {
      element.classList.remove('is-invalid');
      element.classList.add('is-valid');
    }
  });
}
