import pandas as pd
import numpy as np
import os
from PIL import Image
from sklearn.model_selection import train_test_split

def load_data(csv_path, images_dir):
    df = pd.read_csv(csv_path)
    image_paths = df['image_name'].apply(lambda x: os.path.join(images_dir, x)).values
    labels = df['label'].values
    return image_paths, labels

def preprocess_image(image_path, target_size=(128, 128)):
    image = Image.open(image_path).convert('RGB')
    image = image.resize(target_size)
    image_array = np.array(image) / 255.0
    return image_array

def create_dataset(image_paths, labels):
    images = np.array([preprocess_image(path) for path in image_paths])
    labels = np.array(labels)
    return images, labels

def save_dataset(X, y, prefix):
    np.save(f"{prefix}_X.npy", X)
    np.save(f"{prefix}_y.npy", y)

if __name__ == "__main__":
    csv_path = 'data.csv'
    images_dir = 'images'
    image_paths, labels = load_data(csv_path, images_dir)
    X, y = create_dataset(image_paths, labels)
    X_train, X_val, y_train, y_val = train_test_split(
        X, y, test_size=0.2, random_state=42)
    save_dataset(X_train, y_train, 'train')
    save_dataset(X_val, y_val, 'val')
