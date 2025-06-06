import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  Container,
  Stack,
  Typography,
  Fade,
  Paper,
} from "@mui/material";
import { getPosts } from "../../api/posts";
import { isLoggedIn } from "../../helpers/authHelper";
import CreatePost from "../CreatePost";
import GridLayout from "../GridLayout";
import Loading from "../Loading";
import Navbar from "../Navbar";
import SortBySelect from "../SortBySelect";
import PostCard from "../PostCard";
import Sidebar from "../Sidebar";

const ExploreView = () => {
  const [posts, setPosts] = useState([]);
  const [sortBy, setSortBy] = useState("createdAt");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const sorts = {
    createdAt: "Date Created",
    likes: "Likes",
    comments: "Comments",
  };

  const onSortBy = (event) => {
    setSortBy(event.target.value);
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const user = isLoggedIn();
      const token = user ? user.token : undefined;
      const data = await getPosts(token, { sortBy });
      if (data && data.data) {
        setPosts(data.data);
        setError(null);
      } else if (data && data.error) {
        console.error("Error fetching posts:", data.error);
        setError(data.error);
      } else {
        setError("Failed to fetch posts");
      }
    } catch (err) {
      console.error("Exception fetching posts:", err);
      setError("Failed to fetch posts");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, [sortBy]);

  return (
    <Container maxWidth="lg" disableGutters>
      <Navbar />
      <Paper elevation={0} sx={{ p: 2, backgroundColor: "transparent" }}>
        <GridLayout
          left={<Sidebar />}
          right={
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "100%", marginLeft: "0" }}>
              <CreatePost />
              <SortBySelect sortBy={sortBy} onSortBy={onSortBy} sorts={sorts} />
              {error && <Typography color="error">{error}</Typography>}
              {!loading && !error && (
                <>
                  {posts.length === 0 && (
                    <Typography>No posts found.</Typography>
                  )}
                  {posts.map((post) => (
                    <Fade in={true} key={post._id}>
                      <div>
                        <PostCard post={post} />
                      </div>
                    </Fade>
                  ))}
                </>
              )}
            </div>
          }
        />
      </Paper>
    </Container>
  );
};

export default ExploreView;
