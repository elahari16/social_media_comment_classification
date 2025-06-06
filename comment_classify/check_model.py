#!/usr/bin/env python
# -*- coding: utf-8 -*-

import pickle
import os
import sys
import datetime

def check_model():
    """
    Check if the model files exist and display their information
    """
    model_path = os.path.join(os.path.dirname(__file__), "model.pkl")
    vectorizer_path = os.path.join(os.path.dirname(__file__), "vectorizer.pkl")
    
    print("\n=== PKL File Check ===")
    
    # Check if files exist
    if not os.path.exists(model_path):
        print(f"❌ Model file not found: {model_path}")
        return False
    
    if not os.path.exists(vectorizer_path):
        print(f"❌ Vectorizer file not found: {vectorizer_path}")
        return False
    
    # Get file information
    model_size = os.path.getsize(model_path) / (1024 * 1024)  # Size in MB
    vectorizer_size = os.path.getsize(vectorizer_path) / (1024 * 1024)  # Size in MB
    
    model_modified = datetime.datetime.fromtimestamp(os.path.getmtime(model_path))
    vectorizer_modified = datetime.datetime.fromtimestamp(os.path.getmtime(vectorizer_path))
    
    print(f"✅ Model file found: {model_path}")
    print(f"   - Size: {model_size:.2f} MB")
    print(f"   - Last modified: {model_modified}")
    
    print(f"✅ Vectorizer file found: {vectorizer_path}")
    print(f"   - Size: {vectorizer_size:.2f} MB")
    print(f"   - Last modified: {vectorizer_modified}")
    
    # Try to load the files
    try:
        print("\nLoading model...")
        with open(model_path, 'rb') as f:
            model = pickle.load(f)
        
        print("✅ Model loaded successfully")
        print(f"   - Type: {type(model).__name__}")
        
        # Get model info if available
        if hasattr(model, 'get_params'):
            print("   - Parameters:", model.get_params())
        
        print("\nLoading vectorizer...")
        with open(vectorizer_path, 'rb') as f:
            vectorizer = pickle.load(f)
        
        print("✅ Vectorizer loaded successfully")
        print(f"   - Type: {type(vectorizer).__name__}")
        
        # Test classification
        print("\nTesting classification...")
        test_texts = [
            "This is a good comment",
            "I hate this, it's stupid"
        ]
        
        for text in test_texts:
            # Transform text using vectorizer
            text_vector = vectorizer.transform([text])
            
            # Predict using model
            prediction = model.predict(text_vector)[0]
            probabilities = model.predict_proba(text_vector)[0]
            
            print(f"\nText: '{text}'")
            print(f"   - Prediction: {'Toxic' if prediction == 1 else 'Non-toxic'}")
            print(f"   - Confidence: {max(probabilities):.2f}")
        
        return True
    
    except Exception as e:
        print(f"❌ Error loading model: {str(e)}")
        return False

if __name__ == "__main__":
    check_model()