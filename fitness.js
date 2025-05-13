// SEND MESSSAGE

const form = document.getElementById("contact-form");
const output = document.getElementById("confirmation-output");

form.addEventListener("submit", (event) => {
  event.preventDefault(); // prevents page reload

  if (!form.checkValidity()) {
    // if validation fails
    output.textContent = "Please fill in all required fields correctly.";
    output.style.color = "red";
    return;
  }
// removes spaces form user input
  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const message = form.message.value.trim();
// builds mail entry
  const subject = encodeURIComponent("New message from " + name);
  const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
  window.location.href = `mailto:cstoll2006@gmail.com?subject=${subject}&body=${body}`;

  output.textContent = "Your message has been passed to your email provider.";
  output.style.color = "green";

  setTimeout(() => {
    output.textContent = "";
  }, 5000);
});