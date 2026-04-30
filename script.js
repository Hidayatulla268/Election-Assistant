document.addEventListener('DOMContentLoaded', () => {
    // Tab Switching Logic
    const navButtons = document.querySelectorAll('.nav-btn');
    const views = document.querySelectorAll('.view');
    const viewTitle = document.getElementById('view-title');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            navButtons.forEach(b => b.classList.remove('active'));
            views.forEach(v => {
                v.classList.remove('active');
                v.setAttribute('aria-hidden', 'true');
            });

            // Add active class to clicked
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-target');
            const targetView = document.getElementById(targetId);
            
            if (targetView) {
                targetView.classList.add('active');
                targetView.setAttribute('aria-hidden', 'false');
                
                // Update Title
                let titleText = 'The Election Process';
                if (targetId === 'timeline-view') titleText = 'Election Timeline';
                if (targetId === 'assistant-view') titleText = 'AI Assistant';
                if (targetId === 'civic-view') titleText = 'Civic Information';
                viewTitle.textContent = titleText;
            }
        });
    });

    // Gemini API Chatbot Logic
    // SECURITY WARNING: Hardcoded keys will be revoked by GitHub. 
    // We now prompt the user for a key if it's not provided, making it safe to host.
    let GEMINI_API_KEY = ""; // Leave blank for GitHub Pages
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const chatMessages = document.getElementById('chat-messages');

    // System prompt to ensure the assistant acts neutrally and focuses on the Indian election process
    const systemInstruction = "You are a helpful, neutral, and factual AI assistant designed to explain the Indian election process, timelines, and steps to voters. You must remain completely politically neutral. Do not express political preferences, endorse candidates, or take stances on controversial political topics. Your role is purely educational.";

    async function sendMessageToGemini(userText) {
        if (!GEMINI_API_KEY) {
            GEMINI_API_KEY = prompt("To use the AI Assistant, please enter your Gemini API Key:");
            if (!GEMINI_API_KEY) {
                addMessage("API Key is required to use the assistant. You can get one for free at Google AI Studio.", 'bot');
                return;
            }
        }

        addMessage(userText, 'user');
        chatInput.value = '';
        sendBtn.disabled = true;

        // Add loading indicator
        const loadingId = 'loading-' + Date.now();
        addLoadingIndicator(loadingId);

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [
                        { role: "user", parts: [{ text: systemInstruction + "\n\nUser Question: " + userText }] }
                    ]
                })
            });

            const data = await response.json();
            removeElement(loadingId);

            if (data.candidates && data.candidates.length > 0) {
                const botText = data.candidates[0].content.parts[0].text;
                addMessage(botText, 'bot');
            } else {
                addMessage("I'm sorry, I couldn't generate a response. Please try again.", 'bot');
            }
        } catch (error) {
            console.error("Gemini API Error:", error);
            removeElement(loadingId);
            addMessage("An error occurred while communicating with the AI. Please check your connection or API key.", 'bot');
        } finally {
            sendBtn.disabled = false;
            chatInput.focus();
            scrollToBottom();
        }
    }

    function addMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}`;
        
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'avatar';
        avatarDiv.innerHTML = sender === 'user' ? '<span class="material-icons-round">person</span>' : '<span class="material-icons-round">smart_toy</span>';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        // Simple markdown parsing for bold and line breaks
        let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formattedText = formattedText.replace(/\n/g, '<br>');
        contentDiv.innerHTML = formattedText;
        
        msgDiv.appendChild(avatarDiv);
        msgDiv.appendChild(contentDiv);
        chatMessages.appendChild(msgDiv);
        scrollToBottom();
    }

    function addLoadingIndicator(id) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message bot`;
        msgDiv.id = id;
        
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'avatar';
        avatarDiv.innerHTML = '<span class="material-icons-round">smart_toy</span>';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content loading-indicator';
        contentDiv.innerHTML = '<div class="loading-dot"></div><div class="loading-dot"></div><div class="loading-dot"></div>';
        
        msgDiv.appendChild(avatarDiv);
        msgDiv.appendChild(contentDiv);
        chatMessages.appendChild(msgDiv);
        scrollToBottom();
    }

    function removeElement(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }

    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    sendBtn.addEventListener('click', () => {
        const text = chatInput.value.trim();
        if (text) sendMessageToGemini(text);
    });

    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const text = chatInput.value.trim();
            if (text) sendMessageToGemini(text);
        }
    });

    // Civic Information API Logic
    let CIVIC_API_KEY = ""; // Leave blank for GitHub Pages
    const civicInput = document.getElementById('civic-input');
    const civicSearchBtn = document.getElementById('civic-search-btn');
    const civicResults = document.getElementById('civic-results');

    async function searchCivicInfo(address) {
        if (!CIVIC_API_KEY) {
            CIVIC_API_KEY = prompt("To use Civic Info Lookup, please enter your Google Civic API Key:");
            if (!CIVIC_API_KEY) {
                civicResults.innerHTML = `<div class="result-item" style="color: #ef4444;">API Key is required.</div>`;
                return;
            }
        }

        civicResults.innerHTML = '<div class="result-item"><div class="loading-indicator" style="padding:0;"><div class="loading-dot"></div><div class="loading-dot"></div><div class="loading-dot"></div></div></div>';
        
        try {
            // Note: Google Civic API primarily supports US addresses.
            const response = await fetch(`https://www.googleapis.com/civicinfo/v2/representatives?address=${encodeURIComponent(address)}&key=${CIVIC_API_KEY}`);
            const data = await response.json();
            
            civicResults.innerHTML = ''; // Clear loading

            if (data.error) {
                civicResults.innerHTML = `<div class="result-item" style="color: #ef4444;">Error: ${data.error.message}</div>`;
                return;
            }

            if (!data.officials || data.officials.length === 0) {
                civicResults.innerHTML = `<div class="result-item">No civic data found for this address. Note that Google Civic Information API primarily provides extensive coverage for the United States. Coverage for India may be limited or unavailable.</div>`;
                return;
            }

            // Render results
            data.officials.slice(0, 5).forEach((official, index) => {
                const office = data.offices.find(o => o.officialIndices.includes(index));
                const officeName = office ? office.name : 'Official';
                const party = official.party ? `<br><small style="color: var(--text-muted);">${official.party}</small>` : '';
                const channels = official.channels ? official.channels.map(c => `${c.type}: ${c.id}`).join('<br>') : '';
                
                const resultDiv = document.createElement('div');
                resultDiv.className = 'result-item';
                resultDiv.innerHTML = `
                    <h4 style="margin-bottom: 0.5rem; font-size: 1.1rem; color: #fff;">${official.name}</h4>
                    <p style="color: var(--text-secondary); margin-bottom: 0.5rem;"><strong>${officeName}</strong>${party}</p>
                    ${channels ? `<p style="font-size: 0.85rem; color: var(--text-muted);">${channels}</p>` : ''}
                `;
                civicResults.appendChild(resultDiv);
            });

        } catch (error) {
            console.error("Civic API Error:", error);
            civicResults.innerHTML = `<div class="result-item" style="color: #ef4444;">Failed to fetch data. Please try again.</div>`;
        }
    }

    civicSearchBtn.addEventListener('click', () => {
        const address = civicInput.value.trim();
        if (address) searchCivicInfo(address);
    });

    civicInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const address = civicInput.value.trim();
            if (address) searchCivicInfo(address);
        }
    });
});
