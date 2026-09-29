const params = new URLSearchParams(window.location.search);
const recipeId = params.get("id");

const form = document.querySelector(".recipe-form");
const logoutButton = document.getElementById("logout-button");

let currentImageUrl = null;

async function checkAdmin() {
  const {
    data: { session }
  } = await supabaseClient.auth.getSession();

  if (!session) {
    window.location.href = "login.html";
    return false;
  }

  return true;
}

async function loadRecipe() {
  const isLoggedIn = await checkAdmin();

  if (!isLoggedIn) {
    return;
  }

  if (!recipeId) {
    alert("Recette introuvable.");
    window.location.href = "recipes.html";
    return;
  }

  const { data: recipe, error } = await supabaseClient
    .from("recipes")
    .select("*")
    .eq("id", recipeId)
    .single();

  if (error || !recipe) {
    console.error("Erreur Supabase :", error);
    alert("Impossible de charger la recette.");
    window.location.href = "recipes.html";
    return;
  }

  currentImageUrl = recipe.image_url || null;

  document.getElementById("recipe-name-input").value =
    recipe.name || "";

  document.getElementById("description-input").value =
    recipe.description || "";

  document.getElementById("type-input").value =
    recipe.type || "";

  document.getElementById("holiday-input").value =
    recipe.holiday || "";

  document.getElementById("prep-time-input").value =
    recipe.prep_time || "";

  document.getElementById("rest-time-input").value =
    recipe.rest_time || "";

  document.getElementById("cook-time-input").value =
    recipe.cook_time || "";

  document.getElementById("cooking-mode-input").value =
    recipe.cooking_mode || "";

  document.getElementById("ingredients-input").value =
    (recipe.ingredients || []).join("\n");

  document.getElementById("instructions-input").value =
    (recipe.instructions || []).join("\n");

  document.getElementById("family-note-input").value =
    recipe.family_note || "";

  const checkedTags = recipe.tags || [];

  document
    .querySelectorAll('.checkbox-group input[type="checkbox"]')
    .forEach(function (checkbox) {
      checkbox.checked = checkedTags.includes(checkbox.value);
    });
}

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

  const ingredients = document
    .getElementById("ingredients-input")
    .value
    .split("\n")
    .map(function (item) {
      return item.trim();
    })
    .filter(function (item) {
      return item !== "";
    });

  const instructions = document
    .getElementById("instructions-input")
    .value
    .split("\n")
    .map(function (item) {
      return item.trim();
    })
    .filter(function (item) {
      return item !== "";
    });

  const familyNote = document
    .getElementById("family-note-input")
    .value
    .trim();

  const checkedCategories = document.querySelectorAll(
    '.checkbox-group input[type="checkbox"]:checked'
  );

  const tags = [];

  checkedCategories.forEach(function (checkbox) {
    tags.push(checkbox.value);
  });

  let imageUrl = currentImageUrl;
  const imageInput = document.getElementById("image-input");
  const imageFile = imageInput.files[0];
  
  const removeImage =
    document.getElementById("remove-image").checked;
    if (removeImage) {
        imageUrl = null;
    }
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
      alert("Impossible d'envoyer la nouvelle photo.");
      return;
    }

    const { data: publicUrlData } = supabaseClient
      .storage
      .from("recipe-images")
      .getPublicUrl(fileName);

    imageUrl = publicUrlData.publicUrl;
  }

  const { error } = await supabaseClient
    .from("recipes")
    .update({
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
    })
    .eq("id", recipeId);

  if (error) {
    console.error("Erreur modification :", error);
    alert("Impossible de modifier la recette.");
    return;
  }

  alert("Recette modifiée !");

  window.location.href = `recipe.html?id=${recipeId}`;
});

if (logoutButton) {
  logoutButton.addEventListener("click", async function () {
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
      console.error("Erreur de déconnexion :", error);
      alert("Impossible de se déconnecter.");
      return;
    }

    window.location.href = "login.html";
  });
}

loadRecipe();