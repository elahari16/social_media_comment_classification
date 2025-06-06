import { Button, IconButton, Typography, useTheme, Tooltip, Avatar, Chip } from "@mui/material";
import { Box, compose } from "@mui/system";
import React, { useState, useEffect } from "react";
import { AiFillEdit, AiOutlineLine, AiOutlinePlus } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import { isLoggedIn } from "../helpers/authHelper";
import CommentEditor from "./CommentEditor";
import ContentDetails from "./ContentDetails";
import HorizontalStack from "./util/HorizontalStack";
import { deleteComment, updateComment } from "../api/posts";
import ContentUpdateEditor from "./ContentUpdateEditor";
import Markdown from "./Markdown";
import { MdCancel, MdMinimize } from "react-icons/md";
import { BiReply, BiTrash } from "react-icons/bi";
import { BsReply, BsReplyFill } from "react-icons/bs";
import Moment from "react-moment";
import UserAvatar from "./UserAvatar";
import { classifyComment } from "./CommentClassifier";

const Comment = (props) => {
  const theme = useTheme();
  const iconColor = theme.palette.primary.main;
  const { depth, addComment, removeComment, editComment } = props;
  const commentData = props.comment;
  
  // Classify the comment immediately
  const classification = classifyComment(commentData.content);
  
  // Add classification to the comment data
  const initialComment = {
    ...commentData,
    is_toxic: classification.is_toxic,
    classification: classification.classification
  };
  
  const [minimised, setMinimised] = useState(depth % 4 === 3);
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);
  const [comment, setComment] = useState(initialComment);
  const user = isLoggedIn();
  const isAuthor = user && user.userId === comment.commenter._id;
  const navigate = useNavigate();
  
  // Load from localStorage if available
  useEffect(() => {
    const savedComment = localStorage.getItem(`comment-${commentData._id}`);
    if (savedComment) {
      try {
        const parsedComment = JSON.parse(savedComment);
        // Ensure classification is always present
        const classification = classifyComment(parsedComment.content);
        setComment({
          ...parsedComment,
          is_toxic: classification.is_toxic,
          classification: classification.classification
        });
      } catch (error) {
        console.error("Error parsing saved comment:", error);
      }
    }
  }, [commentData._id]);
  
  // Save comment to localStorage whenever it changes
  useEffect(() => {
    if (comment && comment._id) {
      localStorage.setItem(`comment-${comment._id}`, JSON.stringify(comment));
    }
  }, [comment]);

  const handleSetReplying = () => {
    if (isLoggedIn()) {
      setReplying(!replying);
    } else {
      navigate("/login");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const content = e.target.content.value;
    
    // Classify the edited content immediately
    const classification = classifyComment(content);

    await updateComment(comment._id, user, { content });

    const newCommentData = { 
      ...comment, 
      content, 
      edited: true,
      is_toxic: classification.is_toxic,
      classification: classification.classification
    };

    setComment(newCommentData);
    
    // Save updated comment to localStorage
    localStorage.setItem(`comment-${comment._id}`, JSON.stringify(newCommentData));

    editComment(newCommentData);

    setEditing(false);
  };

  const handleDelete = async () => {
    await deleteComment(comment._id, user);
    // Remove from localStorage when deleted
    localStorage.removeItem(`comment-${comment._id}`);
    removeComment(comment);
  };

  let style = {
    backgroundColor: theme.palette.grey[100],
    borderRadius: 1.5,
    mb: theme.spacing(2),
    padding: theme.spacing(0),
  };

  if (depth % 2 === 1) {
    style.backgroundColor = "white";
  }



  return (
    <Box sx={{
      ...style,
      border: comment.isTemp ? `1px dashed ${theme.palette.primary.main}` : 'none',
      opacity: comment.isTemp ? 0.9 : 1,
    }}>
      <Box
        sx={{
          pl: theme.spacing(2),
          pt: theme.spacing(1),
          pb: theme.spacing(1),
          pr: 1,
        }}
      >
        {props.profile ? (
          <Box>
            <Typography variant="h6">
              <Link underline="hover" to={"/posts/" + comment.post._id}>
                {comment.post.title}
              </Link>
            </Typography>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              <Moment fromNow>{comment.createdAt}</Moment>{" "}
              {comment.edited && <>(Edited)</>}
            </Typography>
          </Box>
        ) : (
          <HorizontalStack justifyContent="space-between">
            <HorizontalStack>
              <ContentDetails
                username={comment.commenter.username}
                createdAt={comment.createdAt}
                edited={comment.edited}
              />
            </HorizontalStack>
            <HorizontalStack spacing={1}>
              <Tooltip title="Minimize comment">
                <IconButton
                  variant="text"
                  size="small"
                  onClick={() => setMinimised(!minimised)}
                >
                  <MdMinimize color={iconColor} />
                </IconButton>
              </Tooltip>
              
              {!minimised && (
                <IconButton
                  variant="text"
                  size="small"
                  onClick={handleSetReplying}
                >
                  {!replying ? (
                    <BsReplyFill color={iconColor} />
                  ) : (
                    <MdCancel color={iconColor} />
                  )}
                </IconButton>
              )}
              
              {!minimised && user && (isAuthor || user.isAdmin) && (
                <HorizontalStack spacing={1}>
                  <IconButton
                    variant="text"
                    size="small"
                    onClick={() => setEditing(!editing)}
                  >
                    {editing ? (
                      <MdCancel color={iconColor} />
                    ) : (
                      <AiFillEdit color={iconColor} />
                    )}
                  </IconButton>
                  <IconButton
                    variant="text"
                    size="small"
                    onClick={handleDelete}
                  >
                    <BiTrash color={theme.palette.error.main} />
                  </IconButton>
                </HorizontalStack>
              )}
            </HorizontalStack>
          </HorizontalStack>
        )}

        {!minimised && (
          <Box sx={{ mt: 1 }} overflow="hidden">
            <HorizontalStack spacing={2} sx={{ mb: 2 }}>
              <UserAvatar 
                username={comment.commenter.username} 
                height={40} 
                width={40} 
                src={comment.commenter.profilePicture}
                sx={{ borderRadius: '50%' }}
              />
              {!editing ? (
                <Box sx={{ width: '100%' }}>
                  <Typography
                    variant="body1"
                    sx={{
                      whiteSpace: "pre-wrap",
                      color: (comment.is_toxic || comment.classification === "toxic") ? "error.main" : "text.primary",
                    }}
                  >
                    {comment.content}
                  </Typography>
                  
                  <Box sx={{ mt: 1 }}>
                    {(comment.is_toxic || comment.classification === "toxic") ? (
                      <Chip 
                        size="small"
                        label="Harmful content" 
                        color="error" 
                        variant="outlined"
                      />
                    ) : (
                      <Chip 
                        size="small"
                        label="Appropriate content" 
                        color="success" 
                        variant="outlined"
                      />
                    )}
                  </Box>
                </Box>
              ) : (
                <ContentUpdateEditor
                  handleSubmit={handleSubmit}
                  originalContent={comment.content}
                />
              )}
            </HorizontalStack>

            {replying && !minimised && (
              <Box sx={{ mt: 2 }}>
                <CommentEditor
                  comment={comment}
                  addComment={addComment}
                  setReplying={setReplying}
                  label="What are your thoughts on this comment?"
                />
              </Box>
            )}
            {comment.children && (
              <Box sx={{ pt: theme.spacing(2) }}>
                {comment.children.map((reply, i) => (
                  <Comment
                    key={reply._id}
                    comment={reply}
                    depth={depth + 1}
                    addComment={addComment}
                    removeComment={removeComment}
                    editComment={editComment}
                  />
                ))}
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Comment;
