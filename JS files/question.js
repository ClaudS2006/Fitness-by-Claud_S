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
  
  // create p 
  const paragraphs = message.split("\n").filter(p => p.trim() !== "");
  
  paragraphs.forEach(paragraph => {
    const p = document.createElement("p");
    p.textContent = paragraph;
    li.appendChild(p);
  });
  
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