import os
from dotenv import load_dotenv
import google.generativeai as genai
import flask
from flask import request, render_template, jsonify
import markdown


# Load environment variables
load_dotenv()


genai.configure(api_key=os.environ["GEMINI_API_KEY"])


# Model configuration
generation_config = {
    "temperature": 0.9,
    "top_p": 0.95,
    "top_k": 64,
    "max_output_tokens": 8192,
    "response_mime_type": "text/plain",
}


safety_settings = [
    {
        "category": "HARM_CATEGORY_HARASSMENT",
        "threshold": "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
        "category": "HARM_CATEGORY_HATE_SPEECH",
        "threshold": "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
        "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        "threshold": "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
        "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
        "threshold": "BLOCK_MEDIUM_AND_ABOVE",
    },
]


model = genai.GenerativeModel(
    model_name="gemini-2.5-flash", 
    safety_settings=safety_settings,
    generation_config=generation_config,
    system_instruction="You are a helpful AI assistant. Provide clear, accurate, and friendly responses."
)

chat_session = model.start_chat(history=[])
app = flask.Flask(__name__)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/chat', methods=['POST'])
def chat():
    print("Received chat request")
    try:
        data = request.get_json()
        user_message = data.get('message', '')
        
        if not user_message:
            return jsonify({'error': 'No message provided'}), 400
        
        response = chat_session.send_message(user_message)

        response_html = markdown.markdown(response.text)
        
        return jsonify({
            'user_message': user_message,
            'bot_response': response_html,
            'success': True
        })
        
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)