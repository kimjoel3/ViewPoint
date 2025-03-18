// API Interactions for ViewPoint
const API = {
    // Fetch perspectives from user input
    fetchPerspectives: function(userInput) {
        const spinner = document.getElementById("loading-spinner");
        spinner.style.display = "flex";

        return fetch("/get_response", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_input: userInput })
        })
        .then(response => response.json())
        .then(data => {
            spinner.style.display = "none";
            console.log("Backend Response:", data);
            return data;
        })
        .catch(error => {
            spinner.style.display = "none";
            console.error("Error fetching perspectives:", error);
            throw error;
        });
    },

    // Get initial responses for selected perspectives
    getInitialResponses: function(userInput, selectedPerspectives) {
        const spinner = document.getElementById("loading-spinner");
        spinner.innerHTML = '<span class="spinner-icon"></span> Loading responses...';
        spinner.style.display = "flex";

        return fetch("/get_response", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_input: userInput,
                selected_perspectives: selectedPerspectives
            })
        })
        .then(response => response.json())
        .then(data => {
            spinner.style.display = "none";
            console.log("Perspective Confirmation Response:", data);
            return data;
        })
        .catch(error => {
            spinner.style.display = "none";
            console.error("Error confirming perspectives:", error);
            throw error;
        });
    },

    // Send follow-up message to specific perspective
    // Send follow-up message to specific perspective
sendFollowUp: function(userInput, currentTab, selectedPerspectives) {
    // Remove any existing loading indicators first
    const existingLoaders = document.querySelectorAll('[id$="-loading"]');
    existingLoaders.forEach(loader => loader.remove());
    
    // Get the main spinner if it exists
    const spinner = document.getElementById("loading-spinner");
    if (spinner) {
        spinner.innerHTML = '<span class="spinner-icon"></span> Loading follow-up response...';
        spinner.style.display = "flex";
    }
    
    // Add perspective-specific loading indicator to chat
    const chatMessages = document.getElementById("chat-messages");
    if (chatMessages) {
        const loadingDiv = document.createElement("div");
        loadingDiv.id = "global-loading-indicator";
        loadingDiv.style.textAlign = "center";
        loadingDiv.style.margin = "15px 0";
        loadingDiv.innerHTML = 
            `<div style="display: inline-block; padding: 10px; border-radius: 10px; background: #f0f0f0;">
                <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: #9a6abf; margin-right: 10px; animation: pulse 1s infinite;"></span>
                ${perspectives[currentTab] || "The perspective"} is responding...
            </div>`;
        
        chatMessages.appendChild(loadingDiv);
        
        // Scroll to bottom
        if (typeof scrollToBottom === 'function') {
            scrollToBottom("chat-messages");
        } else {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    return fetch("/get_response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            user_input: userInput,
            tab: currentTab,
            selected_perspectives: selectedPerspectives
        })
    })
    .then(response => response.json())
    .then(data => {
        // Hide all loading indicators
        if (spinner) {
            spinner.style.display = "none";
        }
        
        const globalLoading = document.getElementById("global-loading-indicator");
        if (globalLoading) {
            globalLoading.remove();
        }
        
        console.log("New Message Response:", data);
        return data;
    })
    .catch(error => {
        // Hide all loading indicators
        if (spinner) {
            spinner.style.display = "none";
        }
        
        const globalLoading = document.getElementById("global-loading-indicator");
        if (globalLoading) {
            globalLoading.remove();
        }
        
        console.error("Error sending message:", error);
        throw error;
    });
},

    // Get debate response
    getDebateResponse: function(params) {
        return fetch("/get_debate_response", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(params)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("API response was not ok");
            }
            return response.json();
        })
        .then(data => {
            if (data.response) {
                return data;
            } else {
                throw new Error("No response in API data");
            }
        });
    },

    // Get debate counterpoint
    getDebateCounterpoint: function(params) {
        return fetch("/get_debate_counterpoint", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(params)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("API response was not ok");
            }
            return response.json();
        })
        .then(data => {
            if (data.response) {
                return data;
            } else {
                throw new Error("No response in API data");
            }
        });
    }
};