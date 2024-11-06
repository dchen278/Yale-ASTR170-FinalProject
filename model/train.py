import numpy as np
from model import create_model
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping

def load_dataset(prefix):
    X = np.load(f"{prefix}_X.npy")
    y = np.load(f"{prefix}_y.npy")
    return X, y

if __name__ == "__main__":
    X_train, y_train = load_dataset('train')
    X_val, y_val = load_dataset('val')

    model = create_model()
    model.compile(optimizer=Adam(learning_rate=1e-4),
                  loss='sparse_categorical_crossentropy',
                  metrics=['accuracy'])

    checkpoint = ModelCheckpoint('best_model.h5', monitor='val_accuracy', save_best_only=True)
    early_stopping = EarlyStopping(monitor='val_accuracy', patience=5)

    model.fit(X_train, y_train,
              validation_data=(X_val, y_val),
              epochs=25,
              batch_size=32,
              callbacks=[checkpoint, early_stopping])
