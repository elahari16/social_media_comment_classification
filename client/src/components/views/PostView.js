import { Container, Stack, Box } from "@mui/material";
import React, { useEffect, useState, useRef } from "react";
import GoBack from "../GoBack";
import Loading from "../Loading";
import Navbar from "../Navbar";
import PostCard from "../PostCard";
import { useParams } from "react-router-dom";
import { getPost } from "../../api/posts";
import Comments from "../Comments";
import ErrorAlert from "../ErrorAlert";
import { isLoggedIn } from "../../helpers/authHelper";

const PostView = () => {
  const params = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [commentRefresh, setCommentRefresh] = useState(0);
  const user = isLoggedIn();

  const fetchPost = async () => {
    setLoading(true);
    try {
      const data = await getPost(params.id, user && user.token);
      if (data.error) {
        setError(data.error);
      } else {
        setPost(data);
      }
    } catch (err) {
      setError("Failed to load post");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPost();
  }, [params.id]);

  return (
    <Container maxWidth="lg">
      <Navbar />
      <GoBack />
      <Box 
        sx={{ 
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
          maxWidth: '900px',
          margin: '0 auto'
        }}
      >
        {loading ? (
          <Loading />
        ) : post ? (
          <Stack spacing={2} sx={{ width: '100%' }}>
            <PostCard post={post} key={post._id} />
            <Comments 
              postId={post._id} 
              key={`comments-${post._id}-${commentRefresh}`}
              onCommentPosted={() => setCommentRefresh(prev => prev + 1)}
            />
          </Stack>
        ) : (
          error && <ErrorAlert error={error} />
        )}
      </Box>
    </Container>
  );
};

export default PostView;