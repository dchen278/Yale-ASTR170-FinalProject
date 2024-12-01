# Yale ASTR 170, Fall 2024

This repository contains the source code for the final project of ASTR 170, Fall 2024. 

## Authors
- David Chen (david.chen.dc2546@yale.edu)
- Jonathan Fan (jonathan.fan@yale.edu)
- Bryant Li (bryant.li@yale.edu)

## Installation

## Running the Web Application
To run the web application, you will need to run the following command in the root directory of the project:
```bash
yarn install # or npm install
```
Then, run the following command:
```bash
yarn dev
```
You can then access the web application by navigating to `http://localhost:3000` in your web browser.

## Running the Model
To run the model, you will need to run the following command in the root directory of the project:

```bash
pip install -r requirements.txt
```

Get the dataset from [Kaggle](https://www.kaggle.com/datasets/saurabhshahane/galaxy-classification) and place it in the `model` directory.

Then, run the following command:

```bash
python create_dataset.py
```

To run the server, run the following command:

```bash
python classify.py
```

## Topic
Our project aims to classify images of galaxies via convolutional neural networks (CNN) by identifying specific visual features and similarities to galaxies of the same type.
## Format
The final project will be a web application that takes in image input for galaxy classification. The output will be the type of galaxy identified and a brief explanation of what it is. 
## Scope Definition
We will train a CNN model to classify whether an uploaded galaxy image is an elliptical, non-barred spiral, barred spiral, or lenticular galaxy.

## Technologies Used
- Python
- TensorFlow
- Keras
- Flask
- NumPy
- Next.js
- Tailwind CSS

## References
https://astronn.readthedocs.io/en/latest/index.html