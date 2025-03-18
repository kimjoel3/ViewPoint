// UI management for ViewPoint

// Global variable to store conversation history
let conversationHistory = {};

// Define scrollToBottom function globally
function scrollToBottom(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollTop = element.scrollHeight;
    }
}

// Make it available globally
window.scrollToBottom = scrollToBottom;

// Display messages for the selected tab
function displayMessagesForTab(tab) {
    // Get chat messages container
    const chatMessages = document.getElementById("chat-messages");
    
    if (!chatMessages) return;

    console.log("Displaying messages for tab:", tab);
    console.log("Available conversations:", conversationHistory?.conversations);
    
    // Clear existing messages first
    chatMessages.innerHTML = "";
    
    // Keep track of displayed messages to prevent duplicates
    const displayedMessages = new Set();

    if (conversationHistory && conversationHistory.conversations && conversationHistory.conversations[tab]) {
        conversationHistory.conversations[tab].forEach((message, index) => {
            // Create a unique identifier for this message pair
            const msgId = `${tab}-${index}-${message.user.substring(0, 10)}`;
            
            // Skip if we've already displayed this message
            if (displayedMessages.has(msgId)) return;
            displayedMessages.add(msgId);
            
            // Create container for the user message (right-aligned)
            const userDiv = document.createElement("div");
            userDiv.className = "user-message";
            userDiv.innerHTML = '<p style="text-align: left;"><strong>You:</strong> ' + message.user + "</p>";
            chatMessages.appendChild(userDiv);

            // Create container for the AI response (left-aligned)
            if (message.ai) {
                const aiDiv = document.createElement("div");
                aiDiv.className = "ai-message";
                aiDiv.innerHTML = '<p style="text-align: left;"><strong>' + perspectives[tab] + ":</strong> " + message.ai + "</p>";
                chatMessages.appendChild(aiDiv);
            }
        });
        scrollToBottom("chat-messages");
    }
}

// Update chat interface and store conversation history - FIXED VERSION
function updateChatInterface(data) {
    const activeTab = document.querySelector(".tab.active");
    const currentTab = activeTab ? activeTab.getAttribute("data-tab") : selectedPerspectives[0];
    
    console.log("Update chat interface with data:", data);
    console.log("Current active tab:", currentTab);
    
    // Initialize conversation history if needed
    if (!conversationHistory.conversations) conversationHistory.conversations = {};
    
    // Ensure we have data in the expected format
    if (!data || !data.conversations || !data.conversations[currentTab]) {
        console.error("Invalid data format or missing conversations for current tab:", currentTab);
        return;
    }
    
    // Process data for ALL perspectives
    if (data.conversations) {
        // Loop through all perspectives in the data
        Object.keys(data.conversations).forEach(tabKey => {
            if (!data.conversations[tabKey] || !Array.isArray(data.conversations[tabKey])) return;
            
            // Initialize this tab in conversation history if it doesn't exist
            if (!conversationHistory.conversations[tabKey]) {
                conversationHistory.conversations[tabKey] = [];
            }
            
            // Get the latest user input from the incoming data
            const newMessages = data.conversations[tabKey];
            
            // Enhanced duplicate detection - compare timestamps or message indices if available
            // Otherwise, use a more sophisticated comparison method than simple string concatenation
            const existingMessages = conversationHistory.conversations[tabKey];
            
            for (const newMsg of newMessages) {
                // Only add if it's not a duplicate - check if this exact pair already exists
                let isDuplicate = false;
                
                for (const existingMsg of existingMessages) {
                    // Compare both user and AI parts of the message
                    if (existingMsg.user === newMsg.user && existingMsg.ai === newMsg.ai) {
                        isDuplicate = true;
                        break;
                    }
                }
                
                if (!isDuplicate) {
                    console.log("Adding new message for tab", tabKey, ":", newMsg);
                    existingMessages.push(newMsg);
                }
            }
        });
    }
    
    // Display messages for the current tab
    displayMessagesForTab(currentTab);
    scrollToBottom("chat-messages");
}

// Send message function
function sendMessage() {
    const userInput = document.getElementById("user-input").value.trim();
    if (!userInput) return;

    // If perspectives haven't been fetched yet, fetch them
    if (Object.keys(perspectives).length === 0) {
        document.getElementById("subheading").textContent = "Step 2: Select 3 perspectives";
        fetchPerspectives(userInput);
    } else {
        // If we're in the chat phase, send a follow-up message
        const activeTab = document.querySelector(".tab.active");
        const currentTab = activeTab ? activeTab.getAttribute("data-tab") : selectedPerspectives[0];
        
        // Clear input field
        document.getElementById("user-input").value = "";
        
        // Show loading spinner
        const spinner = document.getElementById("loading-spinner");
        spinner.innerHTML = '<span class="spinner-icon"></span> Loading follow-up response...';
        spinner.style.display = "flex";
        
        // Send API request
        API.sendFollowUp(userInput, currentTab, selectedPerspectives)
            .then((data) => {
                updateChatInterface(data);
                spinner.style.display = "none";
            })
            .catch((error) => {
                spinner.style.display = "none";
                console.error("Error sending message:", error);
                alert("Error sending message. Please try again.");
            });
    }
}

// Create error message element
function createErrorMessage(message, container) {
    const errorDiv = document.createElement("div");
    errorDiv.style.textAlign = "center";
    errorDiv.style.margin = "15px 0";
    errorDiv.style.padding = "10px";
    errorDiv.style.backgroundColor = "#ffebee";
    errorDiv.style.color = "#c62828";
    errorDiv.style.borderRadius = "8px";
    errorDiv.textContent = message;
    
    container.appendChild(errorDiv);
    return errorDiv;
}

// Create loading indicator
function createLoadingIndicator(message, containerId) {
    const container = document.getElementById(containerId);
    
    const loadingDiv = document.createElement("div");
    loadingDiv.id = containerId + "-loading";
    loadingDiv.style.textAlign = "center";
    loadingDiv.style.margin = "15px 0";
    loadingDiv.innerHTML = 
        `<div style="display: inline-block; padding: 10px; border-radius: 10px; background: #f0f0f0;">
            <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: #9a6abf; margin-right: 10px; animation: pulse 1s infinite;"></span>
            ${message}
        </div>`;
    
    container.appendChild(loadingDiv);
    return loadingDiv;
}

// Remove loading indicator
function removeLoadingIndicator(containerId) {
    const loadingElement = document.getElementById(containerId + "-loading");
    if (loadingElement) {
        loadingElement.remove();
    }
}

// Create and add a button
function createButton(text, className, clickHandler, styles = {}) {
    const button = document.createElement("button");
    button.textContent = text;
    button.className = className;
    
    // Apply styles
    Object.entries(styles).forEach(([property, value]) => {
        button.style[property] = value;
    });
    
    // Add click handler
    if (clickHandler) {
        button.addEventListener("click", clickHandler);
    }
    
    return button;
}

// Set active tab
function setActiveTab(tabKey) {
    document.querySelectorAll(".tab").forEach(tab => {
        if (tab.getAttribute("data-tab") === tabKey) {
            tab.classList.add("active");
        } else {
            tab.classList.remove("active");
        }
    });
    
    displayMessagesForTab(tabKey);
}

// Clear UI elements
function clearElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = "";
    }
}

// Check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Show notification 
function showNotification(message, type = "info", duration = 3000) {
    // Create notification element
    const notification = document.createElement("div");
    notification.className = "notification " + type;
    notification.textContent = message;
    
    // Style the notification
    notification.style.position = "fixed";
    notification.style.bottom = "20px";
    notification.style.right = "20px";
    notification.style.padding = "15px 20px";
    notification.style.borderRadius = "8px";
    notification.style.maxWidth = "300px";
    notification.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
    notification.style.zIndex = "1000";
    notification.style.animation = "fadeIn 0.3s, fadeOut 0.3s " + (duration - 300) + "ms";
    
    // Set color based on type
    if (type === "error") {
        notification.style.backgroundColor = "#f44336";
        notification.style.color = "white";
    } else if (type === "success") {
        notification.style.backgroundColor = "#4caf50";
        notification.style.color = "white";
    } else {
        notification.style.backgroundColor = "#2196f3";
        notification.style.color = "white";
    }
    
    // Add to document
    document.body.appendChild(notification);
    
    // Remove after duration
    setTimeout(() => {
        notification.remove();
    }, duration);
}

// Set header subtitle
function setSubheading(text) {
    const subheading = document.getElementById("subheading");
    if (subheading) {
        subheading.textContent = text;
    }
}

// Add this function to ui.js
function showLoading(message, elementId = null) {
    // Remove any existing loading indicators first
    const existingLoaders = document.querySelectorAll('[id$="-loading"]');
    existingLoaders.forEach(loader => loader.remove());
    
    // If no specific element to append to, use chat-messages
    const container = elementId ? document.getElementById(elementId) : document.getElementById("chat-messages");
    if (!container) return null;
    
    // Create a new loading indicator
    const loadingDiv = document.createElement("div");
    loadingDiv.id = "global-loading-indicator";
    loadingDiv.style.textAlign = "center";
    loadingDiv.style.margin = "15px 0";
    loadingDiv.innerHTML = 
        `<div style="display: inline-block; padding: 10px; border-radius: 10px; background: #f0f0f0;">
            <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: #9a6abf; margin-right: 10px; animation: pulse 1s infinite;"></span>
            ${message}
        </div>`;
    
    container.appendChild(loadingDiv);
    
    // Scroll to bottom if applicable
    if (typeof scrollToBottom === 'function') {
        scrollToBottom(elementId || "chat-messages");
    }
    
    return loadingDiv;
}

// Add this function to remove loading indicators
function hideLoading() {
    const loadingElement = document.getElementById("global-loading-indicator");
    if (loadingElement) {
        loadingElement.remove();
    }
}