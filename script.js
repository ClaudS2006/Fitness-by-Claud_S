// This script fetches recipes from the Spoonacular API based on user input and displays them with nutritional information
// Ensure you have an API key from Spoonacular and replace it in the API_KEY variable
// The script listens for a button click, fetches the recipes, and displays them in a structured format"
const API_KEY = "API-key"; // Replace with your actual API key
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchQuery");
const resultsContainer = document.getElementById("results-container");

// loading indicator
function createLoadingIndicator() {
  const loader = document.createElement("div");
  loader.classList.add("loading-spinner");
  loader.innerHTML = `
    <div class="spinner"></div>
    <p>Rezepte werden geladen...</p>
  `;
  return loader;
}

// error state component
function createErrorMessage(message) {
  const errorDiv = document.createElement("div");
  errorDiv.classList.add("error-message");
  errorDiv.innerHTML = `
    <p>🚫 ${message}</p>
    <button class="retry-btn">Erneut versuchen</button>
  `;
  
  // event-listener retry-btn
  setTimeout(() => {
    const retryBtn = errorDiv.querySelector(".retry-btn");
    if (retryBtn) {
      retryBtn.addEventListener("click", () => {
        const query = searchInput.value.trim();
        if (query) fetchRecipes(query);
      });
    }
  }, 0);
  
  return errorDiv;
}

// validate input
function validateInput(query) {
  if (!query) {
    return {
      valid: false,
      message: "Bitte gib einen Suchbegriff ein."
    };
  }
  
  if (query.length < 2) {
    return {
      valid: false,
      message: "Der Suchbegriff ist zu kurz. Bitte gib mindestens 2 Zeichen ein."
    };
  }
  
  return { valid: true };
}

// event listener enter key
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    searchBtn.click();
  }
});

// event listener search button
searchBtn.addEventListener("click", () => {
  const query = searchInput.value.trim();
  const validation = validateInput(query);
  
  if (!validation.valid) {
    resultsContainer.innerHTML = "";
    resultsContainer.appendChild(createErrorMessage(validation.message));
    return;
  }
  
  fetchRecipes(query);
});

// loading state - disables search button and input
// while fetching data
function setLoadingState(isLoading) {
  searchBtn.disabled = isLoading;
  searchBtn.innerText = isLoading ? "Suche..." : "Search";
  searchInput.disabled = isLoading;
  
  if (isLoading) {
    resultsContainer.innerHTML = "";
    resultsContainer.appendChild(createLoadingIndicator());
  }
}

// fetch data from API w/ error handling & loading state
// using async/await for better readability
async function fetchRecipes(query) {
  setLoadingState(true);
  
  const searchUrl = `https://api.spoonacular.com/recipes/complexSearch?query=${encodeURIComponent(query)}&number=4&addRecipeNutrition=true&apiKey=${API_KEY}`;
  
  try {
    const response = await fetch(searchUrl);
    
    // handles HTTP-statuscode
    if (!response.ok) {
      let errorMessage = "Es gab ein Problem beim Abrufen der Rezepte.";
      
      // error handling based on status code
      if (response.status === 401 || response.status === 403) {
        errorMessage = "API-Schlüssel ungültig oder Zugriffsberechtigung fehlt.";
      } else if (response.status === 402) {
        errorMessage = "API-Kontingent überschritten. Bitte versuche es später erneut.";
      } else if (response.status === 404) {
        errorMessage = "Die angeforderte Ressource wurde nicht gefunden.";
      } else if (response.status >= 500) {
        errorMessage = "Server-Fehler. Bitte versuche es später erneut.";
      }
      
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    
    // validate response data
    // Check if the response is in the expected format
    if (!data || typeof data !== 'object') {
      throw new Error("Unerwartetes Antwortformat vom Server.");
    }
    
    // check if results are empty
    if (!data.results || data.results.length === 0) {
      resultsContainer.innerHTML = "";
      const noResultsDiv = document.createElement("div");
      noResultsDiv.classList.add("no-results");
      noResultsDiv.innerHTML = `
        <p>Keine Rezepte für "${query}" gefunden.</p>
        <p>Versuche es mit einem anderen Suchbegriff oder überprüfe die Schreibweise.</p>
      `;
      resultsContainer.appendChild(noResultsDiv);
      setLoadingState(false);
      return;
    }
    
    displayResults(data.results);
  } catch (err) {
    console.error("Fehler beim Abrufen der Rezepte:", err);
    
    resultsContainer.innerHTML = "";
    resultsContainer.appendChild(createErrorMessage(err.message || "Es gab einen Fehler beim Laden der Rezepte."));
  } finally {
    setLoadingState(false);
  }
}

function displayResults(recipes) {
  resultsContainer.innerHTML = "";
  
  try {
    recipes.forEach((recipe) => {
      const nutrients = recipe.nutrition?.nutrients || [];
      
      // secure method to get nutrient values
      const getNutrient = (name) => {
        const nutrient = nutrients.find((n) => n.name === name);
        return nutrient ? Math.round(nutrient.amount) : "N/A";
      };
      
      const card = document.createElement("div");
      card.classList.add("result-card");
      
      // fallback pic if recipe unavailable
      const imageUrl = recipe.image || "placeholder-recipe-image.jpg";
      
      card.innerHTML = `
        <h3>${recipe.title || "Unbenanntes Rezept"}</h3>
        <img 
          src="${imageUrl}" 
          alt="${recipe.title || 'Rezeptbild'}" 
          onerror="this.onerror=null;this.src='placeholder-recipe-image.jpg';"
        />
        <p><strong>Kalorien:</strong> ${getNutrient("Calories")} kcal</p>
        <p><strong>Protein:</strong> ${getNutrient("Protein")} g</p>
        <p><strong>Kohlenhydrate:</strong> ${getNutrient("Carbohydrates")} g</p>
        <p><strong>Fett:</strong> ${getNutrient("Fat")} g</p>
      `;
      resultsContainer.appendChild(card);
    });
  } catch (err) {
    console.error("Fehler beim Anzeigen der Ergebnisse:", err);
    resultsContainer.innerHTML = "";
    resultsContainer.appendChild(createErrorMessage("Fehler beim Anzeigen der Ergebnisse."));
  }
}

// helper function to log errors
// This function can be extended to log errors to an external service
function logError(context, error) {
  console.error(`[${context}] ${error.message}`, error);
}