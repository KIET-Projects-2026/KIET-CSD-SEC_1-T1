document.addEventListener('DOMContentLoaded', function() {
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    const clearBtn = document.getElementById('clearBtn');
    const chatMessages = document.getElementById('chatMessages');
    const loading = document.getElementById('loading');

    // Auto-resize textarea
    messageInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = this.scrollHeight + 'px';
    });

    // Send message on button click
    sendBtn.addEventListener('click', sendMessage);

    // Send message on Enter key (Shift+Enter for new line)
    messageInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Clear chat
    clearBtn.addEventListener('click', clearChat);

    async function sendMessage() {
        const message = messageInput.value.trim();
        if (!message) return;

        // Disable input and button
        messageInput.disabled = true;
        sendBtn.disabled = true;
        
        // Add user message to chat
        addMessage(message, 'user');
        
        // Clear input
        messageInput.value = '';
        messageInput.style.height = 'auto';
        
        // Show loading
        loading.style.display = 'flex';
        
        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: message })
            });
            
            const data = await response.json();
            
            if (data.success) {
                addMessage(data.bot_response, 'bot', true);
            } else {
                addMessage('Sorry, there was an error processing your request.', 'bot');
            }
        } catch (error) {
            console.error('Error:', error);
            addMessage('Sorry, there was a network error. Please try again.', 'bot');
        }
        
        // Hide loading
        loading.style.display = 'none';
        
        // Re-enable input and button
        messageInput.disabled = false;
        sendBtn.disabled = false;
        messageInput.focus();
    }

    function addMessage(content, sender, isHtml = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        const icon = document.createElement('i');
        icon.className = sender === 'user' ? 'fas fa-user' : 'fas fa-robot';
        
        const textSpan = document.createElement('span');
        if (isHtml) {
            textSpan.innerHTML = content;
        } else {
            textSpan.textContent = content;
        }
        
        contentDiv.appendChild(icon);
        contentDiv.appendChild(textSpan);
        messageDiv.appendChild(contentDiv);
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async function clearChat() {
        if (confirm('Are you sure you want to clear the chat history?')) {
            try {
                await fetch('/clear', { method: 'POST' });
                
                // Clear messages except the welcome message
                const messages = chatMessages.querySelectorAll('.message');
                messages.forEach((message, index) => {
                    if (index > 0) { // Keep the first welcome message
                        message.remove();
                    }
                });
            } catch (error) {
                console.error('Error clearing chat:', error);
            }
        }
    }
});
