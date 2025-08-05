 // Konfiguration
        const config = {
            apiKey: "your-api-key-here", // HIER IHREN API KEY EINFÜGEN
            model: "gpt-3.5-turbo",
            apiEndpoint: "https://api.openai.com/v1/chat/completions"
        };

        // Wissensdatenbank
        const websiteKnowledgeBase = {
            content: `
                Meine Website bietet persönliches Coaching in Yoga und Pilates kombiniert.
                Coaching-Programme sind individuell und die Preise werden entsprechend angepasst.
                Für Termine kontaktieren Sie mich über mein Kontaktformular.
                Ich melde mich innerhalb von 48 Stunden bei Ihnen.
            `
        };

        const chatHistory = [];
        const chatLog = document.getElementById("chat-log");
        const chatForm = document.getElementById("chat-form");
        const chatInput = document.getElementById("chat-message");

        // Chat initialisieren
        function initChat() {
            appendBotMessage("Hallo! Wie kann ich Ihnen heute helfen? 🧘‍♀️");
            chatForm.addEventListener("submit", handleSubmit);
        }

        // Formular behandeln
        async function handleSubmit(event) {
            event.preventDefault();
            
            const userMessage = chatInput.value.trim();
            if (!userMessage) return;
            
            appendUserMessage(userMessage);
            chatInput.value = "";
            showTypingIndicator();
            
            try {
                let botResponse;
                
                if (config.apiKey === "your-api-key-here") {
                    // Ohne API - Fallback Antworten
                    botResponse = getFallbackResponse(userMessage);
                } else {
                    // Mit API
                    botResponse = await sendToOpenAI(userMessage);
                }
                
                hideTypingIndicator();
                appendBotMessage(botResponse);
                
            } catch (error) {
                hideTypingIndicator();
                appendBotMessage("Entschuldigung, es gab einen Fehler.");
                console.error("Error:", error);
            }
        }

        // Fallback-Antworten ohne API
        function getFallbackResponse(message) {
            const lowerMessage = message.toLowerCase();
            
            if (lowerMessage.includes('preis') || lowerMessage.includes('kosten')) {
                return "Die Preise sind individuell angepasst. Kontaktieren Sie mich für ein Angebot! 💰";
            }
            
            if (lowerMessage.includes('termin')) {
                return "Für Termine erreichen Sie mich über das Kontaktformular! 📅";
            }
            
            if (lowerMessage.includes('yoga') || lowerMessage.includes('pilates')) {
                return "Ich biete individuelles Yoga und Pilates Coaching an! 🧘‍♀️";
            }
            
            return "Vielen Dank für Ihre Nachricht! Kontaktieren Sie mich gerne über das Kontaktformular. 🌟";
        }

        // OpenAI API Anfrage
        async function sendToOpenAI(message) {
            chatHistory.push({ role: "user", content: message });
            
            const response = await fetch(config.apiEndpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${config.apiKey}`
                },
                body: JSON.stringify({
                    model: config.model,
                    messages: [
                        { 
                            role: "system", 
                            content: "Du bist Sparkle ✨, ein Assistent für Yoga und Pilates. Antworte auf Deutsch: " + websiteKnowledgeBase.content 
                        },
                        ...chatHistory
                    ],
                    max_tokens: 1000,
                    temperature: 0.7
                })
            });
            
            const data = await response.json();
            const botMessage = data.choices[0].message.content;
            
            chatHistory.push({ role: "assistant", content: botMessage });
            return botMessage;
        }

        // Nachrichten hinzufügen
        function appendUserMessage(message) {
            const li = document.createElement("li");
            li.className = "chat-message user";
            li.innerHTML = `<p>${message}</p>`;
            chatLog.appendChild(li);
            scrollToBottom();
        }

        function appendBotMessage(message) {
            const li = document.createElement("li");
            li.className = "chat-message bot";
            li.innerHTML = `<p>${message}</p>`;
            chatLog.appendChild(li);
            scrollToBottom();
        }

        // Typing Indicator
        function showTypingIndicator() {
            const li = document.createElement("li");
            li.className = "typing-indicator";
            li.innerHTML = `
                <div class="typing-dots">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
            `;
            chatLog.appendChild(li);
            scrollToBottom();
        }

        function hideTypingIndicator() {
            const indicator = document.querySelector(".typing-indicator");
            if (indicator) indicator.remove();
        }

        function scrollToBottom() {
            chatLog.scrollTop = chatLog.scrollHeight;
        }

        // Chat starten
        document.addEventListener("DOMContentLoaded", initChat);