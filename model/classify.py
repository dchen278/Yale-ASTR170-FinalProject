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
    CORS(app, resources={r"/generate_plot": {"origins": "http://localhost:3000"}})

# Load model
cnn_model = load_model("cnn_model.h5")

# ********************************************************CLASSIFY********************************************************
# CLASSIFY
@app.route('/classify', methods=['POST'])
def classify():
    # TODO: SETUP THIS CODE DAVID
    # Extract and parse input image
    data = request.json
    input_str = data.get('input_str', '')

    # TODO: YOU JUST NEED TO LOAD IN THE IMAGE PATH
    # Load image
    img_path = "./images/image_0.png"
    img = imread(img_path)
    resized_img = resize(img, (69, 69), anti_aliasing=False, preserve_range=True).astype(np.uint8)
    resized_img = resized_img[:, :, :3]
    image = np.expand_dims(resized_img, axis=0).astype(np.float32) / 255.0

    # Predict
    predicted_labels = cnn_model.predict(image)
    prediction_class = np.argmax(predicted_labels, axis=1)

    # Lookup
    classify_string = galaxy10cls_lookup(prediction_class)

    # Return
    return jsonify({
        'classify': classify_string,
    })

# ********************************************************RUN APP********************************************************
if __name__ == "__main__":
    if prod == True:
        # Prod (GCP or Ngrok)
        app.run(host="0.0.0.0", port=5000)
    else:
        # Local
        app.run(debug=False)