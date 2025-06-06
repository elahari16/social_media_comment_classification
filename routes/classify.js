const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");

// Load Python-shell for running Python scripts
let PythonShell;
try {
  PythonShell = require('python-shell').PythonShell;
} catch (err) {
  console.error("Python-shell not installed. Using fallback classification.");
}

// Path to the trained model files
const MODEL_PATH = path.join(__dirname, "../comment_classify/model.pkl");
const VECTORIZER_PATH = path.join(__dirname, "../comment_classify/vectorizer.pkl");

// Check if model files exist
const modelExists = fs.existsSync(MODEL_PATH) && fs.existsSync(VECTORIZER_PATH);

/**
 * Classify a comment using the pre-trained model
 */
router.post("/comment", async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: "Comment content is required" });
    }
    
    // If model exists and Python-shell is available, use the trained model
    if (modelExists && PythonShell) {
      const options = {
        mode: 'text',
        pythonPath: 'python', // Adjust if your Python executable is different
        pythonOptions: ['-u'], // unbuffered output
        scriptPath: path.join(__dirname, '../comment_classify'),
        args: [content, MODEL_PATH, VECTORIZER_PATH]
      };
      
      PythonShell.run('classify.py', options, function (err, results) {
        if (err) {
          console.error("Error running Python classifier:", err);
          return fallbackClassify(content, res);
        }
        
        try {
          const result = JSON.parse(results[0]);
          return res.json({
            is_toxic: result.is_toxic,
            classification: result.is_toxic ? "toxic" : "non-toxic",
            confidence: result.confidence || 0.9,
            model: "trained"
          });
        } catch (parseErr) {
          console.error("Error parsing Python output:", parseErr);
          return fallbackClassify(content, res);
        }
      });
    } else {
      // Use fallback classification if model doesn't exist
      return fallbackClassify(content, res);
    }
  } catch (error) {
    console.error("Error in comment classification:", error);
    res.status(500).json({ error: "Failed to classify comment" });
  }
});

/**
 * Fallback classification function using simple word matching
 */
function fallbackClassify(content, res) {
  const lowerContent = content.toLowerCase();
  
  // Tamil slang toxic words
  const tamilToxicWords = [
    'punda', 'otha', 'thevdiya', 'baadu', 'thevidiya', 'sunni', 
    'ennoda', 'naaye', 'loosu', 'venna', 'koothi', 'thayoli',
    'ommala', 'myir', 'kaai', 'molai', 'layam', 'akka', 'thangachi',
    'poolu', 'sappi', 'oombu', 'baadu', 'pundai', 'soothu', 'munda',
    'lavada', 'chunni', 'pavadai', 'thevudiya', 'puluthi', 'kena'
  ];

  // English toxic words
  const englishToxicWords = [
    'hate', 'stupid', 'idiot', 'dumb', 'terrible', 'awful', 'worst',
    'bad', 'ugly', 'horrible', 'nasty', 'evil', 'fuck', 'shit', 'ass',
    'bitch', 'damn', 'crap', 'fool', 'moron', 'jerk', 'loser'
  ];
  
  // Check for toxic words
  const isToxic = 
    tamilToxicWords.some(word => lowerContent.includes(word)) || 
    englishToxicWords.some(word => lowerContent.includes(word));
  
  return res.json({
    is_toxic: isToxic,
    classification: isToxic ? "toxic" : "non-toxic",
    confidence: isToxic ? 0.85 : 0.75,
    model: "fallback"
  });
}

module.exports = router;