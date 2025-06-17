// Global chat log storage
window.chatLogs = {
    1: [],
    2: []
};

function setupChat(player) {
    const elements = {
        messages: document.getElementById(`chatMessagesP${player}`),
        userInput: document.getElementById(`userMessageP${player}`),
        sendButton: document.getElementById(`sendMessageP${player}`),
        toggle: document.getElementById(`toggleChatP${player}`),
        section: document.getElementById(`chatSectionP${player}`),
        content: document.querySelector(`#chatSectionP${player} .chat-content`)
    };

    const state = {
        messages: [],
        isProcessing: false,
        isEnabled: false
    };

    // Initialize chat log for this player
    window.chatLogs[player] = state.messages;

    elements.toggle.addEventListener('change', () => {
        state.isEnabled = elements.toggle.checked;
        if (state.isEnabled) {
            elements.section.classList.remove('hidden');
            setTimeout(() => {
                elements.content.classList.remove('hidden');
                if (elements.messages.children.length === 0) {
                    const intro = `Hello Player ${player}! I’m here to help with bargaining over the project reward.`;
                    addAssistantMessage(intro, player, state);
                }
            }, 300);
        } else {
            elements.content.classList.add('hidden');
            setTimeout(() => {
                elements.section.classList.add('hidden');
            }, 300);
        }
    });

    elements.sendButton.addEventListener('click', () => handleSendMessage(player, elements, state));
    elements.userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSendMessage(player, elements, state);
    });
}

function addUserMessage(message, elements, state, player) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-message user-message';
    msgDiv.textContent = message;
    elements.messages.appendChild(msgDiv);
    elements.messages.scrollTop = elements.messages.scrollHeight;
    const msgObj = { role: 'user', content: message };
    state.messages.push(msgObj);
    window.chatLogs[player] = state.messages;
}

function addAssistantMessage(message, player, state) {
    const container = document.getElementById(`chatMessagesP${player}`);
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-message assistant-message';
    msgDiv.textContent = message;
    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;

    const msgObj = { role: 'assistant', content: message };
    state.messages.push(msgObj);
    window.chatLogs[player] = state.messages;
}

async function handleSendMessage(player, elements, state) {
    if (state.isProcessing || !state.isEnabled) return;

    const userMessage = elements.userInput.value.trim();
    if (!userMessage) return;

    elements.userInput.value = '';
    addUserMessage(userMessage, elements, state, player);

    state.isProcessing = true;
    try {
        const response = await sendToGPT4(userMessage, state.messages);
        addAssistantMessage(response, player, state);
    } catch (e) {
        console.error(e);
        addAssistantMessage("Error, please try again.", player, state);
    } finally {
        state.isProcessing = false;
    }
}

function sendToGPT4(userMessage, history) {
    const API_KEY = 'YOUR_API_KEY'; // Replace with your actual key

    return fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'You are a helpful assistant for dividing the rewards of a project.' },
                ...history,
                { role: 'user', content: userMessage }
            ],
            temperature: 0.7,
            max_tokens: 1000
        })
    })
    .then(res => res.json())
    .then(data => data.choices[0].message.content);
}

document.addEventListener('DOMContentLoaded', () => {
    setupChat(1);
    setupChat(2);
});
