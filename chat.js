// Chat elements
const chatElements = {
    messages: document.getElementById('chatMessages'),
    userInput: document.getElementById('userMessage'),
    sendButton: document.getElementById('sendMessage'),
    toggleCheckbox: document.getElementById('toggleChat'),
    chatContent: document.querySelector('.chat-content'),
    chatSection: document.querySelector('.chat-section')
};

// Chat state
const chatState = {
    messages: [],
    isProcessing: false,
    isEnabled: false // Start with chat disabled by default
};

// Initialize chat
function initializeChat() {
    // Set up message handlers
    chatElements.sendButton.addEventListener('click', handleSendMessage);
    chatElements.userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    });

    // Set up chat toggle
    chatElements.toggleCheckbox.addEventListener('change', handleChatToggle);
    
    // Initialize chat as hidden
    chatElements.chatSection.classList.add('hidden');
    chatElements.chatContent.classList.add('hidden');
    chatElements.toggleCheckbox.checked = false;
}

// Handle chat toggle
function handleChatToggle(e) {
    chatState.isEnabled = e.target.checked;
    
    if (chatState.isEnabled) {
        // Show chat
        chatElements.chatSection.classList.remove('hidden');
        setTimeout(() => {
            chatElements.chatContent.classList.remove('hidden');
            // Add welcome message only when first enabled in a session
            if (chatElements.messages.children.length === 0) {
                addAssistantMessage("Hello! I'm here to help explain the vlaai bargaining game. Feel free to ask questions about the negotiation process!");
            }
        }, 300);
    } else {
        // Hide chat
        chatElements.chatContent.classList.add('hidden');
        setTimeout(() => {
            chatElements.chatSection.classList.add('hidden');
        }, 300);
    }
}

// Handle sending a message
async function handleSendMessage() {
    if (chatState.isProcessing || !chatState.isEnabled) {
        return;
    }

    const userMessage = chatElements.userInput.value.trim();
    if (!userMessage) {
        return;
    }

    // Clear input
    chatElements.userInput.value = '';

    // Add user message to chat
    addUserMessage(userMessage);

    // Process with GPT-4
    chatState.isProcessing = true;
    try {
        const response = await sendToGPT4(userMessage);
        addAssistantMessage(response);
    } catch (error) {
        console.error('Error:', error);
        addAssistantMessage("I apologize, but I encountered an error. Please try again.");
    } finally {
        chatState.isProcessing = false;
    }
}

// Add a user message to the chat
function addUserMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message user-message';
    messageDiv.textContent = message;
    chatElements.messages.appendChild(messageDiv);
    chatElements.messages.scrollTop = chatElements.messages.scrollHeight;
    
    // Store in chat history
    chatState.messages.push({ role: 'user', content: message });
}

// Add an assistant message to the chat
function addAssistantMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message assistant-message';
    messageDiv.textContent = message;
    chatElements.messages.appendChild(messageDiv);
    chatElements.messages.scrollTop = chatElements.messages.scrollHeight;
    
    // Store in chat history
    chatState.messages.push({ role: 'assistant', content: message });
}

// Send message to GPT-4
async function sendToGPT4(message) {
    // Note: Replace 'YOUR_API_KEY' with actual API key from environment variable
    const API_KEY = 'YOUR_API_KEY';
    const API_URL = 'https://api.openai.com/v1/chat/completions';

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful assistant explaining a vlaai bargaining game. The game involves two players deciding how to split a traditional Limburg vlaai (pie). Players take turns offering what percentage of the vlaai they want to keep for themselves. Be concise but friendly in your responses, and occasionally mention interesting facts about vlaai from the Limburg region. Focus on helping players understand fair negotiation strategies.'
                    },
                    ...chatState.messages,
                    {
                        role: 'user',
                        content: message
                    }
                ],
                max_tokens: 150,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Initialize chat when the page loads
document.addEventListener('DOMContentLoaded', initializeChat); 