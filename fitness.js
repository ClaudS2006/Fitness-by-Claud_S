// SEND MESSSAGE via formsubmit 

const form = document.getElementById("contact-form");
const output = document.getElementById("confirmation-output");

form.addEventListener("submit", (e) => {
  if (!form.checkValidity()) {
    e.preventDefault();
    output.textContent = "Please fill in all required fields correctly.";
    output.style.color = "red";
    return;
  }
  
  // show status before sending
  output.textContent = "Sending your message...";
  output.style.color = "blue";
});