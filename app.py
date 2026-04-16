from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# Home Page
@app.route('/')
def home():
    return render_template('index.html')

# SOS API
@app.route('/sos', methods=['POST'])
def sos():
    return jsonify({"message": "SOS Alert Sent Successfully!"})

# Login API
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    return jsonify({"message": f"Welcome {data.get('email')}"})

# Signup API
@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    return jsonify({"message": "Account Created Successfully"})

# Alert API
@app.route('/alert', methods=['POST'])
def alert():
    data = request.json
    return jsonify({"message": "Alert Broadcasted!"})

if __name__ == '__main__':
    app.run(debug=True)
