// This script fetches recipes from the Spoonacular API based on user input and displays them with nutritional information
// Ensure you have an API key from Spoonacular and replace it in the API_KEY variable
// The script listens for a button click, fetches the recipes, and displays them in a structured format"
const API_KEY = "API_key"; // Replace with your actual API key
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchQuery");
const resultsContainer = document.getElementById("results-container");

searchBtn.addEventListener("click", () => {
  const query = searchInput.value.trim();
  if (query) fetchRecipes(query);
});

async function fetchRecipes(query) {
  resultsContainer.innerHTML = "Loading...";

  const searchUrl = `https://api.spoonacular.com/recipes/complexSearch?query=${query}&number=4&addRecipeNutrition=true&apiKey=${API_KEY}`;

  try {
    const response = await fetch(searchUrl);
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      resultsContainer.innerHTML = "<p>No results found.</p>";
      return;
    }

    displayResults(data.results);
  } catch (err) {
    resultsContainer.innerHTML = "<p>There was an error loading recipes.</p>";
    console.error(err);
  }
}

function displayResults(recipes) {
  resultsContainer.innerHTML = "";
  recipes.forEach((recipe) => {
    const nutrients = recipe.nutrition?.nutrients || [];
    const getNutrient = (name) =>
      Math.round(nutrients.find((n) => n.name === name)?.amount || 0);

    const card = document.createElement("div");
    card.classList.add("result-card");
    card.innerHTML = `
          <h3>${recipe.title}</h3>
          <img src="${recipe.image}" alt="${recipe.title}" />
          <p><strong>Calories:</strong> ${getNutrient("Calories")} kcal</p>
          <p><strong>Protein:</strong> ${getNutrient("Protein")} g</p>
          <p><strong>Carbs:</strong> ${getNutrient("Carbohydrates")} g</p>
          <p><strong>Fat:</strong> ${getNutrient("Fat")} g</p>
        `;
    resultsContainer.appendChild(card);
  });
}
// ---------------------------------------------

