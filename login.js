const loginForm = document.querySelector(".login-form");

loginForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const email = document
    .getElementById("login-email")
    .value
    .trim();

  const password = document.getElementById("login-password").value;

  const { error } = await supabaseClient.auth.signInWithPassword({
    email: email,
    password: password
  });

  if (error) {
    console.error("Erreur de connexion :", error);
    alert(error.message);
    return;
  }

  alert("Connexion réussie !");
  window.location.href = "add-recipe.html";
});