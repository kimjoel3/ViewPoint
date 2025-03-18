// Main application initialization
document.addEventListener('DOMContentLoaded', function() {

    // Global variables
    window.initialUserInput = "";
    
    // Set up event listeners
    setupEventListeners();

    if (typeof scrollToBottom === 'function') {
        scrollToBottom("chat-messages");
    }
    
    // Set up initial scroll for any existing messages
    scrollToBottom("chat-messages");
    
    // Set up mutation observer to detect when new messages are added
    setupScrollObserver();
    
    // Initialize the application
    function setupEventListeners() {
        // Remove existing event listeners if any
        const sendButton = document.getElementById("send-button");
        const userInput = document.getElementById("user-input");
        const confirmButton = document.getElementById("confirm-selection");
        
        if (sendButton) {
            const newSendButton = sendButton.cloneNode(true);
            sendButton.parentNode.replaceChild(newSendButton, sendButton);
            
            // Re-add the event listener
            newSendButton.addEventListener("click", () => {
                const message = document.getElementById("user-input").value.trim();
                if (!message) return;
    
                if (Object.keys(perspectives).length === 0) {
                    document.getElementById("subheading").textContent = "Step 2: Select 3 perspectives";
                    fetchPerspectives(message);
                } else {
                    sendMessage();
                }
            });
        }
        
        if (userInput) {
            const newUserInput = userInput.cloneNode(true);
            userInput.parentNode.replaceChild(newUserInput, userInput);
            
            // Re-add the event listener
            newUserInput.addEventListener("keypress", (e) => {
                if (e.key === "Enter") {
                    document.getElementById("send-button").click();
                }
            });
        }
        
        if (confirmButton) {
            const newConfirmButton = confirmButton.cloneNode(true);
            confirmButton.parentNode.replaceChild(newConfirmButton, confirmButton);
            
            // Re-add the event listener
            newConfirmButton.addEventListener("click", () => {
                if (selectedPerspectives.length === 3) {
                    confirmPerspectivesAndInitializeChat();
                } else {
                    alert("Please select exactly 3 perspectives.");
                }
            });
        }
        
        // Add viewport resize handler for responsive layout
        window.removeEventListener('resize', handleResponsiveLayout);
        window.addEventListener('resize', handleResponsiveLayout);
    }
    
    // Set up scroll observer
    function setupScrollObserver() {
        const chatMessages = document.getElementById("chat-messages");
        if (chatMessages) {
            const observer = new MutationObserver(function() {
                scrollToBottom("chat-messages");
            });
            
            observer.observe(chatMessages, { childList: true });
        }
    }
    
    // Helper function to scroll to bottom of an element
    window.scrollToBottom = function(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.scrollTop = element.scrollHeight;
        }
    }

    // Handle responsive layout adjustments
    function handleResponsiveLayout() {
        const width = window.innerWidth;
        
        // Adjust for mobile
        if (width <= 768) {
            // Adjust debate layout if active
            const debateLayout = document.getElementById("debate-layout");
            if (debateLayout) {
                debateLayout.style.flexDirection = "column";
            }
            
            // Adjust confirm button width
            const confirmButton = document.getElementById("confirm-selection");
            if (confirmButton) {
                confirmButton.style.width = "80%";
            }
            
            // Adjust input container width
            const inputContainer = document.querySelector(".input-container");
            if (inputContainer) {
                inputContainer.style.width = "90%";
            }
        } else {
            // Reset for desktop
            const debateLayout = document.getElementById("debate-layout");
            if (debateLayout) {
                debateLayout.style.flexDirection = "row";
            }
            
            // Reset confirm button width
            const confirmButton = document.getElementById("confirm-selection");
            if (confirmButton) {
                confirmButton.style.width = "25%";
            }
            
            // Reset input container width
            const inputContainer = document.querySelector(".input-container");
            if (inputContainer) {
                inputContainer.style.width = "75%";
            }
        }
    }

    // Initial responsive layout setup
    handleResponsiveLayout();
});

function resetApplication() {
    // Reset global variables
    window.initialUserInput = "";
    window.selectedPerspectives = [];
    window.perspectives = {};
    window.conversationHistory = {};
    
    // Show the initial UI elements
    document.getElementById("subheading").textContent = "Step 1: Describe your situation";
    document.querySelector(".input-container").style.display = "flex";
    document.querySelector("h1").style.display = "block";
    document.getElementById("perspective-list").style.display = "none";
    document.getElementById("confirm-selection").style.display = "none";
    
    // Hide chat elements
    const chatContainer = document.getElementById("chat-container");
    if (chatContainer) {
        chatContainer.style.display = "none";
    }
    
    // Hide debate elements if present
    const debateLayout = document.getElementById("debate-layout");
    if (debateLayout) {
        debateLayout.remove();
    }
    
    // Remove any debate selection UI
    const debateSelection = document.getElementById("debate-selection");
    if (debateSelection) {
        debateSelection.remove();
    }
    
    // Remove debate button
    const debateButton = document.getElementById("start-debate-btn");
    if (debateButton) {
        debateButton.remove();
    }
    
    // Clear messages
    const chatMessages = document.getElementById("chat-messages");
    if (chatMessages) {
        chatMessages.innerHTML = "";
    }
    
    // Clear tabs
    const tabs = document.getElementById("tabs");
    if (tabs) {
        tabs.innerHTML = "";
    }
    
    // Reset perspective list
    const perspectiveList = document.getElementById("perspective-list");
    if (perspectiveList) {
        perspectiveList.innerHTML = "";
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Call the clear_session endpoint to reset server-side state
    fetch('/clear_session')
        .then(response => response.json())
        .then(data => {
            console.log("Session cleared:", data);
            
            // Also reset all client-side state
            window.perspectives = {};
            window.selectedPerspectives = [];
            window.conversationHistory = {};
            
            // Reset UI to initial state
            document.getElementById("subheading").textContent = "Step 1: Describe your situation";
            document.querySelector(".input-container").style.display = "flex";
            
            const perspectiveList = document.getElementById("perspective-list");
            if (perspectiveList) perspectiveList.innerHTML = "";
            
            const chatContainer = document.getElementById("chat-container");
            if (chatContainer) chatContainer.style.display = "none";
        })
        .catch(error => {
            console.error("Failed to clear session:", error);
        });
});