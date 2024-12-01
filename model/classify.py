import os
import warnings
warnings.filterwarnings('ignore')

import numpy as np

from flask_cors import CORS
from skimage.io import imread
from skimage.transform import resize
from flask import Flask, request, jsonify, g
from tensorflow.keras.models import load_model
from astroNN.datasets.galaxy10sdss import galaxy10cls_lookup

# ********************************************************PRODUCTION PARAMETERS********************************************************
app = Flask(__name__)
prod = False

if prod == True:
    # Prod CORS (This is connecting to the frontend url)
    CORS(app, resources={r"/generate_plot": {"origins": "https://narrativetracker.vercel.app"}})
else:
    # Local CORS
    CORS(app, resources={r"/generate_plot": {"origins": "http://localhost:3001"}})

# Load model
cnn_model = load_model("cnn_model.h5")

# ********************************************************CLASSIFY********************************************************
# CLASSIFY
@app.route('/classify', methods=['POST'])
def classify():
    if 'image' not in request.files:
        print("No image in request.files")
        return jsonify({'error': 'No image provided'}), 400
        
    img_file = request.files['image']
    
    if img_file.filename == '':
        print("No selected file")
        return jsonify({'error': 'No selected file'}), 400

    # Create images directory if it doesn't exist
    if not os.path.exists('./requests'):
        os.makedirs('./requests')

    # Get original filename and save
    filename = img_file.filename
    img_path = os.path.join('./requests', filename)
    img_file.save(img_path)

    # Rest of processing remains the same
    img = imread(img_path)
    resized_img = resize(img, (69, 69), anti_aliasing=False, preserve_range=True).astype(np.uint8)
    resized_img = resized_img[:, :, :3]
    image = np.expand_dims(resized_img, axis=0).astype(np.float32) / 255.0

    # Predict
    predicted_labels = cnn_model.predict(image)
    prediction_class = np.argmax(predicted_labels, axis=1)
    confidence = float(np.max(predicted_labels))

    # Lookup classification
    classification = galaxy10cls_lookup(prediction_class)

    return jsonify({
        'classification': f"{classification}",
        'confidence': confidence,
    })

# ********************************************************RUN APP********************************************************
if __name__ == "__main__":
    if prod == True:
        # Prod (GCP or Ngrok)
        app.run(host="0.0.0.0", port=5000)
    else:
        # Local
        app.run(debug=False)