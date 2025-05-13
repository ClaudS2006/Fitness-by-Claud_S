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

// Question Chat Bot Sparkle
// This function indicates that the bot is typing
// It creates a typing indicator and appends it to the chat log

function showTypingIndicator() {
  const chatLog = document.querySelector('.chat-log');

  const typingIndicator = document.createElement('li');
  typingIndicator.classList.add('chat-message', 'bot', 'typing-indicator');
  typingIndicator.setAttribute('aria-label', 'Sparkle is typing...');
  typingIndicator.innerHTML = `
    <span class="dot"></span>
    <span class="dot"></span>
    <span class="dot"></span>
  `;

  chatLog.appendChild(typingIndicator);
  chatLog.scrollTop = chatLog.scrollHeight; // automatic scroll
}

function hideTypingIndicator() {
  const typing = document.querySelector('.typing-indicator');
  if (typing) typing.remove();
}

function addBotMessage(text) {
  hideTypingIndicator();

  const chatLog = document.querySelector('.chat-log');
  const botMessage = document.createElement('li');
  botMessage.classList.add('chat-message', 'bot');
  botMessage.innerHTML = `<p>${text}</p>`;
  
  chatLog.appendChild(botMessage);
  chatLog.scrollTop = chatLog.scrollHeight;
}

// exmpl of a bot response after a delay
function simulateBotResponse(userMessage) {
  showTypingIndicator();

  setTimeout(() => {
    addBotMessage("Your answer to: " + userMessage);
  }, 2000);
}

// chat bot Set up & knowledge base

// configuration object for the chatbot
const config = {
  apiKey: "your-api-key-here", // replace with your actual OpenAI API key when testing
  model: "gpt-3.5-turbo", // model to use for the chatbot
  // can be changed to "gpt-4" if you have access
  apiEndpoint: "https://api.openai.com/v1/chat/completions",
  maxTokens: 1000,
  temperature: 0.7
};
const websiteKnowledgeBase = {
  content: `
    My website offers personal coaching in Yoga and Pilates combined.
    Coaching programs are individual and pricing is adjusted accordingly. We will find the best solution for your needs and financial situation.
    For appointments and questions pleace reach out through my contact form.
    I will get back to you as soon as possible but please allow 48 hours to pass for responses.
    Since I don't have a studio yet, I'll arrange a meeting point and training center.
  `
};

// chat history to maintain context
const chatHistory = [];

// DOM elements
const chatLog = document.querySelector(".chat-log");
const chatForm = document.querySelector(".chat-input");
const chatInput = document.getElementById("chat-message");

// initialize chat
function initChat() {
  if (chatLog.querySelectorAll(".chat-message.bot").length === 0) {
    appendBotMessage("Hi! How can I help you today?");
  }

  // event listener for the form submission
  chatForm.addEventListener("submit", handleSubmit);
}

// handle form submission
async function handleSubmit(event) {
  event.preventDefault();
  
  const userMessage = chatInput.value.trim();
  
  if (!userMessage) return; // no empty messages
  
  // display user message
  appendUserMessage(userMessage);
  
  // clear input field
  chatInput.value = "";
  
  // show typing indicator
  showTypingIndicator();
  
  try {
    // send to OpenAI and get response
    const botResponse = await sendToOpenAI(userMessage);
    
    // remove typing indicator
    removeTypingIndicator();
    
    // display bot response
    appendBotMessage(botResponse);
  } catch (error) {
    // remove typing indicator
    removeTypingIndicator();
    
    // show error message
    appendBotMessage(`Sorry, there was an error: ${error.message}`);
    console.error("Error:", error);
  }
}

// function to send message to OpenAI API
async function sendToOpenAI(message) {
  // add user message to history
  chatHistory.push({ role: "user", content: message });
  
  try {
    // validate API key
    if (!config.apiKey || config.apiKey === "enter your api-key here") {
      throw new Error("Please set your OpenAI API key in the config object");
    }
    
    const response = await fetch(config.apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: "system", content: "You are Sparkle ✨, a helpful and friendly assistant. Use the following information to answer questions about our website: " + websiteKnowledgeBase.content },
          ...chatHistory
        ],
        max_tokens: config.maxTokens,
        temperature: config.temperature
      })
    });
    
    // check if response is OK
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `HTTP error! Status: ${response.status}`;
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    
    // extract message content
    const botMessage = data.choices[0].message.content;
    
    // add bot message to history
    chatHistory.push({ role: "assistant", content: botMessage });
    
    return botMessage;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

// function to append user message to chat
function appendUserMessage(message) {
  const messageElement = createMessageElement(message, "user");
  chatLog.appendChild(messageElement);
  scrollToBottom();
}

// function to append bot message to chat
function appendBotMessage(message) {
  const messageElement = createMessageElement(message, "bot");
  chatLog.appendChild(messageElement);
  scrollToBottom();
}

// create message element
function createMessageElement(message, role) {
  const li = document.createElement("li");
  li.className = `chat-message ${role}`;
  li.setAttribute("aria-label", role === "user" ? "You say:" : "Sparkle says:");
  
  // support for markdown/formatting with simple paragraph handling
  const formattedMessage = message.split("\n").map(paragraph => {
    if (paragraph.trim() === "") return "";
    return `<p>${paragraph}</p>`;
  }).join("");
  
  li.innerHTML = formattedMessage || "<p>" + message + "</p>";
  return li;
}

// show typing indicator
function showTypingIndicator() {
  const indicator = document.createElement("li");
  indicator.className = "typing-indicator";
  indicator.setAttribute("aria-label", "Sparkle is typing");
  indicator.innerHTML = `
    <div class="dot"></div>
    <div class="dot"></div>
    <div class="dot"></div>
  `;
  chatLog.appendChild(indicator);
  scrollToBottom();
}

// remove typing indicator
function removeTypingIndicator() {
  const indicator = document.querySelector(".typing-indicator");
  if (indicator) {
    indicator.remove();
  }
}

// scroll to bottom of the chat
function scrollToBottom() {
  chatLog.scrollTop = chatLog.scrollHeight;
}

// function to handle rate limiting and retries
async function retryWithExponentialBackoff(fn, retries = 3, delay = 1000) {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0 || !error.message.includes("429")) {
      throw error;
    }
    
    console.log(`Rate limited. Retrying in ${delay}ms...`);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return retryWithExponentialBackoff(fn, retries - 1, delay * 2);
  }
}

// handle errors globally
window.addEventListener("error", (event) => {
  console.error("Global error:", event.error);
  appendBotMessage("Sorry, something went wrong. Please try again later.");
});

// start chat when DOM is fully loaded
document.addEventListener("DOMContentLoaded", initChat);