import { Button, Card, Stack, TextField, Typography, CircularProgress, Chip } from "@mui/material";
import { Box } from "@mui/system";
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createComment, getComments } from "../api/posts";
import { isLoggedIn } from "../helpers/authHelper";
import Comment from "./Comment";
import CommentEditor from "./CommentEditor";
import Loading from "./Loading";
import SortBySelect from "./SortBySelect";
import HorizontalStack from "./util/HorizontalStack";
import { isToxicComment } from "../api/posts";
import { classifyComment } from "./CommentClassifier";

const Comments = ({ postId, onCommentPosted }) => {
  const [comments, setComments] = useState(null);
  const [rerender, setRerender] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState("-createdAt");
  const [commentCount, setCommentCount] = useState(0);
  const [commentText, setCommentText] = useState("");
  const navigate = useNavigate();
  const params = useParams();

  const fetchComments = useCallback(async () => {
    if (!postId && !params.id) {
      console.error("No post ID provided for comments");
      return;
    }
    
    // Always show loading indicator for better UX
    setLoading(true);
    
    try {
      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      console.log("Fetching comments for post:", postId || params.id);
      const data = await getComments({ 
        id: postId || params.id, 
        sortBy,
        _nocache: timestamp 
      });
      console.log("Comments received:", data);
      
      if (data && data.error) {
        setError(data.error);
        console.error("Error fetching comments:", data.error);
      } else if (Array.isArray(data)) {
        // Group comments by toxic/non-toxic if needed
        const sortedComments = sortBy === "classification" 
          ? [...data].sort((a, b) => (a.is_toxic === b.is_toxic) ? 0 : a.is_toxic ? 1 : -1)
          : data;
          
        setComments(sortedComments);
        setCommentCount(data.length);
        console.log("Comments updated, count:", data.length);
      } else {
        setError("Invalid response format");
        console.error("Invalid comments data:", data);
      }
    } catch (err) {
      console.error("Exception in fetchComments:", err);
      setError("Failed to fetch comments");
    } finally {
      setLoading(false);
    }
  }, [postId, params.id, sortBy]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments, rerender]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const content = commentText.trim();

    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }

    if (content === "") {
      setError("Comment cannot be empty");
      return;
    }

    // Don't set submitting state to avoid loading indicator
    setError("");
    
    // Classify comment immediately using the dedicated classifier
    const classification = classifyComment(content);
    
    // Create a complete comment object with classification
    const newComment = {
      _id: "temp_" + Date.now(),
      content: content,
      commenter: {
        _id: isLoggedIn().userId,
        username: isLoggedIn().username || "You"
      },
      createdAt: new Date().toISOString(),
      is_toxic: classification.is_toxic,
      classification: classification.classification,
      isTemp: true
    };
    
    // Add the comment immediately
    setComments(prevComments => [newComment, ...(prevComments || [])]);
    setCommentCount(prev => prev + 1);
    
    // Reset form immediately
    setCommentText("");
    
    // Make the API call in the background
    createComment(
      { content },
      { id: postId || params.id },
      isLoggedIn()
    ).then(data => {
      if (data && data.error) {
        // Remove the temporary comment if there was an error
        setComments(prevComments => prevComments.filter(c => c._id !== newComment._id));
        setCommentCount(prev => prev - 1);
        setError(data.error);
      } else if (data) {
        // Replace the temporary comment with the real one, keeping our classification
        setComments(prevComments => 
          prevComments.map(c => c._id === newComment._id ? {
            ...data,
            is_toxic: classification.is_toxic,
            classification: classification.classification
          } : c)
        );
        
        // Notify parent component that a comment was posted
        if (onCommentPosted) {
          onCommentPosted(data);
        }
      }
    }).catch(err => {
      console.error("Error posting comment:", err);
      setError("Failed to post comment");
    });
  };
  
  // Function to add a new comment from CommentEditor
  const addComment = async (newComment) => {
    if (newComment.remove) {
      // Remove a temporary comment if there was an error
      setComments(prevComments => prevComments.filter(c => c._id !== newComment._id));
      setCommentCount(prev => prev - 1);
      return;
    }
    
    if (newComment.replaceId) {
      // Replace a temporary comment with the real one
      setComments(prevComments => 
        prevComments.map(c => c._id === newComment.replaceId ? {...newComment, replaceId: undefined} : c)
      );
      return;
    }
    
    // Add the comment to the state immediately
    if (Array.isArray(comments)) {
      // Apply immediate classification using the dedicated classifier
      const classification = classifyComment(newComment.content);
      const commentWithClassification = {
        ...newComment,
        is_toxic: classification.is_toxic,
        classification: classification.classification
      };
      
      setComments(prevComments => [commentWithClassification, ...prevComments]);
      setCommentCount(prev => prev + 1);
    }
    
    // Notify parent component that a comment was posted
    if (onCommentPosted) {
      onCommentPosted(newComment);
    }
  };

  const handleSortBy = (e) => {
    setSortBy(e.target.value);
  };

  return (
    <Card sx={{ padding: 2, width: "100%", borderRadius: "8px" }}>
      <Stack spacing={2}>
        <HorizontalStack justifyContent="space-between">
          <Box>
            <Typography variant="h6">
              {commentCount} Comment{commentCount !== 1 && "s"}
            </Typography>
            {comments && comments.length > 0 && (
              <HorizontalStack spacing={1} sx={{ mt: 1 }}>
                <Chip 
                  size="small" 
                  label={`${comments.filter(c => !c.is_toxic).length} Appropriate`} 
                  color="success" 
                  variant="outlined"
                />
                <Chip 
                  size="small" 
                  label={`${comments.filter(c => c.is_toxic).length} Flagged`} 
                  color="error" 
                  variant="outlined"
                />
              </HorizontalStack>
            )}
          </Box>
          <SortBySelect onSortBy={handleSortBy} sortBy={sortBy} />
        </HorizontalStack>

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            multiline
            fullWidth
            label="Write a comment..."
            rows={3}
            required
            name="content"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            sx={{
              backgroundColor: "white",
              mb: 2
            }}
          />
          <Button
            variant="contained"
            type="submit"
            fullWidth
            sx={{ mb: 2 }}
          >
            Post Comment
          </Button>
        </Box>

        {error && (
          <Typography color="error" variant="body2">
            {error}
          </Typography>
        )}

        {loading ? (
          <Loading />
        ) : comments && comments.length > 0 ? (
          <Stack spacing={2}>
            {comments.map((comment) => (
              <Comment
                key={comment._id + (comment.isTemp ? "-temp" : "")}
                comment={comment}
                setRerender={setRerender}
                rerender={rerender}
                addComment={addComment}
                removeComment={(commentToRemove) => {
                  setComments((prevComments) => 
                    prevComments.filter((c) => c._id !== commentToRemove._id)
                  );
                  setCommentCount((prevCount) => prevCount - 1);
                }}
                editComment={(editedComment) => {
                  // Apply immediate classification when editing
                  const classification = classifyComment(editedComment.content);
                  const updatedComment = {
                    ...editedComment,
                    is_toxic: classification.is_toxic,
                    classification: classification.classification
                  };
                  
                  setComments((prevComments) =>
                    prevComments.map((c) =>
                      c._id === updatedComment._id ? updatedComment : c
                    )
                  );
                }}
                depth={0}
              />
            ))}
          </Stack>
        ) : (
          <Typography variant="body1" color="text.secondary">
            No comments yet. Be the first to comment!
          </Typography>
        )}
      </Stack>
    </Card>
  );
};

export default Comments;