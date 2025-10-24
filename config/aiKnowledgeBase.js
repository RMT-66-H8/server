// Knowledge Base untuk AI Support Assistant

const APP_KNOWLEDGE_BASE = {
  // Informasi dasar aplikasi
  appName: "E-Commerce Platform",
  appType: "Online Shopping Application",
  
  // Manajemen User 
  authentication: {
    registration: {
      description: "Users can register to create a new account",
      required_fields: [
        { field: "name", type: "string", description: "User's full name" },
        { field: "email", type: "string", description: "Valid and unregistered email address" },
        { field: "password", type: "string", description: "Password that will be automatically encrypted" }
      ],
      process: [
        "Fill out the registration form with your full name, email address, and password",
        "Make sure the email you use is valid and has not been registered before",
        "Your password will be automatically encrypted for account security",
        "After successful registration, you can immediately login using that account"
      ],
      common_issues: [
        "Email already registered: Use another email or try logging in with the existing email",
        "Invalid email format: Make sure to use the correct email format like name@domain.com",
        "Password too weak: Use a combination of uppercase, lowercase, numbers, and symbols for security"
      ]
    },
    login: {
      description: "Registered users can login to access their account",
      required_fields: [
        { field: "email", type: "string", description: "Registered email address" },
        { field: "password", type: "string", description: "Your account password" }
      ],
      process: [
        "Enter your registered email address",
        "Enter your account password",
        "Click the login button",
        "You will be redirected to the main application page"
      ],
      common_issues: [
        "Incorrect email or password: Please check your credentials and try again",
        "Account not found: Make sure you have registered first",
        "Forgot password: Contact our support team for password reset assistance"
      ]
    }
  },

  // Fitur produk
  products: {
    description: "Browse and purchase products from our catalog",
    features: {
      browse: {
        description: "View all available products",
        information_displayed: [
          "Product name",
          "Product description",
          "Price",
          "Available stock",
          "Product image",
          "Product category"
        ]
      },
      search: {
        description: "Search products by name or category",
        tips: [
          "Use specific keywords for better results",
          "Filter by category to narrow down your search",
          "Check product description for more detailed information"
        ]
      },
      details: {
        description: "View detailed product information",
        includes: [
          "Complete product description",
          "Current price",
          "Stock availability",
          "High-quality product images",
          "Product category"
        ]
      }
    },
    stock_management: "Products have limited stock. Stock is updated in real-time when items are added to cart or purchased."
  },

  // Keranjang belanja
  cart: {
    description: "Manage your shopping cart before checkout",
    features: {
      add_to_cart: {
        description: "Add products to cart",
        process: [
          "Browse the available product catalog",
          "Select the product you want to buy",
          "Click the Add to Cart button",
          "The product will be added to your shopping cart"
        ],
        requirements: [
          "You must login first to add items to cart",
          "Product must have available stock",
          "Each user has their own private cart"
        ]
      },
      view_cart: {
        description: "View all items in your cart",
        information_shown: [
          "Product details such as name, price, and image",
          "Total number of items",
          "Cart summary"
        ]
      },
      remove_from_cart: {
        description: "Remove unwanted items from cart",
        process: [
          "Open your cart page",
          "Find the item you want to remove",
          "Click the remove or delete button",
          "The item will be removed from cart"
        ]
      }
    },
    common_questions: [
      "Can I add items without logging in? No, you must login first to use the cart feature",
      "How long are items stored in the cart? Items will be stored until you remove them or complete the purchase",
      "Can I see items added by other users? No, each cart is private for each user"
    ]
  },

  // Pesan dan dukungan
  messaging: {
    description: "Real-time chat support system",
    features: {
      chat: "Send and receive messages in real-time using Socket.IO",
      ai_support: "Get instant answers from AI support assistant",
      history: "View conversation history"
    },
    how_to_use: [
      "Type your question in the chat box",
      "Press send button or Enter",
      "AI assistant will respond immediately",
      "Continue the conversation as needed"
    ]
  },

  // Alur penggunaan umum
  user_flows: {
    first_time_buyer: [
      "Register a new account by filling in name, email, and password",
      "Login using the registered credentials",
      "Browse the available product catalog",
      "Add desired products to cart",
      "Check cart to review items to be purchased",
      "Proceed to checkout when ready"
    ],
    returning_buyer: [
      "Login to your account",
      "Browse or search for desired products",
      "Add products to shopping cart",
      "Manage cart by adding or removing items",
      "Complete your purchase"
    ],
    if_stuck: [
      "Use chat support with AI assistant",
      "Check FAQ section for common questions",
      "Review user guide",
      "Contact support team if you still need help"
    ]
  },

  // Pertanyaan yang sering diajukan (FAQ)
  faq: {
    account: [
      {
        q: "How do I create an account?",
        a: "Click the Register or Sign Up button, fill in your full name, email, and password, then submit. Make sure to use a valid email address."
      },
      {
        q: "I forgot my password, what should I do?",
        a: "Contact our support team for password reset assistance. We will help you regain access to your account."
      },
      {
        q: "Can I change my email address?",
        a: "Currently, email changes require support team assistance. We are developing this feature for the future."
      }
    ],
    shopping: [
      {
        q: "How do I purchase products?",
        a: "After logging in, browse available products, add items to cart, then proceed to checkout. You must login first to make a purchase."
      },
      {
        q: "What if a product is out of stock?",
        a: "Out of stock products cannot be added to cart. Check back later or contact support for restock information."
      },
      {
        q: "Can I save products for later?",
        a: "Products in your cart will remain saved until you remove them, so the cart can function as a wishlist."
      }
    ],
    technical: [
      {
        q: "Website is not loading properly, what should I do?",
        a: "Try refreshing the page, clearing browser cache, or using another browser. If the problem persists, contact our support team."
      },
      {
        q: "Is my personal information secure?",
        a: "Yes, we use encryption for passwords and security protocols for all data transmission."
      },
      {
        q: "Can I access my account from multiple devices?",
        a: "Yes, you can login to your account from any device using the same email and password."
      }
    ]
  },

  // Informasi kontak support
  support_info: {
    ai_assistant: "Available 24/7 for instant help with common questions",
    human_support: "For more complex issues, our support team is ready to help",
    response_time: "AI responds instantly, human support typically within 24 hours"
  },

  // Batasan fitur platform saat ini
  platform_limitations: {
    not_available_yet: [
      "Checkout and payment processing - currently in development",
      "Order history and tracking - coming soon",
      "Product reviews and ratings - planned for future release",
      "Wishlist feature - use cart as temporary storage for now",
      "Shipping and delivery tracking",
      "Return and refund process - contact support for assistance"
    ],
    technical_limits: [
      "Product image upload size limit: 5MB maximum",
      "Maximum 50 items per cart",
      "Session timeout after 2 hours of inactivity",
      "Stock updates may have 1-2 minute delay during high traffic"
    ]
  },

  // Masalah yang diketahui dan solusinya
  known_issues: {
    common_problems: [
      {
        issue: "Slow page loading during peak hours",
        workaround: "Try accessing during off-peak times or clear browser cache",
        status: "We're working on server optimization"
      },
      {
        issue: "Password reset requires manual approval",
        workaround: "Contact support team with your registered email",
        status: "Automated password reset coming in next update"
      },
      {
        issue: "Cart items occasionally appear duplicated",
        workaround: "Refresh the page - duplicates are display-only and won't be saved",
        status: "Fix scheduled for next maintenance window"
      }
    ],
    browser_compatibility: [
      "Best experience on Chrome, Firefox, Safari latest versions",
      "Internet Explorer not fully supported - please use modern browsers",
      "Mobile responsive design works on most devices"
    ]
  },

  // Kemampuan dan batasan AI Assistant
  ai_capabilities: {
    can_help_with: [
      "Account registration and login guidance",
      "Product browsing and search tips",
      "Cart management instructions",
      "General navigation and feature explanations",
      "Troubleshooting common issues",
      "Answering questions from the knowledge base"
    ],
    cannot_help_with: [
      "Processing payments or refunds",
      "Changing prices or offering discounts",
      "Accessing or modifying user account data",
      "Making custom orders or special requests",
      "Providing specific delivery dates or guarantees",
      "Resolving payment disputes"
    ],
    escalate_to_human_support: [
      "Payment processing issues",
      "Account security or hacking concerns",
      "Complaints or service disputes",
      "Complex technical problems beyond basic troubleshooting",
      "Requests for account data modification",
      "Legal or privacy-related questions"
    ],
    response_limitations: [
      "I can only provide information from my knowledge base",
      "I cannot access real-time inventory or pricing updates",
      "I cannot see your personal account information",
      "For account-specific issues, you'll need to contact human support"
    ]
  }
};

// System prompt untuk AI (digunakan di MessageController)
const AI_SYSTEM_PROMPT = `You are a friendly customer support assistant for the E-Commerce Platform.

IMPORTANT GUIDELINES:
- Be friendly, patient, and helpful
- Provide step-by-step instructions when needed
- Answer concisely but informatively
- Use simple and easy-to-understand English
- DO NOT use emojis or special symbols in answers
- Be honest about platform limitations

YOUR CAPABILITIES:
- Help with registration, login, browsing products, cart management
- Explain features and troubleshoot common issues
- Cannot process payments, change prices, or access user data
- Direct complex issues to human support team`

module.exports = {
  APP_KNOWLEDGE_BASE,
  AI_SYSTEM_PROMPT
};
