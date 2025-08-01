export function searchReset(element) {
  const currentURI = window.location.href;
  const searchLength = element.value.length;

  element.focus();
  element.setSelectionRange(searchLength, searchLength);

  element.addEventListener('input', function () { 
    if (element.value.length == 0){
      window.location.replace(currentURI.split("?")[0]);
    }
  });
}