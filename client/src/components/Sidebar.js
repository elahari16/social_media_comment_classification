import React from "react";
import { Box, Stack, Typography, Divider } from "@mui/material";
import { isLoggedIn } from "../helpers/authHelper";
import FindUsers from "./FindUsers";
import Footer from "./Footer";
import Loading from "./Loading";
import PostCard from "./PostCard";
import TopPosts from "./TopPosts";

const Sidebar = () => {
  const user = isLoggedIn();

  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        p: 2,
        borderRadius: 2,
        boxShadow: 3,
        maxWidth: 320,
        width: "100%",
        mb: 2,
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold", color: "primary.main" }}>
        Explore
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <FindUsers />
      <Divider sx={{ my: 2 }} />
      <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold", color: "primary.main" }}>
        Top Posts
      </Typography>
      <TopPosts />
      <Divider sx={{ my: 2 }} />
      {user && (
        <>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold", color: "primary.main" }}>
            Your Posts
          </Typography>
          <Loading />
          {/* You can add user posts here */}
        </>
      )}
      <Footer />
    </Box>
  );
};

export default Sidebar;
