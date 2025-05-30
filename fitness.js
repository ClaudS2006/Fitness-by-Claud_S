// SEND MESSSAGE

const form = document.getElementById("contact-form");
const output = document.getElementById("confirmation-output");

form.addEventListener("submit", (e) => {
  if (!form.checkValidity()) {
    e.preventDefault();
    output.textContent = "Please fill in all required fields correctly.";
    output.style.color = "red";
    return;
  }
  
  // Zeige "Sending..." bevor das Formular abgesendet wird
  output.textContent = "Sending your message...";
  output.style.color = "blue";
  
  // Lass das Formular normal absenden - KEIN preventDefault()
  // FormSubmit wird zur _next URL weiterleiten
});