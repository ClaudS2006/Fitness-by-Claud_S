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
    <p>Recipes loading...</p>
  `;
  return loader;
}

// error state component
function createErrorMessage(message) {
  const errorDiv = document.createElement("div");
  errorDiv.classList.add("error-message");
  errorDiv.innerHTML = `
    <p>🚫 ${message}</p>
    <button class="retry-btn">Please try again</button>
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
      message: "Please enter a search word e.g. pasta."
    };
  }
  
  if (query.length < 2) {
    return {
      valid: false,
      message: "Search word must be 2 signs minimum."
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
  searchBtn.innerText = isLoading ? "Search..." : "Search";
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
      let errorMessage = "An error occured while loading.";
      
      // error handling based on status code
      if (response.status === 401 || response.status === 403) {
        errorMessage = "API-Schlüssel invalid or faulty access-rights.";
      } else if (response.status === 402) {
        errorMessage = "API quota exceeded. Please try again later..";
      } else if (response.status === 404) {
        errorMessage = "The requested resource was not found.";
      } else if (response.status >= 500) {
        errorMessage = "Server error. Please try again later..";
      }
      
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    
    // validate response data
    // Check if the response is in the expected format
    if (!data || typeof data !== 'object') {
      throw new Error("Unexpected response format from the server.");
    }
    
    // check if results are empty
    if (!data.results || data.results.length === 0) {
      resultsContainer.innerHTML = "";
      const noResultsDiv = document.createElement("div");
      noResultsDiv.classList.add("no-results");
      noResultsDiv.innerHTML = `
        <p>No recipes found for "${query}" .</p>
        <p>Try a different search term or check your spelling.</p>
      `;
      resultsContainer.appendChild(noResultsDiv);
      setLoadingState(false);
      return;
    }
    
    displayResults(data.results);
  } catch (err) {
    console.error("Error fetching recipes:", err);
    
    resultsContainer.innerHTML = "";
    resultsContainer.appendChild(createErrorMessage(err.message || "There was an error loading the recipes."));
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
        <h3>${recipe.title || "Untitled recipe"}</h3>
        <img 
          src="${imageUrl}" 
          alt="${recipe.title || 'Recipe image'}" 
          onerror="this.onerror=null;this.src='placeholder-recipe-image.jpg';"
        />
        <p><strong>Calories:</strong> ${getNutrient("Calories")} kcal</p>
        <p><strong>Protein:</strong> ${getNutrient("Protein")} g</p>
        <p><strong>Carbohydrates:</strong> ${getNutrient("Carbohydrates")} g</p>
        <p><strong>Fat:</strong> ${getNutrient("Fat")} g</p>
      `;
      resultsContainer.appendChild(card);
    });
  } catch (err) {
    console.error("Error displaying the results:", err);
    resultsContainer.innerHTML = "";
    resultsContainer.appendChild(createErrorMessage("Error displaying the results:"));
  }
}

// helper function to log errors
// This function can be extended to log errors to an external service
function logError(context, error) {
  console.error(`[${context}] ${error.message}`, error);
}

// FORM SUBMIT 

const emailButton = document.querySelector(".submit-btn");

emailButton.addEventListener("click", () => {
  window.location.href = "mailto:cstoll2006@gmail.com";
});

emailButton.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault(); // no scroll on key press
    emailButton.click();    // simultes click event
  }
});

// MESSAGE SENT TEXT

const messageSent = document.getElementById("confirmation-output");

emailButton.addEventListener("click", (event) => {
  event.preventDefault();

  // sends email
  const mailtoLink = 'mailto:cstoll2006@gmail.com';
  const emailSent = window.location.href = mailtoLink;  // tries to open mail client

  if (emailSent) {
    // success message if email client opened
    confirmationOutput.textContent = "Your message has been sent successfully!";
    confirmationOutput.style.color = "green";  // success color
  } else {
    // error message if email client failed to open
    confirmationOutput.textContent = "Oops! Something went wrong. Please try again later.";
    confirmationOutput.style.color = "red";  // error color
  }

  // message dissappears after 5 seconds
  // simple timeout to clear the message after 5 seconds
  setTimeout(() => {
    confirmationOutput.textContent = "";
  }, 5000);
});