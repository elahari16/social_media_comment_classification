from flask import Flask, request, jsonify, render_template
import pickle

app = Flask(__name__, template_folder="templates")

# Load model & vectorizer
model = pickle.load(open("model.pkl", "rb"))
vectorizer = pickle.load(open("vectorizer.pkl", "rb"))

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/predict", methods=["POST"])
def api_predict():
    data = request.get_json()
    message = data.get("message", "").strip()

    if not message:
        return jsonify({"error": "No message provided"}), 400

    vector = vectorizer.transform([message])
    prediction = model.predict(vector)[0]
    result = "Toxic" if prediction == 1 else "Not Toxic"

    return jsonify({"message": message, "prediction": result})

if __name__ == "__main__":
    app.run(debug=True, port=5000)