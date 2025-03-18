// Perspectives handling for ViewPoint
// Global variables for perspectives
let selectedPerspectives = [];
let perspectives = {};

// perspectives.js (loaded after debate.js)

// Fetch perspectives from user input
// In fetchPerspectives:
// fetchPerspectives(userInput) – simplified example
function fetchPerspectives(userInput) {
    // Save the user’s initial question for later
    initialUserInput = userInput;
    
    API.fetchPerspectives(userInput)
      .then(data => {
        if (data.perspectives) {
          // 1) Store the server’s dictionary in window.perspectives
          window.perspectives = data.perspectives;
          // 2) Also store it locally if needed
          perspectives = data.perspectives;
          
          // 3) Now render them in the UI
          displayPerspectives();
        } else {
          console.error("No perspectives found in response:", data);
        }
      })
      .catch(error => {
        console.error("Error fetching perspectives:", error);
      });
  }
  


// Display the perspectives as selectable items
function displayPerspectives() {
    const list = document.getElementById("perspective-list");
    list.innerHTML = "";
  
    // 'window.perspectives' should look like { "1": "Peacekeeper", "2": "Cost-split minimalist", ... }
    Object.entries(window.perspectives).forEach(([key, text]) => {
      // 'key' will be "1" or "2" or "3" etc.
      // 'text' will be "Peacekeeper – conciliatory" or "Cost-split minimalist"
  
      const button = document.createElement("button");
      button.className = "perspective-item";
      button.textContent = text;         // <--- The label
      button.setAttribute("data-key", key);
  
      button.addEventListener("click", () => {
        // If they unselect it
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
        window.selectedPerspectives = [...selectedPerspectives];
        // Hide the global input bar
        document.querySelector(".input-container").style.display = "none";
        
        API.getInitialResponses(initialUserInput, selectedPerspectives)
    .then(data => {
        console.log("Initial responses received:", data);
        console.log("Conversation data structure:", data.conversations);
        
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

    // Wait for debate.js to fully load
    if (typeof window.showDebateSelection !== 'function') {
        console.warn("Waiting for debate.js to load...");
        setTimeout(initiateDebateFeature, 100);
        return;
    }

    // Proceed with initializing the debate feature
    console.log("Debate feature loaded successfully.");

    // Check if debate.js is loaded
    if (typeof window.showDebateSelection !== 'function') {
        console.error("Error: showDebateSelection function is not defined. Ensure debate.js is loaded before perspectives.js.");
        return;
    }

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

    // Add click event safely
    debateButton.addEventListener("click", function () {
        if (typeof window.showDebateSelection === 'function') {
            window.showDebateSelection();
        } else {
            console.error("Error: showDebateSelection function is not available.");
        }
    });

    // Add button to the page
    contentArea.appendChild(debateButton);
    console.log("Debate button added to content area");
}


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
    if (window.isSubmitting) {
        console.log("Already submitting, ignoring duplicate call");
        return;
    }
    
    const userInput = document.getElementById("chat-input").value.trim();
    if (!userInput)return;

    window.isSubmitting = true;
    
    const activeTab = document.querySelector(".tab.active");
    const currentTab = activeTab ? activeTab.getAttribute("data-tab") : selectedPerspectives[0];

    console.log("Sending chat message to perspective:", currentTab);
    console.log("User input:", userInput);

    const chatMessages = document.getElementById("chat-messages");
    if (!chatMessages) {
        console.error("Chat messages container not found!");
        alert("Error: Chat container not found. Please refresh the page.");
        window.isSubmitting = false;
        return;
    }

    // Clear input
    document.getElementById("chat-input").value = "";
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

    if (typeof scrollToBottom === 'function') {
        scrollToBottom("chat-messages");
    } else {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Send message to API
    API.sendFollowUp(userInput, currentTab, selectedPerspectives)
        .then(data => {
            // Remove loading indicator
            const loadingElement = document.getElementById("chat-loading");
            if (loadingElement) {
                loadingElement.remove();
            }

            // Call the updateChatInterface function from ui.js
            if (typeof window.updateChatInterface === 'function') {
                window.updateChatInterface(data);
            } else {
                console.error("Error: updateChatInterface function not found in global scope.");
            }

            document.getElementById("chat-input").disabled = false;
            document.getElementById("chat-input").focus();
            window.isSubmitting = false;
        })
        .catch(error => {
            console.error("Error in sendChatMessage:", error);

            const loadingElement = document.getElementById("chat-loading");
            if (loadingElement) {
                loadingElement.remove();
            }

            const errorDiv = document.createElement("div");
            errorDiv.style.textAlign = "center";
            errorDiv.style.margin = "15px 0";
            errorDiv.style.padding = "10px";
            errorDiv.style.backgroundColor = "#ffebee";
            errorDiv.style.color = "#c62828";
            errorDiv.style.borderRadius = "8px";
            errorDiv.textContent = "Error: " + (error.message || "Failed to get a response. Please try again.");
            chatMessages.appendChild(errorDiv);

            document.getElementById("chat-input").disabled = false;
            window.isSubmitting = false;
        });
}
