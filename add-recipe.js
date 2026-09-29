async function checkAdmin() {
  const {
    data: { session }
  } = await supabaseClient.auth.getSession();

  if (!session) {
    window.location.href = "login.html";
    return;
  }
}

checkAdmin();
const form = document.querySelector(".recipe-form");

form.addEventListener("submit", async function (event) {
  event.preventDefault();

  const name = document
    .getElementById("recipe-name-input")
    .value
    .trim();

  const description = document
    .getElementById("description-input")
    .value
    .trim();

  const type = document.getElementById("type-input").value;
  const holiday = document.getElementById("holiday-input").value;

  const prepTime = document
    .getElementById("prep-time-input")
    .value
    .trim();

  const restTime = document
    .getElementById("rest-time-input")
    .value
    .trim();

  const cookTime = document
    .getElementById("cook-time-input")
    .value
    .trim();

  const cookingMode = document
    .getElementById("cooking-mode-input")
    .value
    .trim();

  const ingredientsText =
    document.getElementById("ingredients-input").value;

  const instructionsText =
    document.getElementById("instructions-input").value;

  const familyNote = document
    .getElementById("family-note-input")
    .value
    .trim();

  if (!name) {
    alert("Le nom de la recette est obligatoire.");
    return;
  }

  const ingredients = ingredientsText
    .split("\n")
    .map(function (item) {
      return item.trim();
    })
    .filter(function (item) {
      return item !== "";
    });

  const instructions = instructionsText
    .split("\n")
    .map(function (item) {
      return item.trim();
    })
    .filter(function (item) {
      return item !== "";
    });

  const checkedCategories = document.querySelectorAll(
    '.checkbox-group input[type="checkbox"]:checked'
  );

  const tags = [];

  checkedCategories.forEach(function (checkbox) {
    tags.push(checkbox.value);
  });

  // PHOTO
  const imageInput = document.getElementById("image-input");
  const imageFile = imageInput.files[0];

  let imageUrl = null;

  if (imageFile) {
    const safeFileName = imageFile.name
      .replace(/\s+/g, "-")
      .toLowerCase();

    const fileName = Date.now() + "-" + safeFileName;

    const { error: uploadError } = await supabaseClient
      .storage
      .from("recipe-images")
      .upload(fileName, imageFile);

    if (uploadError) {
      console.error("Erreur upload image :", uploadError);
      alert("Impossible d'envoyer la photo.");
      return;
    }

    const { data: publicUrlData } = supabaseClient
      .storage
      .from("recipe-images")
      .getPublicUrl(fileName);

    imageUrl = publicUrlData.publicUrl;
  }

  // ENREGISTREMENT
  const { data, error } = await supabaseClient
    .from("recipes")
    .insert([
      {
        name: name,
        description: description || null,
        type: type,
        tags: tags,
        holiday: holiday || null,
        prep_time: prepTime || null,
        rest_time: restTime || null,
        cook_time: cookTime || null,
        cooking_mode: cookingMode || null,
        ingredients: ingredients,
        instructions: instructions,
        family_note: familyNote || null,
        image_url: imageUrl
      }
    ])
    .select()
    .single();

  if (error) {
    console.error("Erreur Supabase :", error);
    alert("Une erreur est survenue.");
    return;
  }

  alert("Recette ajoutée !");

  window.location.href = `recipe.html?id=${data.id}`;
});

const logoutButton = document.getElementById("logout-button");

logoutButton.addEventListener("click", async function () {
  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    console.error("Erreur de déconnexion :", error);
    alert("Impossible de se déconnecter.");
    return;
  }

  window.location.href = "login.html";
});