// Debate feature management
// Global variables for debate
let debatePerspectives = [];
let debateActive = false;
let debateSessionId = null;


if (!window.debatePerspectives) {
    window.debatePerspectives = [];
  }

if (typeof window.perspectives === 'undefined') {
    window.perspectives = {};
}
if (typeof window.selectedPerspectives === 'undefined') {
    window.selectedPerspectives = [];
}

// Safe element access helper
function safeGetElement(id, fallbackAction) {
    const element = document.getElementById(id);
    if (!element && typeof fallbackAction === 'function') {
        console.warn(`Element with id '${id}' not found, using fallback`);
        return fallbackAction();
    }
    return element;
}

// Safe method to set innerHTML
function setInnerHTML(element, html) {
    if (element) {
        element.innerHTML = html;
    } else {
        console.error("Attempted to set innerHTML on null element");
    }
}

function showDebateButtons() {
    // Create button container
    const buttonContainer = document.createElement("div");
    buttonContainer.className = "debate-buttons";
    buttonContainer.id = "debate-buttons";
    buttonContainer.style.display = "flex";
    buttonContainer.style.justifyContent = "center";
    buttonContainer.style.gap = "10px";
    buttonContainer.style.margin = "15px 0";
    
    // Create button for perspective 1
    const button1 = document.createElement("button");
    button1.className = "debate-continue-btn";
    button1.textContent = `Let ${perspectives[debatePerspectives[0]]} respond`;
    button1.setAttribute("data-perspective", debatePerspectives[0]);
    button1.style.padding = "10px 15px";
    button1.style.background = "#f1e6fb";
    button1.style.color = "#333";
    button1.style.border = "none";
    button1.style.borderRadius = "20px";
    button1.style.fontWeight = "bold";
    button1.style.cursor = "pointer";
    
    button1.addEventListener("click", function() {
        continueDebate(debatePerspectives[0]);
    });
    
    // Create button for perspective 2
    const button2 = document.createElement("button");
    button2.className = "debate-continue-btn";
    button2.textContent = `Let ${perspectives[debatePerspectives[1]]} respond`;
    button2.setAttribute("data-perspective", debatePerspectives[1]);
    button2.style.padding = "10px 15px";
    button2.style.background = "#e6f0fa";
    button2.style.color = "#333";
    button2.style.border = "none";
    button2.style.borderRadius = "20px";
    button2.style.fontWeight = "bold";
    button2.style.cursor = "pointer";
    
    button2.addEventListener("click", function() {
        continueDebate(debatePerspectives[1]);
    });
    
    // Create new topic button
    const newTopicButton = document.createElement("button");
    newTopicButton.className = "debate-newtopic-btn";
    newTopicButton.textContent = "New Topic";
    newTopicButton.style.padding = "10px 15px";
    newTopicButton.style.background = "#e3d9ee";
    newTopicButton.style.color = "#7d4f9e";
    newTopicButton.style.border = "none";
    newTopicButton.style.borderRadius = "20px";
    newTopicButton.style.fontWeight = "bold";
    newTopicButton.style.cursor = "pointer";
    
    newTopicButton.addEventListener("click", function() {
        // Remove buttons
        const buttonsElement = document.getElementById("debate-buttons");
        if (buttonsElement) {
            buttonsElement.remove();
        }
        
        // Enable input
        const debateInput = document.getElementById("debate-input");
        if (debateInput) {
            debateInput.disabled = false;
            debateInput.focus();
        }
        
        const debateSendBtn = document.getElementById("debate-send-btn");
        if (debateSendBtn) {
            debateSendBtn.disabled = false;
            debateSendBtn.textContent = "Start";
        }
    });
    
    // Add exit debate button
    const exitButton = document.createElement("button");
    exitButton.className = "debate-exit-btn";
    exitButton.textContent = "Exit Debate";
    exitButton.style.padding = "10px 15px";
    exitButton.style.background = "#f0f0f0";
    exitButton.style.color = "#333";
    exitButton.style.border = "none";
    exitButton.style.borderRadius = "20px";
    exitButton.style.fontWeight = "bold";
    exitButton.style.cursor = "pointer";
    
    exitButton.addEventListener("click", exitDebateMode);
    
    // Add buttons to container
    buttonContainer.appendChild(button1);
    buttonContainer.appendChild(button2);
    buttonContainer.appendChild(newTopicButton);
    buttonContainer.appendChild(exitButton);
    
    // Add to debate messages
    const debateMessages = document.getElementById("debate-messages");
    if (debateMessages) {
        debateMessages.appendChild(buttonContainer);
        // Scroll to bottom
        scrollToBottom("debate-messages");
    }
}


// Initialize the debate button
function initiateDebateFeature() {
    // Check if button already exists
    if (document.getElementById("start-debate-btn")) {
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
    debateButton.style.width = "25%";
    debateButton.style.textAlign = "center";
    debateButton.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.05)";
    
    // Add click event
    debateButton.addEventListener("click", showDebateSelection);
    
    // Add button to the page
    const contentArea = document.querySelector(".content");
    if (contentArea) {
        contentArea.appendChild(debateButton);
        console.log("Debate button added to the page");
    } else {
        console.error("Content area not found, cannot add debate button");
    }
}

// Show perspective selection for debate
// Show perspective selection for debate
// Show perspective selection for debate
function showDebateSelection() {
    console.log("Running showDebateSelection...");

    // Hide the debate button
    const debateButton = document.getElementById("start-debate-btn");
    if (debateButton) {
        debateButton.style.display = "none";
    }

    // Create selection container
    const selectionContainer = document.createElement("div");
    selectionContainer.id = "debate-selection";
    selectionContainer.style.width = "100%";
    selectionContainer.style.maxWidth = "600px";
    selectionContainer.style.margin = "20px auto";
    selectionContainer.style.padding = "20px";
    selectionContainer.style.background = "white";
    selectionContainer.style.borderRadius = "10px";
    selectionContainer.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.1)";
    selectionContainer.style.textAlign = "center";

    // Reset debatePerspectives
    window.debatePerspectives = [];

    // Create heading
    const heading = document.createElement("h3");
    heading.textContent = "Select two perspectives to debate";
    heading.style.marginBottom = "20px";
    heading.style.color = "#7d4f9e";
    selectionContainer.appendChild(heading);

    // Create perspective selection container
    const perspectiveButtonContainer = document.createElement("div");
    perspectiveButtonContainer.style.display = "flex";
    perspectiveButtonContainer.style.flexWrap = "wrap";
    perspectiveButtonContainer.style.gap = "10px";
    perspectiveButtonContainer.style.justifyContent = "center";
    perspectiveButtonContainer.style.marginBottom = "20px";

    // Add buttons only for the 3 previously selected perspectives
    window.selectedPerspectives.forEach((key) => {
        const button = document.createElement("button");
        button.className = "debate-perspective-btn";
        
        // Use the perspective text from the previously generated perspectives
        button.textContent = window.perspectives[key];
        button.setAttribute("data-key", key);
        button.style.padding = "10px 15px";
        button.style.border = "2px solid #9a6abf";
        button.style.borderRadius = "8px";
        button.style.background = "white";
        button.style.color = "#333";
        button.style.fontWeight = "bold";
        button.style.cursor = "pointer";
        button.style.margin = "5px";

        button.addEventListener("click", function () {
            const key = this.getAttribute("data-key");
            debatePerspectives.push(key);

            // Toggle selection
            if (window.debatePerspectives.includes(key)) {
                window.debatePerspectives = window.debatePerspectives.filter((p) => p !== key);
                this.style.background = "white";
                this.style.color = "#333";
            } else if (window.debatePerspectives.length < 2) {
                window.debatePerspectives.push(key);
                this.style.background = "#9a6abf";
                this.style.color = "white";
            }

            // Enable/disable confirm button
            const confirmButton = document.getElementById("confirm-debate-btn");
            if (confirmButton) {
                if (window.debatePerspectives.length === 2) {
                    confirmButton.disabled = false;
                    confirmButton.style.opacity = "1";
                } else {
                    confirmButton.disabled = true;
                    confirmButton.style.opacity = "0.5";
                }
            }
        });

        perspectiveButtonContainer.appendChild(button);
    });

    selectionContainer.appendChild(perspectiveButtonContainer);

    // Add confirm button
    const confirmButton = document.createElement("button");
    confirmButton.id = "confirm-debate-btn";
    confirmButton.textContent = "Start Debate";
    confirmButton.style.padding = "12px 24px";
    confirmButton.style.background = "#9a6abf";
    confirmButton.style.color = "white";
    confirmButton.style.border = "none";
    confirmButton.style.borderRadius = "20px";
    confirmButton.style.fontWeight = "bold";
    confirmButton.style.cursor = "pointer";
    confirmButton.style.opacity = "0.5";
    confirmButton.disabled = true;

    confirmButton.addEventListener("click", setupDebateInterface);

    selectionContainer.appendChild(confirmButton);

    // Append selection container to page
    const contentArea = document.querySelector(".content");
    if (contentArea) {
        // Clear any existing debate selection first
        const existingSelection = document.getElementById("debate-selection");
        if (existingSelection) {
            existingSelection.remove();
        }
        contentArea.appendChild(selectionContainer);
    }
}

// Expose the function to global scope
window.showDebateSelection = showDebateSelection;




// Set up the debate interface
function setupDebateInterface() {
    debateActive = true;
    
    // Save the current state of chat elements before modifying
    window.savedChatState = {
        chatDisplay: document.getElementById("chat-container") ? 
            document.getElementById("chat-container").style.display : 'block',
        inputContainerDisplay: document.querySelector(".chat-input-container") ? 
            document.querySelector(".chat-input-container").style.display : 'flex',
        messagesHtml: document.getElementById("chat-messages") ? 
            document.getElementById("chat-messages").innerHTML : '',
        inputDisabled: document.getElementById("chat-input") ? 
            document.getElementById("chat-input").disabled : false
    };
    
    console.log("Saved chat state before debate", window.savedChatState);
    
    // Hide selection container
    document.getElementById("debate-selection").style.display = "none";
    
    // Update subheading
    document.getElementById("subheading").textContent = "Perspective Debate";
    
    // Create container for main + debate layout
    const layoutContainer = document.createElement("div");
    layoutContainer.id = "debate-layout";
    layoutContainer.style.display = "flex";
    layoutContainer.style.gap = "20px";
    layoutContainer.style.width = "100%";
    layoutContainer.style.maxWidth = "1200px";
    layoutContainer.style.margin = "0 auto";
    
    // Add main chat to layout container
    const chatContainer = document.getElementById("chat-container");
    if (chatContainer) {
        // Just modify style but keep the existing container
        chatContainer.style.flex = "1";
        chatContainer.style.maxWidth = "none";
    }
    
    // Create debate container
    const debateContainer = document.createElement("div");
    debateContainer.id = "debate-container";
    debateContainer.style.flex = "1";
    debateContainer.style.display = "flex";
    debateContainer.style.flexDirection = "column";
    debateContainer.style.background = "white";
    debateContainer.style.borderRadius = "10px";
    debateContainer.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.1)";
    debateContainer.style.overflow = "hidden";
    
    // Create debate header
    const debateHeader = document.createElement("div");
    debateHeader.className = "debate-header";
    debateHeader.style.padding = "15px";
    debateHeader.style.background = "#9a6abf";
    debateHeader.style.color = "white";
    debateHeader.style.textAlign = "center";
    debateHeader.style.fontWeight = "bold";
    debateHeader.style.borderRadius = "10px 10px 0 0";
    debateHeader.innerHTML = `Debate: ${perspectives[debatePerspectives[0]]} & ${perspectives[debatePerspectives[1]]}`;
    
    debateHeader.style.position = "relative";
    
    // Create debate messages area
    const debateMessages = document.createElement("div");
    debateMessages.id = "debate-messages";
    debateMessages.style.flex = "1";
    debateMessages.style.padding = "15px";
    debateMessages.style.overflowY = "auto";
    debateMessages.style.background = "#f9f9f9";
    debateMessages.style.height = "350px";
    
    // Add initial instruction
    const instructionDiv = document.createElement("div");
    instructionDiv.className = "debate-instruction";
    instructionDiv.style.padding = "15px";
    instructionDiv.style.margin = "10px 0";
    instructionDiv.style.background = "#f0f0f0";
    instructionDiv.style.borderRadius = "8px";
    instructionDiv.style.textAlign = "center";
    instructionDiv.innerHTML = "Enter a topic or question below for these perspectives to debate";
    debateMessages.appendChild(instructionDiv);
    
    // Create debate input area
    const debateInputContainer = document.createElement("div");
    debateInputContainer.className = "debate-input-container";
    debateInputContainer.style.display = "flex";
    debateInputContainer.style.padding = "15px";
    debateInputContainer.style.background = "white";
    debateInputContainer.style.borderTop = "1px solid #eee";
    
    // Create input
    const debateInput = document.createElement("input");
    debateInput.type = "text";
    debateInput.id = "debate-input";
    debateInput.placeholder = "Enter debate topic...";
    debateInput.style.flex = "1";
    debateInput.style.padding = "10px 15px";
    debateInput.style.border = "1px solid #ddd";
    debateInput.style.borderRadius = "20px";
    debateInput.style.fontSize = "14px";
    debateInput.style.marginRight = "10px";
    
    debateInput.addEventListener("keypress", function(e) {
        if (e.key === "Enter") {
            startDebate();
        }
    });
    
    // Create send button
    const debateSendButton = document.createElement("button");
    debateSendButton.id = "debate-send-btn";
    debateSendButton.innerHTML = "Start";
    debateSendButton.style.padding = "10px 20px";
    debateSendButton.style.background = "#9a6abf";
    debateSendButton.style.color = "white";
    debateSendButton.style.border = "none";
    debateSendButton.style.borderRadius = "20px";
    debateSendButton.style.fontWeight = "bold";
    debateSendButton.style.cursor = "pointer";
    
    debateSendButton.addEventListener("click", startDebate);
    
    // Assemble input container
    debateInputContainer.appendChild(debateInput);
    debateInputContainer.appendChild(debateSendButton);
    
    // Assemble debate container
    debateContainer.appendChild(debateHeader);
    debateContainer.appendChild(debateMessages);
    debateContainer.appendChild(debateInputContainer);
    
    // Create the overall container for both original and debate
    const contentArea = document.querySelector(".content");
    // Don't clear the content area, just store current state
    const originalContent = contentArea.innerHTML;
    window.originalContent = originalContent;
    contentArea.innerHTML = '';
    
    // Add both to layout container
    layoutContainer.appendChild(chatContainer);
    layoutContainer.appendChild(debateContainer);
    
    // Add layout to page
    contentArea.appendChild(layoutContainer);
    
    // Make sure the original chat container is visible
    chatContainer.style.display = "block";
    
    // Focus on debate input
    debateInput.focus();
}

// Function to exit debate mode and restore chat interface
function exitDebateMode() {
    debateActive = false;
    
    // Get the content area
    const contentArea = document.querySelector(".content");
    
    // Create a temporary container to store current layout
    const tempContainer = document.createElement("div");
    tempContainer.style.display = "none";
    document.body.appendChild(tempContainer);
    
    // Move chat container back to temporary storage to preserve it
    const chatContainer = document.getElementById("chat-container");
    if (chatContainer) {
        tempContainer.appendChild(chatContainer);
    }
    
    // Reset content area
    if (contentArea) {
        contentArea.innerHTML = '';
    }
    
    // Move chat container back to content area
    if (chatContainer && contentArea) {
        contentArea.appendChild(chatContainer);
        
        // Restore original chat container style
        chatContainer.style.flex = "";
        chatContainer.style.maxWidth = "";
        chatContainer.style.display = window.savedChatState?.chatDisplay || "block";
    }
    
    // Restore chat messages if needed
    const chatMessages = document.getElementById("chat-messages");
    if (chatMessages && window.savedChatState && window.savedChatState.messagesHtml) {
        chatMessages.innerHTML = window.savedChatState.messagesHtml;
    }
    
    // Remove existing chat input container to prevent duplicate event listeners
    const existingChatInputContainer = document.querySelector(".chat-input-container");
    if (existingChatInputContainer) {
        existingChatInputContainer.remove();
    }
    
    // Add a new chat input container
    addChatInputContainer();
    
    // Add debate button back
    initiateDebateFeature();
    
    // Update subheading
    const subheading = document.getElementById("subheading");
    if (subheading) {
        subheading.textContent = "Step 3: Follow-up with specific perspectives";
    }
    
    // Clean up temporary container
    tempContainer.remove();
    
    // Reset debate variables
    debatePerspectives = [];
    debateSessionId = null;
}

// Start the debate with user's topic
// Start the debate with user's topic
function startDebate() {
    const topic = document.getElementById("debate-input").value.trim();
    if (!topic) return;
    
    // Ensure perspectives are properly selected
    if (!window.debatePerspectives || window.debatePerspectives.length < 2) {
        console.error("Error: Not enough perspectives selected for debate.");
        alert("Please select two perspectives for the debate.");
        return;
    }
    
    // Reset session ID when starting a new debate
    debateSessionId = null;
    
    // Clear input
    document.getElementById("debate-input").value = "";
    
    // Disable input while debate is in progress
    document.getElementById("debate-input").disabled = true;
    document.getElementById("debate-send-btn").disabled = true;
    
    // Display user message
    const userDiv = document.createElement("div");
    userDiv.className = "debate-user-message";
    userDiv.style.textAlign = "right";
    userDiv.style.margin = "10px 0";
    userDiv.innerHTML = 
        `<div style="display: inline-block; background: #e3eeff; padding: 10px; border-radius: 10px; max-width: 80%;">
            <strong>You:</strong> ${topic}
        </div>`;
    
    const debateMessages = document.getElementById("debate-messages");
    if (debateMessages) {
        // Create loading div
        const loadingDiv = document.createElement("div");
        loadingDiv.id = "debate-loading";
        loadingDiv.style.textAlign = "center";
        loadingDiv.style.margin = "15px 0";
        loadingDiv.innerHTML = 
            `<div style="display: inline-block; padding: 10px; border-radius: 10px; background: #f0f0f0;">
                <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: #9a6abf; margin-right: 10px; animation: pulse 1s infinite;"></span>
                Generating responses...
            </div>`;
        
        debateMessages.appendChild(loadingDiv);
        // Scroll to bottom
        scrollToBottom("debate-messages");
    } else {
        console.error("Debate messages container not found when showing loading indicator");
        return;
    }
    
    // Get first and second perspective keys
    const perspectiveKey = window.debatePerspectives[0];
    const otherPerspectiveKey = window.debatePerspectives[1];

    console.log("Starting debate between:", 
        window.perspectives[perspectiveKey], 
        "and", 
        window.perspectives[otherPerspectiveKey]
    );
    
    // Prepare params for first perspective's response
    const params = {
        perspective_key: perspectiveKey,
        perspective: window.perspectives[perspectiveKey],
        topic: topic,
        other_perspective_key: otherPerspectiveKey,
        other_perspective: window.perspectives[otherPerspectiveKey]
    };
    
    API.getDebateResponse(params)
        .then(response => {
            // Save the session ID from the response
            debateSessionId = response.session_id;
            
            // Remove loading indicator
            const loadingElement = document.getElementById("debate-loading");
            if (loadingElement) {
                loadingElement.remove();
            }
            
            // Display first perspective's response
            displayDebateResponse(perspectiveKey, response.response);
            
            // Now get second perspective's response
            const loadingDiv2 = document.createElement("div");
            loadingDiv2.id = "debate-loading";
            loadingDiv2.style.textAlign = "center";
            loadingDiv2.style.margin = "15px 0";
            loadingDiv2.innerHTML = 
                `<div style="display: inline-block; padding: 10px; border-radius: 10px; background: #f0f0f0;">
                    <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: #9a6abf; margin-right: 10px; animation: pulse 1s infinite;"></span>
                    ${window.perspectives[otherPerspectiveKey]} is responding...
                </div>`;
            
            const debateMessages = document.getElementById("debate-messages");
            if (debateMessages) {
                debateMessages.appendChild(loadingDiv2);
                // Scroll to bottom
                scrollToBottom("debate-messages");
            }
            
            // Get second perspective response
            const secondParams = {
                perspective_key: otherPerspectiveKey,
                perspective: window.perspectives[otherPerspectiveKey],
                topic: topic,
                other_perspective_key: perspectiveKey,
                other_perspective: window.perspectives[perspectiveKey],
                other_response: response.response,
                session_id: debateSessionId
            };
            
            return API.getDebateResponse(secondParams);
        })
        .then(response => {
            // Remove loading indicator
            const loadingElement = document.getElementById("debate-loading");
            if (loadingElement) {
                loadingElement.remove();
            }
            
            // Display second perspective's response
            displayDebateResponse(otherPerspectiveKey, response.response);
            
            // Show response buttons for continuing the debate
            showDebateButtons();
        })
        .catch(error => {
            console.error("Error starting debate:", error);
            
            // Remove loading indicator if present
            const loadingElement = document.getElementById("debate-loading");
            if (loadingElement) {
                loadingElement.remove();
            }
            
            // Show error message
            const errorDiv = document.createElement("div");
            errorDiv.style.textAlign = "center";
            errorDiv.style.margin = "15px 0";
            errorDiv.style.color = "red";
            errorDiv.textContent = "Error generating debate responses. Please try again.";
            
            const debateMessages = document.getElementById("debate-messages");
            if (debateMessages) {
                debateMessages.appendChild(errorDiv);
            }
            
            // Re-enable input
            const debateInput = document.getElementById("debate-input");
            if (debateInput) {
                debateInput.disabled = false;
            }
            
            const debateSendBtn = document.getElementById("debate-send-btn");
            if (debateSendBtn) {
                debateSendBtn.disabled = false;
            }
        });
}

// Create a safer version of the API.sendFollowUp function
if (typeof API !== 'undefined' && API.sendFollowUp) {
    const originalSendFollowUp = API.sendFollowUp;
    
    // Replace with fixed version that handles missing elements
    API.sendFollowUp = function(userInput, currentTab, selectedPerspectives) {
        console.log("Using fixed sendFollowUp function");
        
        // Check if spinner exists before trying to modify it
        const spinner = document.getElementById("loading-spinner");
        
        // If spinner exists, update it; otherwise, create a temporary loading indicator in the chat
        if (spinner) {
            if (spinner.innerHTML !== undefined) {
                spinner.innerHTML = '<span class="spinner-icon"></span> Loading follow-up response...';
                spinner.style.display = "flex";
            } else {
                console.warn("Spinner element exists but innerHTML is undefined");
            }
        } else {
            console.log("No loading-spinner element found. Using alternative loading indicator.");
            // Create a temporary loading indicator in the chat if possible
            const chatMessages = document.getElementById("chat-messages");
            if (chatMessages) {
                const tempLoading = document.createElement("div");
                tempLoading.id = "temp-loading-indicator";
                tempLoading.style.textAlign = "center";
                tempLoading.style.margin = "15px 0";
                tempLoading.innerHTML = 
                    `<div style="display: inline-block; padding: 10px; border-radius: 10px; background: #f0f0f0;">
                        <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: #9a6abf; margin-right: 10px; animation: pulse 1s infinite;"></span>
                        Loading response...
                    </div>`;
                chatMessages.appendChild(tempLoading);
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
            // Hide spinner if it exists
            if (spinner) {
                spinner.style.display = "none";
            }
            
            // Remove temporary loading indicator if it exists
            const tempLoading = document.getElementById("temp-loading-indicator");
            if (tempLoading) {
                tempLoading.remove();
            }
            
            console.log("New Message Response:", data);
            return data;
        })
        .catch(error => {
            // Hide spinner if it exists
            if (spinner) {
                spinner.style.display = "none";
            }
            
            // Remove temporary loading indicator if it exists
            const tempLoading = document.getElementById("temp-loading-indicator");
            if (tempLoading) {
                tempLoading.remove();
            }
            
            console.error("Error sending message:", error);
            throw error;
        });
    };
}
    const loadingDiv = document.createElement("div");
    loadingDiv.id = "debate-loading";
    loadingDiv.style.textAlign = "center";
    loadingDiv.style.margin = "15px 0";
    loadingDiv.innerHTML = 
        `<div style="display: inline-block; padding: 10px; border-radius: 10px; background: #f0f0f0;">
            <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: #9a6abf; margin-right: 10px; animation: pulse 1s infinite;"></span>
            Generating responses...
        </div>`;
    const debateMessages = document.getElementById("debate-messages");

        
    
    // Show loading indicator
    
    
    // Scroll to bottom
    scrollToBottom("debate-messages");
    
    // Get first perspective response
    const perspectiveKey = debatePerspectives[0]; // Ensure this is properly assigned
    const otherPerspectiveKey = debatePerspectives[1];


    console.log("Starting debate between:", perspectives[perspectiveKey], "and", perspectives[otherPerspectiveKey]);

    
    API.getDebateResponse(params)
        .then(response => {
            // Save the session ID from the response
            debateSessionId = response.session_id;
            
            // Remove loading indicator
            const loadingElement = document.getElementById("debate-loading");
            if (loadingElement) {
                loadingElement.remove();
            }
            
            // Display first perspective's response
            displayDebateResponse(debatePerspectives[0], response.response);
            
            // Now get second perspective's response
            const loadingDiv2 = document.createElement("div");
            loadingDiv2.id = "debate-loading";
            loadingDiv2.style.textAlign = "center";
            loadingDiv2.style.margin = "15px 0";
            loadingDiv2.innerHTML = 
                `<div style="display: inline-block; padding: 10px; border-radius: 10px; background: #f0f0f0;">
                    <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: #9a6abf; margin-right: 10px; animation: pulse 1s infinite;"></span>
                    ${perspectives[debatePerspectives[1]]} is responding...
                </div>`;
            
            const debateMessages = document.getElementById("debate-messages");
            if (debateMessages) {
                debateMessages.appendChild(loadingDiv2);
                // Scroll to bottom
                scrollToBottom("debate-messages");
            }
            
            // Get second perspective response
            const secondParams = {
                perspective_key: debatePerspectives[1],
                perspective: perspectives[debatePerspectives[1]],
                topic: topic,
                other_perspective_key: debatePerspectives[0],
                other_perspective: perspectives[debatePerspectives[0]],
                other_response: response.response,
                session_id: debateSessionId
            };
            
            return API.getDebateResponse(secondParams);
        })
        .then(response => {
            // Remove loading indicator
            const loadingElement = document.getElementById("debate-loading");
            if (loadingElement) {
                loadingElement.remove();
            }
            
            // Display second perspective's response
            displayDebateResponse(debatePerspectives[1], response.response);
            
            // Show response buttons for continuing the debate
            showDebateButtons();
        })
        .catch(error => {
            console.error("Error starting debate:", error);
            
            // Remove loading indicator if present
            const loadingElement = document.getElementById("debate-loading");
            if (loadingElement) {
                loadingElement.remove();
            }
            
            // Show error message
            const errorDiv = document.createElement("div");
            errorDiv.style.textAlign = "center";
            errorDiv.style.margin = "15px 0";
            errorDiv.style.color = "red";
            errorDiv.textContent = "Error generating debate responses. Please try again.";
            
            const debateMessages = document.getElementById("debate-messages");
            if (debateMessages) {
                debateMessages.appendChild(errorDiv);
            }
            
            // Re-enable input
            const debateInput = document.getElementById("debate-input");
            if (debateInput) {
                debateInput.disabled = false;
            }
            
            const debateSendBtn = document.getElementById("debate-send-btn");
            if (debateSendBtn) {
                debateSendBtn.disabled = false;
            }
        });


// Display a response in the debate
function displayDebateResponse(perspectiveKey, response) {
    const responseDiv = document.createElement("div");
    responseDiv.className = "debate-response";
    responseDiv.setAttribute("data-perspective", perspectiveKey);
    responseDiv.style.margin = "15px 0";
    
    // Different styling for each perspective
    let bgColor = perspectiveKey === debatePerspectives[0] ? "#f1e6fb" : "#e6f0fa";
    
    responseDiv.innerHTML = 
        `<div style="display: inline-block; background: ${bgColor}; padding: 12px; border-radius: 10px; max-width: 80%;">
            <strong>${perspectives[perspectiveKey]}:</strong> ${response}
        </div>`;
    
    const debateMessages = document.getElementById("debate-messages");
    if (debateMessages) {
        debateMessages.appendChild(responseDiv);
        // Scroll to bottom
        scrollToBottom("debate-messages");
    } else {
        console.error("Debate messages container not found when displaying response");
    }
}

// Show buttons to continue the debate

// Continue the debate with selected perspective
function continueDebate(perspectiveKey) {
    // Remove buttons
    const buttonsElement = document.getElementById("debate-buttons");
    if (buttonsElement) {
        buttonsElement.remove();
    }
    
    // Get the latest response from the other perspective
    const otherPerspectiveKey = debatePerspectives.find(key => key !== perspectiveKey);
    const allResponses = document.querySelectorAll('.debate-response');
    let latestOtherResponse = null;

    
    // Loop from the end to find the most recent response from the other perspective
    for (let i = allResponses.length - 1; i >= 0; i--) {
        if (allResponses[i].getAttribute('data-perspective') === otherPerspectiveKey) {
            // Extract just the text content, not the HTML with the perspective name
            const responseTextElement = allResponses[i].querySelector('div');
            if (responseTextElement) {
                // Remove the "Perspective Name:" part from the beginning
                let fullText = responseTextElement.textContent.trim();
                latestOtherResponse = fullText.substring(fullText.indexOf(':') + 1).trim();
            } else {
                latestOtherResponse = allResponses[i].textContent.trim();
            }
            break;
        }
    }
    
    // Show loading indicator
    const loadingDiv = document.createElement("div");
    loadingDiv.id = "debate-loading";
    loadingDiv.style.textAlign = "center";
    loadingDiv.style.margin = "15px 0";
    loadingDiv.innerHTML = 
        `<div style="display: inline-block; padding: 10px; border-radius: 10px; background: #f0f0f0;">
            <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: #9a6abf; margin-right: 10px; animation: pulse 1s infinite;"></span>
            ${perspectives[perspectiveKey]} is responding...
        </div>`;
    
    const debateMessages = document.getElementById("debate-messages");
    if (debateMessages) {
        debateMessages.appendChild(loadingDiv);
        // Scroll to bottom
        scrollToBottom("debate-messages");
    } else {
        console.error("Debate messages container not found when showing loading indicator");
        return;
    }
    
    // Get counterpoint response
    const params = {
        perspective_key: perspectiveKey,
        perspective: perspectives[perspectiveKey],
        other_perspective_key: otherPerspectiveKey,
        other_perspective: perspectives[otherPerspectiveKey],
        other_response: latestOtherResponse,
        session_id: debateSessionId
    };
    
    API.getDebateCounterpoint(params)
        .then(response => {
            // Remove loading indicator
            const loadingElement = document.getElementById("debate-loading");
            if (loadingElement) {
                loadingElement.remove();
            }
            
            // Display response
            displayDebateResponse(perspectiveKey, response.response);
            
            // Show buttons again
            showDebateButtons();
        })
        .catch(error => {
            console.error("Error continuing debate:", error);
            
            // Remove loading indicator
            const loadingElement = document.getElementById("debate-loading");
            if (loadingElement) {
                loadingElement.remove();
            }
            
            // Show error message
            const errorDiv = document.createElement("div");
            errorDiv.style.textAlign = "center";
            errorDiv.style.margin = "15px 0";
            errorDiv.style.color = "red";
            errorDiv.textContent = "Error generating response. Please try again.";
            
            const debateMessages = document.getElementById("debate-messages");
            if (debateMessages) {
                debateMessages.appendChild(errorDiv);
            }
            
            // Show buttons again
            showDebateButtons();
        });
}

// Create a safer version of the API.sendFollowUp function
if (typeof API !== 'undefined' && API.sendFollowUp) {
    const originalSendFollowUp = API.sendFollowUp;
    
    // Replace with fixed version that handles missing elements
    API.sendFollowUp = function(userInput, currentTab, selectedPerspectives) {
        console.log("Using fixed sendFollowUp function");
        
        // Check if spinner exists before trying to modify it
        const spinner = document.getElementById("loading-spinner");
        
        // If spinner exists, update it; otherwise, create a temporary loading indicator in the chat
        if (spinner) {
            if (spinner.innerHTML !== undefined) {
                spinner.innerHTML = '<span class="spinner-icon"></span> Loading follow-up response...';
                spinner.style.display = "flex";
            } else {
                console.warn("Spinner element exists but innerHTML is undefined");
            }
        } else {
            console.log("No loading-spinner element found. Using alternative loading indicator.");
            // Create a temporary loading indicator in the chat if possible
            const chatMessages = document.getElementById("chat-messages");
            if (chatMessages) {
                const tempLoading = document.createElement("div");
                tempLoading.id = "temp-loading-indicator";
                tempLoading.style.textAlign = "center";
                tempLoading.style.margin = "15px 0";
                tempLoading.innerHTML = 
                    `<div style="display: inline-block; padding: 10px; border-radius: 10px; background: #f0f0f0;">
                        <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: #9a6abf; margin-right: 10px; animation: pulse 1s infinite;"></span>
                        Loading response...
                    </div>`;
                chatMessages.appendChild(tempLoading);
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
            // Hide spinner if it exists
            if (spinner) {
                spinner.style.display = "none";
            }
            
            // Remove temporary loading indicator if it exists
            const tempLoading = document.getElementById("temp-loading-indicator");
            if (tempLoading) {
                tempLoading.remove();
            }
            
            console.log("New Message Response:", data);
            return data;
        })
        .catch(error => {
            // Hide spinner if it exists
            if (spinner) {
                spinner.style.display = "none";
            }
            
            // Remove temporary loading indicator if it exists
            const tempLoading = document.getElementById("temp-loading-indicator");
            if (tempLoading) {
                tempLoading.remove();
            }
            
            console.error("Error sending message:", error);
            throw error;
        });
    };

}
    