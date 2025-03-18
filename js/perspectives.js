// Perspectives handling for ViewPoint
// Global variables for perspectives
let selectedPerspectives = [];
let perspectives = {};

// Fetch perspectives from user input
function fetchPerspectives(userInput) {
    initialUserInput = userInput;
    
    API.fetchPerspectives(userInput)
        .then(data => {
            if (data.perspectives) {
                perspectives = data.perspectives;
                displayPerspectives();
            } else {
                console.error("No perspectives found in response:", data);
            }
        });
}

// Display the perspectives as selectable items
function displayPerspectives() {
    const list = document.getElementById("perspective-list");
    list.innerHTML = "";

    console.log("Perspectives to Render:", perspectives);

    Object.entries(perspectives).forEach(([key, text]) => {
        const button = document.createElement("button");
        button.className = "perspective-item";
        button.textContent = text;
        button.setAttribute("data-key", key);

        button.addEventListener("click", () => {
            if (selectedPerspectives.includes(key)) {
                selectedPerspectives = selectedPerspectives.filter(k => k !== key);
                button.classList.remove("selected");
            } else if (selectedPerspectives.length < 3) {
                selectedPerspectives.push(key);
                button.classList.add("selected");
            }
            console.log("Selected Perspectives:", selectedPerspectives);
        });

        list.appendChild(button);
    });
}

function confirmPerspectivesAndInitializeChat() {
    if (selectedPerspectives.length === 3) {
        // Hide the global input bar
        document.querySelector(".input-container").style.display = "none";
        
        API.getInitialResponses(initialUserInput, selectedPerspectives)
            .then(data => {
                document.getElementById("chat-container").style.display = "block";
                document.getElementById("subheading").textContent = "Step 3: Follow-up with specific perspectives";
                
                createChatTabs();
                updateChatInterface(data);
                
                document.querySelector("h1").style.display = "none";
                document.getElementById("perspective-list").style.display = "none";
                document.getElementById("confirm-selection").style.display = "none";
                
                // Add chat input container
                addChatInputContainer();
                
                // Explicitly initialize the debate feature after chat setup is complete
                setTimeout(function() {
                    initiateDebateFeature();
                    
                    // Make sure the debate button is visible
                    const debateButton = document.getElementById("start-debate-btn");
                    if (debateButton) {
                        debateButton.style.display = "block";
                    }
                }, 100);
            })
            .catch((error) => {
                console.error("Error confirming perspectives:", error);
                // If there's an error, show the input bar again
                document.querySelector(".input-container").style.display = "flex";
            });
    } else {
        alert("Please select exactly 3 perspectives.");
    }
}

// Ensure the debate.js file is properly loaded
// Add this debug code to the top of debate.js
console.log("Debate.js loaded and running");

// Modified initiateDebateFeature function with better error handling
function initiateDebateFeature() {
    console.log("Initializing debate feature");
    
    // Check if button already exists
    if (document.getElementById("start-debate-btn")) {
        console.log("Debate button already exists");
        return;
    }
    
    // Check if the content area exists
    const contentArea = document.querySelector(".content");
    if (!contentArea) {
        console.error("Content area not found - cannot add debate button");
        return;
    }
    
    // Store chat state for later restoration
    window.originalChatState = {
        chatDisplay: document.getElementById("chat-container") ? 
            document.getElementById("chat-container").style.display : 'block',
        inputContainerDisplay: document.querySelector(".chat-input-container") ? 
            document.querySelector(".chat-input-container").style.display : 'flex',
        messagesHtml: document.getElementById("chat-messages") ? 
            document.getElementById("chat-messages").innerHTML : ''
    };
    
    console.log("Saved original chat state", window.originalChatState);
    
    // Create debate button
    const debateButton = document.createElement("button");
    debateButton.id = "start-debate-btn";
    debateButton.textContent = "Start Perspective Debate";
    debateButton.className = "feature-button";
    debateButton.style.display = "block";
    debateButton.style.margin = "20px auto";
    debateButton.style.padding = "16px 32px";
    debateButton.style.fontSize = "18px";
    debateButton.style.fontWeight = "bold";
    debateButton.style.background = "#e3d9ee";
    debateButton.style.color = "#7d4f9e";
    debateButton.style.border = "none";
    debateButton.style.borderRadius = "20px";
    debateButton.style.cursor = "pointer";
    debateButton.style.width = "auto";
    debateButton.style.maxWidth = "300px";
    debateButton.style.textAlign = "center";
    debateButton.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.05)";
    
    // Add click event
    debateButton.addEventListener("click", showDebateSelection);
    
    // Add button to the page
    contentArea.appendChild(debateButton);
    console.log("Debate button added to content area");
}

// Add a global function to force initialize the debate feature
window.forceInitializeDebateFeature = function() {
    console.log("Force initializing debate feature");
    if (typeof initiateDebateFeature === 'function') {
        initiateDebateFeature();
    } else {
        console.error("initiateDebateFeature function not found");
    }
};

// Create tabs for each perspective
function createChatTabs() {
    const tabsContainer = document.getElementById("tabs");
    tabsContainer.innerHTML = "";

    selectedPerspectives.forEach((key, index) => {
        const tab = document.createElement("div");
        tab.className = "tab";
        if (index === 0) {
            tab.classList.add("active");
        }
        tab.textContent = perspectives[key];
        tab.setAttribute("data-tab", key);
        tabsContainer.appendChild(tab);
    });

    document.querySelectorAll(".tab").forEach(tab => {
        tab.addEventListener("click", function() {
            document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
            this.classList.add("active");
            displayMessagesForTab(this.getAttribute("data-tab"));
        });
    });
}

// Add chat input container
function addChatInputContainer() {
    const chatContainer = document.getElementById("chat-container");
    
    // Check if the chat input container already exists
    let chatInputContainer = document.querySelector(".chat-input-container");
    
    // If it exists, remove it to prevent duplicate event listeners
    if (chatInputContainer) {
        chatInputContainer.remove();
    }
    
    // Create a new chat input container
    chatInputContainer = document.createElement("div");
    chatInputContainer.className = "chat-input-container";
    chatInputContainer.style.display = "flex";
    chatInputContainer.style.padding = "15px";
    chatInputContainer.style.background = "white";
    chatInputContainer.style.borderTop = "1px solid #eee";
    
    const chatInput = document.createElement("input");
    chatInput.type = "text";
    chatInput.id = "chat-input";
    chatInput.placeholder = "Enter follow-up message for a specific perspective...";
    chatInput.style.flex = "1";
    chatInput.style.padding = "10px 15px";
    chatInput.style.border = "1px solid #ddd";
    chatInput.style.borderRadius = "20px";
    chatInput.style.fontSize = "14px";
    chatInput.style.marginRight = "10px";
    
    // Add the event listener only once
    chatInput.addEventListener("keypress", function(e) {
        if (e.key === "Enter") {
            sendChatMessage();
        }
    });
    
    const chatSendButton = document.createElement("button");
    chatSendButton.innerHTML = "Send";
    chatSendButton.style.padding = "10px 20px";
    chatSendButton.style.background = "#9a6abf";
    chatSendButton.style.color = "white";
    chatSendButton.style.border = "none";
    chatSendButton.style.borderRadius = "20px";
    chatSendButton.style.fontWeight = "bold";
    chatSendButton.style.cursor = "pointer";
    
    // Add the event listener only once
    chatSendButton.addEventListener("click", sendChatMessage);
    
    chatInputContainer.appendChild(chatInput);
    chatInputContainer.appendChild(chatSendButton);
    
    chatContainer.appendChild(chatInputContainer);
}

// Fix for the sendChatMessage function in perspectives.js (from paste-4.txt)
function sendChatMessage() {
    // Prevent multiple submissions with a flag
    if (window.isSubmitting) {
        console.log("Already submitting, ignoring duplicate call");
        return;
    }
    
    const userInput = document.getElementById("chat-input").value.trim();
    if (!userInput) return;

    // Set flag to indicate submission in progress
    window.isSubmitting = true;
    
    // Get the active tab
    const activeTab = document.querySelector(".tab.active");
    const currentTab = activeTab ? activeTab.getAttribute("data-tab") : selectedPerspectives[0];

    console.log("Sending chat message to perspective:", currentTab);
    console.log("User input:", userInput);

    // Add the user message to the UI
    const chatMessages = document.getElementById("chat-messages");
    if (!chatMessages) {
        console.error("Chat messages container not found!");
        alert("Error: Chat container not found. Please refresh the page.");
        window.isSubmitting = false;
        return;
    }

    const userDiv = document.createElement("div");
    userDiv.className = "user-message";
    userDiv.innerHTML = '<p style="text-align: right;"><strong>You:</strong> ' + userInput + '</p>';
    chatMessages.appendChild(userDiv);
    
    // Clear input
    document.getElementById("chat-input").value = "";
    
    // Disable input while waiting for response
    document.getElementById("chat-input").disabled = true;
    
    // Show loading indicator
    const loadingDiv = document.createElement("div");
    loadingDiv.id = "chat-loading";
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
    
    // Send message to API
    try {
        API.sendFollowUp(userInput, currentTab, selectedPerspectives)
            .then(data => {
                // Remove loading indicator
                const loadingElement = document.getElementById("chat-loading");
                if (loadingElement) {
                    loadingElement.remove();
                }
                
                // Check if the data is valid
                if (!data || !data.conversations) {
                    throw new Error("Invalid response format from server");
                }
                
                // Update conversation history
                updateChatInterface(data);
                
                // Re-enable input
                document.getElementById("chat-input").disabled = false;
                document.getElementById("chat-input").focus();
                
                // Reset submission flag
                window.isSubmitting = false;
            })
            .catch(error => {
                console.error("Error in sendChatMessage:", error);
                
                // Remove loading indicator
                const loadingElement = document.getElementById("chat-loading");
                if (loadingElement) {
                    loadingElement.remove();
                }
                
                // Show error message
                const errorDiv = document.createElement("div");
                errorDiv.style.textAlign = "center";
                errorDiv.style.margin = "15px 0";
                errorDiv.style.padding = "10px";
                errorDiv.style.backgroundColor = "#ffebee";
                errorDiv.style.color = "#c62828";
                errorDiv.style.borderRadius = "8px";
                errorDiv.textContent = "Error: " + (error.message || "Failed to get a response. Please try again.");
                chatMessages.appendChild(errorDiv);
                
                // Re-enable input
                document.getElementById("chat-input").disabled = false;
                
                // Reset submission flag
                window.isSubmitting = false;
            });
    } catch (error) {
        console.error("Exception in sendChatMessage:", error);
        
        // Remove loading indicator
        const loadingElement = document.getElementById("chat-loading");
        if (loadingElement) {
            loadingElement.remove();
        }
        
        // Show error message
        const errorDiv = document.createElement("div");
        errorDiv.style.textAlign = "center";
        errorDiv.style.margin = "15px 0";
        errorDiv.style.color = "red";
        errorDiv.textContent = "Error: " + (error.message || "Unknown error occurred");
        chatMessages.appendChild(errorDiv);
        
        // Re-enable input
        document.getElementById("chat-input").disabled = false;
        
        // Reset submission flag
        window.isSubmitting = false;
    }
}