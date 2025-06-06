import { Button, Card, Stack, Typography } from "@mui/material";
import { Box } from "@mui/system";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getPosts, getUserLikedPosts } from "../api/posts";
import { isLoggedIn } from "../helpers/authHelper";
import CreatePost from "./CreatePost";
import Loading from "./Loading";
import PostCard from "./PostCard";
import SortBySelect from "./SortBySelect";
import HorizontalStack from "./util/HorizontalStack";
import ErrorAlert from "./ErrorAlert";

const PostBrowser = (props) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [end, setEnd] = useState(false);
  const [sortBy, setSortBy] = useState("-createdAt");
  const [count, setCount] = useState(0);
  const [effect, setEffect] = useState(false);
  const [search] = useSearchParams();

  const user = isLoggedIn();
  const searchExists =
    search && search.get("search") && search.get("search").length > 0;

  const contentTypeSorts = {
    posts: {
      "-createdAt": "Latest",
      "-likeCount": "Likes",
      "-commentCount": "Comments",
      createdAt: "Earliest",
    },
    liked: {
      "-createdAt": "Latest",
      createdAt: "Earliest",
    },
  };
  const sorts = contentTypeSorts[props.contentType];

  const fetchPosts = async () => {
    setLoading(true);
    setError("");

    const newPage = page + 1;
    setPage(newPage);

    let query = {
      page: newPage,
      sortBy,
    };

    if (props.profileUser) query.author = props.profileUser.username;
    if (searchExists) query.search = search.get("search");

    try {
      let data;
      if (props.contentType === "posts") {
        data = await getPosts(user?.token, query);
      } else if (props.contentType === "liked") {
        data = await getUserLikedPosts(props.profileUser._id, user?.token, query);
      }

      console.log("Fetched Posts:", data); // 🔍 For debugging

      if (!data) {
        setError("Invalid response format from the server.");
        return;
      }
      if (data.error) {
        setError(data.error);
        return;
      }
      if (!Array.isArray(data.data)) {
        setError("Invalid response format from the server.");
        return;
      }

      if (data.data.length < 10) setEnd(true);

      setPosts((prev) => [...prev, ...data.data]);
      setCount(data.count || 0);
    } catch (err) {
      console.error(err);
      setError("Failed to load posts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, effect]);

  useEffect(() => {
    setPosts([]);
    setPage(0);
    setEnd(false);
    setEffect((prev) => !prev);
  }, [search]);

  const handleSortBy = (e) => {
    const newSortName = e.target.value;
    let newSortBy = Object.keys(sorts).find((key) => sorts[key] === newSortName);

    setPosts([]);
    setPage(0);
    setEnd(false);
    setSortBy(newSortBy || "-createdAt");
  };

  const removePost = (removedPost) => {
    setPosts((prev) => prev.filter((post) => post._id !== removedPost._id));
  };

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Stack spacing={2}>
      <Card>
        <HorizontalStack justifyContent="space-between">
          {props.createPost && <CreatePost />}
          <SortBySelect onSortBy={handleSortBy} sortBy={sortBy} sorts={sorts} />
        </HorizontalStack>
      </Card>

      {searchExists && (
        <Box>
          <Typography variant="h5" gutterBottom>
            Showing results for "{search.get("search")}"
          </Typography>
          <Typography color="text.secondary" variant="body2">
            {count} results found
          </Typography>
        </Box>
      )}

      {error && <ErrorAlert error={error} />}
      {posts.map((post) => (
        <PostCard key={post._id} post={post} preview="primary" removePost={removePost} />
      ))}

      {loading && <Loading />}

      {end ? (
        <Stack py={5} alignItems="center">
          <Typography variant="h5" color="text.secondary">
            {posts.length > 0 ? "All posts have been viewed" : "No posts available"}
          </Typography>
          <Button variant="text" size="small" onClick={handleBackToTop}>
            Back to top
          </Button>
        </Stack>
      ) : (
        !loading &&
        posts.length > 0 && (
          <Stack pt={2} pb={6} alignItems="center" spacing={2}>
            <Button onClick={fetchPosts} variant="contained">
              Load more
            </Button>
            <Button variant="text" size="small" onClick={handleBackToTop}>
              Back to top
            </Button>
          </Stack>
        )
      )}
    </Stack>
  );
};

export default PostBrowser;
