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