const recipeList = document.getElementById("recipe-list");
const searchBar = document.querySelector(".search-bar");
const filterButtons = document.querySelectorAll(".filter-button");

let allRecipes = [];
let activeFilter = "all";
let isAdmin = false;

async function loadRecipes() {
  const { data, error } = await supabaseClient
    .from("recipes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erreur Supabase :", error);
    recipeList.innerHTML = "<p>Impossible de charger les recettes.</p>";
    return;
  }

  allRecipes = data || [];
  displayRecipes();
}

async function checkLoginStatus() {
  const {
    data: { session }
  } = await supabaseClient.auth.getSession();

  isAdmin = !!session;

  const addRecipeLink = document.getElementById("add-recipe-link");
  const loginLink = document.getElementById("login-link");
  const logoutButton = document.getElementById("logout-button");

  if (addRecipeLink) {
    addRecipeLink.style.display = isAdmin ? "block" : "none";
  }
  if (loginLink) {
  loginLink.style.display = isAdmin ? "none" : "block";
    }
   if (logoutButton) {
    logoutButton.style.display = isAdmin ? "block" : "none";
  }

  displayRecipes();
}

function displayRecipes() {
  const searchText = searchBar.value.trim().toLowerCase();

  const filteredRecipes = allRecipes.filter(function (recipe) {
    const name = (recipe.name || "").toLowerCase();

    const tags = [
      recipe.type,
      ...(recipe.tags || []),
      recipe.holiday
    ]
      .filter(Boolean)
      .map(function (tag) {
        return tag.toLowerCase();
      });

    const matchesSearch = name.includes(searchText);

    const matchesFilter =
      activeFilter === "all" ||
      tags.includes(activeFilter.toLowerCase());

    return matchesSearch && matchesFilter;
  });

  recipeList.innerHTML = "";

  if (filteredRecipes.length === 0) {
    recipeList.innerHTML = "<p>Aucune recette trouvée.</p>";
    return;
  }

  filteredRecipes.forEach(function (recipe) {
    const card = document.createElement("div");
    card.classList.add("recipe-card");

    const tags = [
      recipe.type,
      ...(recipe.tags || []),
      recipe.holiday
    ].filter(Boolean);

    card.innerHTML = `
      <h2>
        <a href="recipe.html?id=${recipe.id}">
          ${recipe.name}
        </a>
      </h2>

      <p>${tags.join(" • ")}</p>
    `;

    if (isAdmin) {
      const adminActions = document.createElement("div");
      adminActions.classList.add("admin-actions");

      adminActions.innerHTML = `
        <a href="edit-recipe.html?id=${recipe.id}" class="edit-button">
          Modifier
        </a>

        <button class="delete-button" data-id="${recipe.id}">
          Supprimer
        </button>
      `;

      card.appendChild(adminActions);
    }

    recipeList.appendChild(card);
  });
}

searchBar.addEventListener("input", displayRecipes);

filterButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    activeFilter = button.dataset.filter;
    displayRecipes();
  });
});

recipeList.addEventListener("click", async function (event) {
  if (!event.target.classList.contains("delete-button")) {
    return;
  }

  const recipeId = event.target.dataset.id;

  const confirmed = confirm(
    "Tu es sûre de vouloir supprimer cette recette ?"
  );

  if (!confirmed) {
    return;
  }

  const { error } = await supabaseClient
    .from("recipes")
    .delete()
    .eq("id", recipeId);

  if (error) {
    console.error("Erreur suppression :", error);
    alert("Impossible de supprimer la recette.");
    return;
  }

  allRecipes = allRecipes.filter(function (recipe) {
    return String(recipe.id) !== String(recipeId);
  });

  displayRecipes();

  alert("Recette supprimée.");
});

async function initializePage() {
  await loadRecipes();
  await checkLoginStatus();
}

initializePage();

const logoutButton = document.getElementById("logout-button");

if (logoutButton) {
  logoutButton.addEventListener("click", async function () {
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
      console.error("Erreur de déconnexion :", error);
      alert("Impossible de se déconnecter.");
      return;
    }

    window.location.href = "recipes.html";
  });
}