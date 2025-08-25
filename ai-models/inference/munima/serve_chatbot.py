import torch
import torch.nn as nn
from flask import Flask, request, jsonify
import numpy as np
from inference.munima.response_generator import generate_response  # Must exist

# -----------------------------
# Model Definition
# -----------------------------
class ChatBotModel(nn.Module):
    def __init__(self, input_size, hidden_size, output_size):
        super(ChatBotModel, self).__init__()
        self.fc1 = nn.Linear(input_size, hidden_size)
        self.relu = nn.ReLU()
        self.fc2 = nn.Linear(hidden_size, output_size)

    def forward(self, x):
        x = self.fc1(x)
        x = self.relu(x)
        return self.fc2(x)

# -----------------------------
# Model Configuration
# -----------------------------
INPUT_SIZE = 100
HIDDEN_SIZE = 128
OUTPUT_SIZE = 8
CONFIDENCE_THRESHOLD = 0.60  # Minimum confidence to accept intent

INTENT_CLASSES = [
    "greeting", "goodbye", "thanks", "info", 
    "help", "vuln_query", "tool_recommend", "fallback"
]

# -----------------------------
# Load Trained Model
# -----------------------------
model = ChatBotModel(INPUT_SIZE, HIDDEN_SIZE, OUTPUT_SIZE)
model.load_state_dict(torch.load("ai-models/models/munima/chatbot_model_v1.pt"))
model.eval()

# -----------------------------
# Flask App Setup
# -----------------------------
app = Flask(__name__)

# -----------------------------
# Dummy Preprocessor (Replace with real vectorizer)
# -----------------------------
def preprocess(text):
    # Replace with real TF-IDF or embedding vector
    return torch.tensor(np.random.rand(1, INPUT_SIZE), dtype=torch.float)

# -----------------------------
# Chat Endpoint
# -----------------------------
@app.route("/munima/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()
        user_input = data.get("message", "").strip()

        if not user_input:
            return jsonify({"error": "Message field is empty"}), 400

        input_tensor = preprocess(user_input)

        with torch.no_grad():
            output = model(input_tensor)
            predicted_probs = torch.softmax(output, dim=1)
            predicted_index = torch.argmax(predicted_probs, dim=1).item()
            confidence = predicted_probs[0][predicted_index].item()

            intent = INTENT_CLASSES[predicted_index]
            if confidence < CONFIDENCE_THRESHOLD:
                intent = "fallback"

        reply = generate_response(intent)

        return jsonify({
            "intent": intent,
            "confidence": round(confidence, 3),
            "response": reply
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# -----------------------------
# Run Server
# -----------------------------
if __name__ == "__main__":
    app.run(debug=True)
