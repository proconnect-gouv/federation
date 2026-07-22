var form = document.forms[0];
var input = document.createElement("input");
input.type = "hidden";
input.name = "logout";
input.value = "yes";
form.appendChild(input);
form.submit();
