# File: ai-models/inference/munima/response_generator.py

import random

RESPONSE_MAP = {
    "greeting": [
        "Hello! How can I assist you with cybersecurity today?",
        "Hi there! What would you like to learn?"
    ],
    "goodbye": [
        "Goodbye! Stay safe and keep learning.",
        "See you later!"
    ],
    "thanks": [
        "You're welcome!",
        "Glad I could help!"
    ],
    "info": [
        "I'm Munima, your AI learning assistant. Ask me anything about cybersecurity.",
        "I assist learners in understanding cybersecurity topics like vulnerabilities, tools, and threats."
    ],
    "help": [
        "You can ask me about topics like 'What is XSS?' or 'Recommend scanning tools.'",
        "Try asking about cybersecurity threats or useful tools."
    ],
    "vuln_query": [
        "SQL Injection allows attackers to manipulate database queries via input fields.",
        "Cross-Site Scripting (XSS) injects malicious scripts into web apps."
    ],
    "tool_recommend": [
        "Useful tools include OWASP ZAP, Burp Suite, Nmap, and Nessus.",
        "Try Nikto or OpenVAS for web and network vulnerability scanning."
    ],
    "fallback": [
        "I'm not sure I understood that. Can you rephrase?",
        "Hmm, I didn’t catch that. Try asking differently!"
    ]
}

def generate_response(intent: str) -> str:
    return random.choice(RESPONSE_MAP.get(intent, RESPONSE_MAP["fallback"]))
