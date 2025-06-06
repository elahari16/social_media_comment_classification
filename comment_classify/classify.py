#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys
import pickle
import json
import os

def classify_comment(comment_text, model_path, vectorizer_path):
    """
    Classify a comment using the pre-trained model
    """
    try:
        # Load the model and vectorizer
        with open(model_path, 'rb') as f:
            model = pickle.load(f)
        
        with open(vectorizer_path, 'rb') as f:
            vectorizer = pickle.load(f)
        
        # Vectorize the comment
        comment_vector = vectorizer.transform([comment_text])
        
        # Get prediction and probability
        prediction = model.predict(comment_vector)[0]
        probabilities = model.predict_proba(comment_vector)[0]
        
        # Get confidence score (probability of the predicted class)
        confidence = probabilities[1] if prediction == 1 else probabilities[0]
        
        # Return result as JSON
        result = {
            "is_toxic": bool(prediction),
            "confidence": float(confidence)
        }
        
        print(json.dumps(result))
        return result
        
    except Exception as e:
        # Return error as JSON
        error_result = {
            "error": str(e),
            "is_toxic": False,
            "confidence": 0.5
        }
        print(json.dumps(error_result))
        return error_result

if __name__ == "__main__":
    # Get command line arguments
    if len(sys.argv) >= 4:
        comment_text = sys.argv[1]
        model_path = sys.argv[2]
        vectorizer_path = sys.argv[3]
        classify_comment(comment_text, model_path, vectorizer_path)
    else:
        print(json.dumps({"error": "Missing arguments", "is_toxic": False, "confidence": 0.5}))