// Comment classification service using the pre-trained model
import axios from 'axios';
import { BASE_URL } from '../config';

// Cache for classification results to avoid repeated API calls
const classificationCache = new Map();

/**
 * Classifies a comment using the pre-trained model on the server
 * @param {string} content - The comment text to classify
 * @returns {Promise<Object>} - Classification result with is_toxic flag and classification label
 */
export const classifyComment = async (content) => {
  // Return from cache if available
  if (classificationCache.has(content)) {
    return classificationCache.get(content);
  }
  
  try {
    // Call the server API that uses the pre-trained model
    const response = await axios.post(`${BASE_URL}api/classify/comment`, { content });
    
    // Cache the result
    classificationCache.set(content, response.data);
    return response.data;
  } catch (error) {
    console.error('Error classifying comment:', error);
    
    // Fallback to simple classification if API fails
    const result = simpleClassify(content);
    classificationCache.set(content, result);
    return result;
  }
};

/**
 * Simple fallback classification function
 * @param {string} content - The comment text to classify
 * @returns {Object} - Classification result
 */
const simpleClassify = (content) => {
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
  
  return {
    is_toxic: isToxic,
    classification: isToxic ? "toxic" : "non-toxic",
    confidence: isToxic ? 0.85 : 0.75
  };
};

/**
 * Synchronous version for immediate classification
 * @param {string} content - The comment text to classify
 * @returns {boolean} - Whether the comment is toxic
 */
export const isToxicComment = (content) => {
  // Check cache first
  if (classificationCache.has(content)) {
    return classificationCache.get(content).is_toxic;
  }
  
  // Use simple classification as fallback
  return simpleClassify(content).is_toxic;
};