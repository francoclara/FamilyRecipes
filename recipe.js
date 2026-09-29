const params = new URLSearchParams(window.location.search);
const recipeId = params.get("id");

async function loadRecipe() {
  if (!recipeId) {
    document.getElementById("recipe-name").textContent =
      "Recette introuvable";
    return;
  }

  const { data: recipe, error } = await supabaseClient
    .from("recipes")
    .select("*")
    .eq("id", recipeId)
    .single();

  if (error || !recipe) {
    console.error("Erreur Supabase :", error);
    document.getElementById("recipe-name").textContent =
      "Recette introuvable";
    return;
  }

  document.title = recipe.name;

  document.getElementById("recipe-name").textContent = recipe.name;
  document.getElementById("recipe-emoji").textContent = recipe.emoji || "";
  document.getElementById("recipe-description").textContent =
    recipe.description || "";

  const tags = [];

  if (recipe.type) {
    tags.push(recipe.type);
  }

  if (recipe.tags) {
    tags.push(...recipe.tags);
  }

  if (recipe.holiday) {
    tags.push(recipe.holiday);
  }

  document.getElementById("recipe-tags").textContent = tags.join(" • ");

  const image = document.getElementById("recipe-image");
  const imageContainer = document.getElementById(
    "recipe-image-container"
  );

  if (recipe.image_url) {
    image.src = recipe.image_url;
    image.alt = recipe.name;
    imageContainer.style.display = "block";
  } else {
    imageContainer.style.display = "none";
  }

  const ingredientsList =
    document.getElementById("recipe-ingredients");

  ingredientsList.innerHTML = "";

  if (recipe.ingredients && recipe.ingredients.length > 0) {
    recipe.ingredients.forEach(function (ingredient) {
      const item = document.createElement("li");
      item.textContent = ingredient;
      ingredientsList.appendChild(item);
    });
  } else {
    ingredientsList.innerHTML = "<li>Aucun ingrédient renseigné.</li>";
  }

  const instructionsList =
    document.getElementById("recipe-instructions");

  instructionsList.innerHTML = "";

  if (recipe.instructions && recipe.instructions.length > 0) {
    recipe.instructions.forEach(function (instruction) {
      const item = document.createElement("li");
      item.textContent = instruction;
      instructionsList.appendChild(item);
    });
  } else {
    instructionsList.innerHTML =
      "<li>Aucune étape renseignée.</li>";
  }

  const recipeInfo = document.getElementById("recipe-info");
  recipeInfo.innerHTML = "";

  const infoItems = [
    ["⏱️", "Préparation", recipe.prep_time],
    ["🕒", "Repos", recipe.rest_time],
    ["🔥", "Cuisson", recipe.cook_time],
    ["🌡️", "Mode", recipe.cooking_mode]
  ];

  infoItems.forEach(function (info) {
    if (!info[2]) {
      return;
    }

    const box = document.createElement("div");
    box.classList.add("info-box");

    box.innerHTML = `
      <span>${info[0]}</span>
      <strong>${info[1]}</strong>
      <p>${info[2]}</p>
    `;

    recipeInfo.appendChild(box);
  });

  const familyNote = document.getElementById("recipe-family-note");
  const familyNoteSection = document.querySelector(".family-note");

  if (recipe.family_note) {
    familyNote.textContent = recipe.family_note;
    familyNoteSection.style.display = "block";
  } else {
    familyNoteSection.style.display = "none";
  }
}

loadRecipe();