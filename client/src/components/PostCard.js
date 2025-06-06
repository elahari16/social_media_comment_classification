import {
  IconButton,
  Stack,
  Typography,
  useTheme,
  Paper,
  Box,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { classifyComment as syncClassifyComment } from "./CommentClassifier";
import { AiFillCheckCircle, AiFillEdit, AiFillMessage, AiOutlineMinus, AiFillDelete, AiOutlinePlus } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { deletePost, likePost, unlikePost, updatePost, getComments, createComment, deleteComment, classifyComment } from "../api/posts";
import { isLoggedIn } from "../helpers/authHelper";
import ContentDetails from "./ContentDetails";
import LikeBox from "./LikeBox";
import HorizontalStack from "./util/HorizontalStack";
import ContentUpdateEditor from "./ContentUpdateEditor";
import Markdown from "./Markdown";
import "./postCard.css";
import { MdCancel } from "react-icons/md";
import { BiTrash } from "react-icons/bi";
import UserLikePreview from "./UserLikePreview";

const PostCard = (props) => {
  const { preview, removePost } = props;
  let postData = props.post;
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const user = isLoggedIn();
  const isAuthor = user && user.username === postData.poster?.username;

  const theme = useTheme();
  const iconColor = theme.palette.primary.main;

  const [editing, setEditing] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [post, setPost] = useState(postData);
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);

  let maxHeight = null;
  if (preview === "primary") {
    maxHeight = 250;
  }

  // Initial fetch of comments
  useEffect(() => {
    const fetchComments = async () => {
      if (!post._id) return;
      
      const data = await getComments({ id: post._id });
      if (data && !data.error && Array.isArray(data)) {
        // Add classification to comments if missing
        const processedData = data.map(comment => ({
          ...comment,
          is_toxic: comment.is_toxic || comment.classification === "toxic",
          classification: comment.classification || (comment.is_toxic ? "toxic" : "non-toxic")
        }));
        
        setComments(processedData);
        
        // Auto-show comments if there are any
        if (processedData.length > 0) {
          setShowComments(true);
        }
      }
    };
    
    fetchComments();
  }, [post._id]);

  const handleDeletePost = async (e) => {
    e.stopPropagation();
    if (!confirm) {
      setConfirm(true);
    } else {
      setLoading(true);
      await deletePost(post._id, isLoggedIn());
      setLoading(false);
      if (preview) {
        removePost(post);
      } else {
        navigate("/");
      }
    }
  };

  const handleEditPost = async (e) => {
    e.stopPropagation();
    setEditing(!editing);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const content = e.target.content.value;
    await updatePost(post._id, isLoggedIn(), { content });
    setPost({ ...post, content, edited: true });
    setEditing(false);
  };

  const handleLike = async (liked) => {
    if (liked) {
      setLikeCount(likeCount + 1);
      await likePost(post._id, user);
    } else {
      setLikeCount(likeCount - 1);
      await unlikePost(post._id, user);
    }
  };

  const handleClick = () => {
    if (preview && !editing) {
      navigate("/posts/" + post._id);
    }
  };

  const addComment = async (newComment) => {
    if (!post._id) return;
    const user = isLoggedIn();
    if (!user) return;

    try {
      // Use synchronous classification for immediate feedback
      const classification = syncClassifyComment(newComment);
      
      // Create a temporary comment to show immediately
      const tempComment = {
        _id: "temp_" + Date.now(),
        content: newComment,
        commenter: {
          _id: user.userId,
          username: user.username
        },
        createdAt: new Date().toISOString(),
        is_toxic: classification.is_toxic,
        classification: classification.classification
      };
      
      // Add the temporary comment immediately
      setComments(prev => [tempComment, ...prev]);
      
      // Always ensure comments are visible
      setShowComments(true);
      
      // Create the comment in the database
      const savedComment = await createComment(
        { 
          content: newComment,
          classification: classification.classification,
          is_toxic: classification.is_toxic,
          parentId: null // Ensure parentId is set
        }, 
        { id: post._id }, 
        user
      );
      
      // Replace the temporary comment with the saved one that has a real ID
      if (savedComment && !savedComment.error) {
        setComments(prev => 
          prev.map(c => c._id === tempComment._id ? savedComment : c)
        );
        
        // Force a refresh of comments from server
        setTimeout(async () => {
          const refreshedComments = await getComments({ id: post._id });
          if (refreshedComments && Array.isArray(refreshedComments)) {
            setComments(refreshedComments);
          }
        }, 500);
      }
    } catch (err) {
      console.error("Error creating comment:", err);
    }
  };

  const removeComment = async (commentId) => {
    const user = isLoggedIn();
    if (!user) return;
    
    try {
      console.log(`Deleting comment with ID: ${commentId}`);
      
      // Only remove this specific comment from the UI
      setComments(prev => {
        const filtered = prev.filter(c => c._id !== commentId);
        console.log(`Comments before: ${prev.length}, after: ${filtered.length}`);
        return filtered;
      });
      
      // Then try to delete from server
      await deleteComment(commentId, user);
    } catch (err) {
      console.error("Error deleting comment:", err);
      // Even if there's an error, don't restore the comment
    }
  };

  const toxicCount = comments.filter(c => c.classification === "toxic" || c.is_toxic).length;
  const nonToxicCount = comments.filter(c => c.classification !== "toxic" && !c.is_toxic).length;

  return (
    <Paper
      elevation={2}
      sx={{
        mb: 2,
        borderRadius: "8px",
        overflow: "hidden",
        width: "100%",
        cursor: preview && !editing ? "pointer" : "default",
      }}
      className="post-card"
      onClick={handleClick}
    >
      <Box sx={{ display: "flex" }}>
        <Stack
          justifyContent="flex-start"
          alignItems="center"
          spacing={1}
          sx={{
            backgroundColor: "background.light",
            width: "60px",
            padding: theme.spacing(1),
            height: "100%",
          }}
        >
          <LikeBox likeCount={likeCount} liked={post.liked} onLike={handleLike} />
        </Stack>

        <Box sx={{ padding: 2, width: "100%" }}>
          <HorizontalStack justifyContent="space-between">
            <ContentDetails
              username={post.poster?.username || "Unknown"}
              createdAt={post.createdAt}
              edited={post.edited}
            />
            <Box>
              {user && (isAuthor || user.isAdmin) && preview !== "secondary" && (
                <HorizontalStack>
                  <IconButton disabled={loading} size="small" onClick={handleEditPost}>
                    {editing ? <MdCancel color={iconColor} /> : <AiFillEdit color={iconColor} />}
                  </IconButton>
                  <IconButton disabled={loading} size="small" onClick={handleDeletePost}>
                    {confirm ? (
                      <AiFillCheckCircle color={theme.palette.error.main} />
                    ) : (
                      <BiTrash color={theme.palette.error.main} />
                    )}
                  </IconButton>
                </HorizontalStack>
              )}
            </Box>
          </HorizontalStack>

          <Typography
            variant="h5"
            gutterBottom
            sx={{
              overflow: "hidden",
              mt: 1,
              maxHeight: 125,
              fontSize: "1.5rem",
              fontWeight: "bold",
            }}
            className="title"
          >
            {post.title || "Untitled Post"}
          </Typography>

          {preview !== "secondary" &&
            (editing ? (
              <ContentUpdateEditor handleSubmit={handleSubmit} originalContent={post.content} />
            ) : (
              <Box
                maxHeight={maxHeight}
                overflow="hidden"
                className="content"
                sx={{
                  fontSize: "1.1rem",
                  lineHeight: 1.6,
                }}
              >
                <Markdown content={post.content || ""} />
              </Box>
            ))}

          <HorizontalStack sx={{ mt: 2 }} justifyContent="space-between">
            <HorizontalStack>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowComments(!showComments);
                }}
              >
                <AiFillMessage color={theme.palette.text.secondary} size={20} />
              </IconButton>
              <HorizontalStack spacing={1} alignItems="center">
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: "bold", ml: 0.5 }}>
                  {comments.length}
                </Typography>
                
                {toxicCount > 0 && (
                  <HorizontalStack spacing={0.5} alignItems="center">
                    <Box 
                      sx={{ 
                        width: 12, 
                        height: 12, 
                        borderRadius: '50%', 
                        bgcolor: 'error.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Typography variant="caption" sx={{ color: 'white', fontSize: '9px', fontWeight: 'bold' }}>
                        !
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="error.main" sx={{ fontWeight: "bold" }}>
                      {toxicCount}
                    </Typography>
                  </HorizontalStack>
                )}
                
                {nonToxicCount > 0 && (
                  <HorizontalStack spacing={0.5} alignItems="center">
                    <Box 
                      sx={{ 
                        width: 12, 
                        height: 12, 
                        borderRadius: '50%', 
                        bgcolor: 'success.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Typography variant="caption" sx={{ color: 'white', fontSize: '9px', fontWeight: 'bold' }}>
                        ✓
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="success.main" sx={{ fontWeight: "bold" }}>
                      {nonToxicCount}
                    </Typography>
                  </HorizontalStack>
                )}
              </HorizontalStack>
              {comments.length > 0 && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowComments(!showComments);
                }}
                title={showComments ? "Minimize comments" : "Show comments"}
              >
                <AiOutlineMinus color={theme.palette.text.secondary} size={20} />
              </IconButton>
              )}
            </HorizontalStack>
            <Box>
              <UserLikePreview postId={post._id} userLikePreview={post.userLikePreview || []} />
            </Box>
          </HorizontalStack>

          {/* Always render the comment section, but conditionally show it */}
          <Box sx={{ mt: 2, display: showComments ? 'block' : 'none' }}>
            <CommentSection 
              postId={post._id} 
              addComment={addComment} 
              removeComment={removeComment} 
              comments={comments} 
            />
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

const CommentSection = ({ postId, addComment, removeComment: parentRemoveComment, comments }) => {
  const [comment, setComment] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [minimized, setMinimized] = React.useState({});
  const [localComments, setLocalComments] = React.useState([]);
  const [commentCount, setCommentCount] = React.useState(0);
  const user = isLoggedIn();
  
  // Initialize local comments from props and ensure they're always up to date
  React.useEffect(() => {
    if (Array.isArray(comments)) {
      // Keep local comments that aren't in the server comments
      const localOnly = localComments.filter(local => 
        local._id.startsWith('local_') && 
        !comments.some(server => server.content === local.content)
      );
      
      // Combine server comments with local-only comments
      setLocalComments([...comments, ...localOnly]);
    }
  }, [comments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    const commentText = comment.trim();
    
    // Increment comment count
    setCommentCount(count => count + 1);
    
    // Classify the comment immediately
    const classification = syncClassifyComment(commentText);
    
    // Create the comment object with classification
    const newComment = {
      _id: "local_" + Date.now(),
      content: commentText,
      commenter: {
        _id: user?.userId,
        username: user?.username || "You"
      },
      createdAt: new Date().toISOString(),
      is_toxic: classification.is_toxic,
      classification: classification.classification,
      isClassifying: false
    };
    
    // Reset form immediately
    setComment("");
    
    // Add to local comments - do this after resetting the form
    setLocalComments(prev => {
      return [newComment, ...(Array.isArray(prev) ? prev : [])];
    });
    
    try {
      // Submit the comment to server and wait for response
      await addComment(commentText);
    } catch (err) {
      console.error("Error posting comment:", err);
    }
  };

  // Make sure we always have valid comments
  React.useEffect(() => {
    if (!Array.isArray(localComments)) {
      setLocalComments([]);
    }
  }, []);

  return (
    <>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", gap: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Add a comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={false}
          key={`comment-input-${commentCount}`} // Force re-render on submission
        />
        <Button 
          type="submit" 
          variant="contained" 
          disabled={!comment.trim()}
        >
          Post
        </Button>
      </Box>
      <Box sx={{ mt: 1, minHeight: '50px' }}>
        {Array.isArray(localComments) && localComments.length > 0 && localComments.map((comment) => {
          return (
            <Box 
              key={comment._id} 
              sx={{ 
                mb: 1, 
                p: 1, 
                borderRadius: 1, 
                backgroundColor: (comment.classification === "toxic" || comment.is_toxic) ? "#ffcccc" : "#ccffcc", 
                boxShadow: 1,
                transition: "all 0.3s"
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: minimized[comment._id] ? 0 : 1 }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography variant="body2" sx={{ fontWeight: "bold", mr: 1 }}>
                    {comment.commenter?.username || "Anonymous"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(comment.createdAt).toLocaleString()}
                  </Typography>
                </Box>
                <Box>
                  <IconButton 
                    size="small" 
                    onClick={() => setMinimized(prev => ({ ...prev, [comment._id]: !prev[comment._id] }))}
                    title={minimized[comment._id] ? "Expand comment" : "Minimize comment"}
                  >
                    {minimized[comment._id] ? <AiOutlinePlus size={15} /> : <AiOutlineMinus size={15} />}
                  </IconButton>
                  {(user && comment.commenter && comment.commenter._id === user.userId) && (
                    <IconButton 
                      size="small" 
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent event bubbling
                        // Only remove this specific comment from local state
                        setLocalComments(prev => prev.filter(c => c._id !== comment._id));
                        
                        // Only call parent's removeComment for server-side comments (not local ones)
                        if (!comment._id.startsWith('local_')) {
                          parentRemoveComment(comment._id);
                        }
                      }} 
                      title="Delete comment"
                    >
                      <AiFillDelete color="red" />
                    </IconButton>
                  )}
                </Box>
              </Box>
              
              {!minimized[comment._id] && (
                <Box>
                  <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", pl: 1 }}>
                    {comment.content}
                  </Typography>
                  <Box sx={{ 
                    display: "flex", 
                    alignItems: "center", 
                    pl: 1, 
                    mt: 0.5
                  }}>
                    <HorizontalStack spacing={0.5} alignItems="center">
                      {comment.isClassifying ? (
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: "bold" }}>
                          Classifying...
                        </Typography>
                      ) : (comment.classification === "toxic" || comment.is_toxic) ? (
                        <>
                          <Box 
                            sx={{ 
                              width: 16, 
                              height: 16, 
                              borderRadius: '50%', 
                              bgcolor: 'error.main',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Typography variant="caption" sx={{ color: 'white', fontSize: '10px', fontWeight: 'bold' }}>
                              !
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="error.main" sx={{ fontWeight: "bold" }}>
                            Harmful
                          </Typography>
                        </>
                      ) : (
                        <>
                          <Box 
                            sx={{ 
                              width: 16, 
                              height: 16, 
                              borderRadius: '50%', 
                              bgcolor: 'success.main',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Typography variant="caption" sx={{ color: 'white', fontSize: '10px', fontWeight: 'bold' }}>
                              ✓
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="success.main" sx={{ fontWeight: "bold" }}>
                            Harmless
                          </Typography>
                        </>
                      )}
                    </HorizontalStack>
                    {comment.isClassifying && (
                      <CircularProgress size={10} sx={{ ml: 1 }} />
                    )}
                  </Box>
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    </>
  );
};

export default PostCard;