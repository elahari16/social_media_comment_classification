import { Button, Card, Stack, TextField, Typography } from "@mui/material";
import { Box } from "@mui/system";
import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createComment } from "../api/posts";
import { isLoggedIn } from "../helpers/authHelper";
import ErrorAlert from "./ErrorAlert";
import HorizontalStack from "./util/HorizontalStack";

const CommentEditor = ({ label, comment, addComment, setReplying, handleSubmit: parentHandleSubmit, loading: parentLoading, buttonText }) => {
  const [formData, setFormData] = useState({
    content: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const params = useParams();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // If parent component provided a handleSubmit function, use that instead
    if (parentHandleSubmit) {
      parentHandleSubmit(e);
      return;
    }
    
    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }

    if (formData.content.trim() === "") {
      setError("Comment cannot be empty");
      return;
    }

    const body = {
      ...formData,
      parentId: comment && comment._id,
    };

    // Create a temporary comment object for immediate display
    const tempComment = {
      ...body,
      _id: "temp_" + Date.now(),
      commenter: {
        _id: isLoggedIn().userId,
        username: isLoggedIn().username
      },
      createdAt: new Date().toISOString(),
      isTemp: true
    };
    
    // Add the temporary comment immediately
    if (addComment) {
      addComment(tempComment);
    }
    
    // Clear the form immediately for better UX
    setFormData({ content: "" });
    setReplying && setReplying(false);

    setLoading(true);
    setError("");
    try {
      const data = await createComment(body, params, isLoggedIn());
      
      if (data.error) {
        setError(data.error);
        // Remove the temporary comment if there was an error
        if (addComment && tempComment) {
          addComment({ ...tempComment, _id: tempComment._id, remove: true });
        }
      } else if (addComment) {
        // Replace the temporary comment with the real one
        addComment({ ...data, replaceId: tempComment._id });
      }
    } catch (err) {
      setError("Failed to post comment");
      // Remove the temporary comment if there was an error
      if (addComment && tempComment) {
        addComment({ ...tempComment, _id: tempComment._id, remove: true });
      }
    }
    setLoading(false);
  };

  const handleFocus = (e) => {
    !isLoggedIn() && navigate("/login");
  };

  return (
    <Card>
      <Stack spacing={2}>
        <HorizontalStack justifyContent="space-between">
          <Typography variant="h5">
            {comment ? <>Reply</> : <>Comment</>}
          </Typography>
          {/* Removed Markdown Help link as per user request */}
        </HorizontalStack>

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            multiline
            fullWidth
            label={label}
            rows={5}
            required
            name="content"
            sx={{
              backgroundColor: "white",
            }}
            onChange={handleChange}
            onFocus={handleFocus}
            value={formData.content}
          />

          <ErrorAlert error={error} sx={{ my: 4 }} />
          <Button
            variant="outlined"
            type="submit"
            fullWidth
            disabled={loading || parentLoading}
            sx={{
              backgroundColor: "white",
              mt: 2,
            }}
          >
            {loading || parentLoading ? <div>Submitting</div> : <div>{buttonText || "Submit"}</div>}
          </Button>
        </Box>
      </Stack>
    </Card>
  );
};

export default CommentEditor;
