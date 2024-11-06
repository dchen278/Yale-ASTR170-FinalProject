import numpy as np
from tensorflow.keras.models import load_model
from sklearn.metrics import classification_report, confusion_matrix

def load_dataset(prefix):
    X = np.load(f"{prefix}_X.npy")
    y = np.load(f"{prefix}_y.npy")
    return X, y

if __name__ == "__main__":
    X_val, y_val = load_dataset('val')
    model = load_model('best_model.h5')
    y_pred = model.predict(X_val)
    y_pred_classes = y_pred.argmax(axis=1)
    print(classification_report(y_val, y_pred_classes))
    print(confusion_matrix(y_val, y_pred_classes))
