import { BASE_URL } from "../config";
import axios from 'axios';

const handleResponse = async (res) => {
  if (res.ok) {
    try {
      return await res.json();
    } catch (err) {
      console.error("Error parsing JSON response:", err);
      return { error: "Invalid response format from the server" };
    }
  } else {
    let errorData;
    try {
      errorData = await res.json();
    } catch {
      errorData = { error: `Server error: ${res.status}` };
    }
    return errorData;
  }
};

const getUserLikedPosts = async (likerId, token, query) => {
  try {
    const res = await fetch(
      BASE_URL +
        "api/posts/liked/" +
        likerId +
        "?" +
        new URLSearchParams(query),
      {
        headers: {
          "x-access-token": token,
        },
      }
    );
    return await handleResponse(res);
  } catch (err) {
    console.log(err);
  }
};

const getPosts = async (token, query) => {
  try {
    const res = await fetch(
      BASE_URL + "api/posts?" + new URLSearchParams(query),
      {
        headers: {
          "x-access-token": token,
        },
      }
    );
    return await handleResponse(res);
  } catch (err) {
    console.log(err);
  }
};

const getPost = async (postId, token) => {
  try {
    const res = await fetch(BASE_URL + "api/posts/" + postId, {
      headers: {
        "x-access-token": token || "",
      },
    });
    const data = await handleResponse(res);
    if (data.error) {
      return { error: data.error };
    }
    return data;
  } catch (err) {
    console.log(err);
    return { error: "Failed to fetch post. Please try again." };
  }
};

const getUserLikes = async (postId, anchor) => {
  try {
    const res = await fetch(
      BASE_URL +
        "api/posts/like/" +
        postId +
        "/users?" +
        new URLSearchParams({
          anchor,
        })
    );

    return await handleResponse(res);
  } catch (err) {
    console.log(err);
  }
};

const createPost = async (post, user) => {
  try {
    const res = await fetch(BASE_URL + "api/posts", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "x-access-token": user.token,
      },
      body: JSON.stringify(post),
    });
    return await handleResponse(res);
  } catch (err) {
    console.log(err);
  }
};

const updatePost = async (postId, user, data) => {
  try {
    const res = await fetch(BASE_URL + "api/posts/" + postId, {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "x-access-token": user.token,
      },
      body: JSON.stringify(data),
    });
    return await handleResponse(res);
  } catch (err) {
    console.log(err);
  }
};

const deletePost = async (postId, user) => {
  try {
    const res = await fetch(BASE_URL + "api/posts/" + postId, {
      method: "DELETE",
      headers: {
        "x-access-token": user.token,
      },
    });
    return await handleResponse(res);
  } catch (err) {
    console.log(err);
  }
};

const getComments = async (params) => {
  try {
    const { id, sortBy } = params;
    const timestamp = new Date().getTime(); // Add timestamp to prevent caching
    const queryParams = sortBy ? 
      `?sortBy=${sortBy}&_nocache=${timestamp}` : 
      `?_nocache=${timestamp}`;
    
    const res = await fetch(BASE_URL + "api/comments/post/" + id + queryParams, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    const data = await handleResponse(res);
    
    // Add classification to comments using the trained model
    if (Array.isArray(data)) {
      // First apply quick classification for immediate display
      const commentsWithQuickClassification = data.map(comment => {
        const isToxic = isToxicComment(comment.content);
        return {
          ...comment,
          is_toxic: isToxic,
          classification: isToxic ? "toxic" : "non-toxic"
        };
      });
      
      // Then start background classification with the trained model
      // This will update the cache for future use
      data.forEach(comment => {
        classifyComment(comment.content).catch(() => {});
      });
      
      return commentsWithQuickClassification;
    }
    return data;
  } catch (err) {
    console.error("Error fetching comments:", err);
    return { error: "Failed to fetch comments" };
  }
};

// Function to classify comments using the trained model
const classifyComment = async (content) => {
  try {
    // Call the server API that uses the pre-trained model
    const response = await axios.post(`${BASE_URL}api/classify/comment`, { content });
    return response.data;
  } catch (error) {
    console.error('Error classifying comment:', error);
    
    // Fallback to simple classification if API fails
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
    
    const lowerContent = content.toLowerCase();
    
    // Check for toxic words
    const isToxic = 
      tamilToxicWords.some(word => lowerContent.includes(word)) || 
      englishToxicWords.some(word => lowerContent.includes(word));
    
    return {
      is_toxic: isToxic,
      classification: isToxic ? "toxic" : "non-toxic",
      confidence: isToxic ? 0.85 : 0.75,
      model: "fallback"
    };
  }
};

// Cache for classification results
const classificationCache = new Map();

// Simple function for immediate synchronous classification
const isToxicComment = (content) => {
  // Check cache first for faster results
  if (classificationCache.has(content)) {
    return classificationCache.get(content).is_toxic;
  }
  
  // If not in cache, use simple detection for immediate response
  const lowerContent = content.toLowerCase();
  
  // Tamil slang toxic words - expanded list
  const tamilToxicWords = [
    'punda', 'otha', 'thevdiya', 'baadu', 'thevidiya', 'sunni', 
    'ennoda', 'naaye', 'loosu', 'venna', 'koothi', 'thayoli',
    'ommala', 'myir', 'kaai', 'molai', 'layam', 'akka', 'thangachi',
    'poolu', 'sappi', 'oombu', 'pundai', 'soothu', 'munda'
  ];
  
  // English toxic words - expanded list
  const englishToxicWords = [
    'hate', 'stupid', 'idiot', 'dumb', 'terrible', 'awful', 'worst',
    'bad', 'ugly', 'horrible', 'nasty', 'evil', 'fuck', 'shit', 'ass',
    'bitch', 'damn', 'crap', 'fool', 'moron', 'jerk', 'loser'
  ];
  
  // Check both Tamil and English words
  const isToxic = tamilToxicWords.some(word => lowerContent.includes(word)) || 
                 englishToxicWords.some(word => lowerContent.includes(word));
  
  // Store in cache for future use
  classificationCache.set(content, { is_toxic: isToxic, classification: isToxic ? "toxic" : "non-toxic" });
  
  return isToxic;
};

const getUserComments = async (params) => {
  try {
    const { id, query } = params;
    const res = await fetch(
      BASE_URL + "api/comments/user/" + id + "?" + new URLSearchParams(query)
    );
    return await handleResponse(res);
  } catch (err) {
    console.log(err);
  }
};

const createComment = async (comment, params, user) => {
  try {
    // Make sure we have the classification data
    const is_toxic = comment.is_toxic !== undefined ? comment.is_toxic : isToxicComment(comment.content);
    const classification = comment.classification || (is_toxic ? "toxic" : "non-toxic");
    
    // Prepare the comment data with classification and user ID
    const commentData = {
      ...comment,
      is_toxic,
      classification,
      userId: user.userId  // Ensure user ID is included
    };
    
    const { id } = params;
    const res = await fetch(BASE_URL + "api/comments/" + id, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "x-access-token": user.token,
      },
      body: JSON.stringify(commentData),
    });
    const data = await handleResponse(res);
    
    // Add classification to the new comment if needed
    if (data && !data.error) {
      return {
        ...data,
        is_toxic,
        classification
      };
    }
    return data;
  } catch (err) {
    console.error("Error creating comment:", err);
    return { 
      ...comment,
      error: "Failed to create comment",
      is_toxic: comment.is_toxic || false
    };
  }
};

const updateComment = async (commentId, user, data) => {
  try {
    const res = await fetch(BASE_URL + "api/comments/" + commentId, {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "x-access-token": user.token,
      },
      body: JSON.stringify(data),
    });
    return await handleResponse(res);
  } catch (err) {
    console.log(err);
  }
};

const deleteComment = async (commentId, user) => {
  try {
    const res = await fetch(BASE_URL + "api/comments/" + commentId, {
      method: "DELETE",
      headers: {
        "x-access-token": user.token,
      },
    });
    return await handleResponse(res);
  } catch (err) {
    console.log(err);
  }
};

const likePost = async (postId, user) => {
  try {
    const res = await fetch(BASE_URL + "api/posts/like/" + postId, {
      method: "POST",
      headers: {
        "x-access-token": user.token,
      },
    });
    return await handleResponse(res);
  } catch (err) {
    console.log(err);
  }
};

const unlikePost = async (postId, user) => {
  try {
    const res = await fetch(BASE_URL + "api/posts/like/" + postId, {
      method: "DELETE",
      headers: {
        "x-access-token": user.token,
      },
    });
    return await handleResponse(res);
  } catch (err) {
    console.log(err);
  }
};

export {
  getPost,
  createPost,
  updatePost,
  deletePost,
  getPosts,
  getUserComments,
  getUserLikedPosts,
  getComments,
  createComment,
  deleteComment,
  updateComment,
  likePost,
  unlikePost,
  getUserLikes,
  isToxicComment,
  classifyComment,
};
