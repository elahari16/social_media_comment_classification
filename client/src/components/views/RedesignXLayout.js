import React from "react";
import {
  Box,
  Container,
  Stack,
  Typography,
  Avatar,
  IconButton,
  InputBase,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Button,
} from "@mui/material";
import {
  ChatBubbleOutline,
  FavoriteBorder,
  Repeat,
  MoreHoriz,
  Search,
  Home,
  Explore,
  Notifications,
  Person,
} from "@mui/icons-material";

const posts = [
  {
    id: 1,
    user: {
      name: "hariharan",
      avatar: "/avatars/hariharan.png",
      handle: "@hariharan",
    },
    content: "Excited to announce my new project launch! #opensource",
    timestamp: "3h",
    likes: 12,
    comments: 4,
    reposts: 2,
  },
  {
    id: 2,
    user: {
      name: "vetriselvan",
      avatar: "/avatars/vetriselvan.png",
      handle: "@vetriselvan",
    },
    content: "Just finished a great book on React performance optimization.",
    timestamp: "5h",
    likes: 8,
    comments: 1,
    reposts: 0,
  },
];

const Sidebar = () => (
  <Box sx={{ width: 250, p: 2, borderRight: "1px solid #ddd", height: "100vh", position: "sticky", top: 0 }}>
    <List>
      <ListItem button>
        <Home />
        <ListItemText primary="Home" sx={{ ml: 2 }} />
      </ListItem>
      <ListItem button>
        <Explore />
        <ListItemText primary="Explore" sx={{ ml: 2 }} />
      </ListItem>
      <ListItem button>
        <Notifications />
        <ListItemText primary="Notifications" sx={{ ml: 2 }} />
      </ListItem>
      <ListItem button>
        <Person />
        <ListItemText primary="Profile" sx={{ ml: 2 }} />
      </ListItem>
    </List>
  </Box>
);

const RightSidebar = () => (
  <Box sx={{ width: 300, p: 2, borderLeft: "1px solid #ddd", height: "100vh", position: "sticky", top: 0 }}>
    <Paper sx={{ p: 1, mb: 2, display: "flex", alignItems: "center" }}>
      <Search />
      <InputBase placeholder="Search X" sx={{ ml: 1, flex: 1 }} />
    </Paper>
    <Typography variant="h6" gutterBottom>
      Trends for you
    </Typography>
    <List>
      <ListItem>
        <ListItemText primary="#OpenSource" secondary="Trending" />
      </ListItem>
      <ListItem>
        <ListItemText primary="#ReactJS" secondary="Trending" />
      </ListItem>
    </List>
    <Divider sx={{ my: 2 }} />
    <Typography variant="h6" gutterBottom>
      Who to follow
    </Typography>
    <List>
      <ListItem>
        <ListItemAvatar>
          <Avatar src="/avatars/madhumitha.png" />
        </ListItemAvatar>
        <ListItemText primary="Madhumitha" secondary="@madhumitha" />
        <Button variant="outlined" size="small">
          Follow
        </Button>
      </ListItem>
      <ListItem>
        <ListItemAvatar>
          <Avatar src="/avatars/hariharan.png" />
        </ListItemAvatar>
        <ListItemText primary="hariharan" secondary="@hariharan" />
        <Button variant="outlined" size="small">
          Follow
        </Button>
      </ListItem>
    </List>
  </Box>
);

const Post = ({ post }) => (
  <Paper sx={{ p: 2, mb: 2, borderRadius: 3, width: "100%" }}>
    <Stack direction="row" spacing={2}>
      <Avatar src={post.user.avatar} />
      <Box sx={{ flex: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="subtitle1" fontWeight="bold">
            {post.user.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {post.user.handle} · {post.timestamp}
          </Typography>
          <IconButton size="small" sx={{ ml: "auto" }}>
            <MoreHoriz />
          </IconButton>
        </Stack>
        <Typography variant="body1" sx={{ mt: 1, mb: 1 }}>
          {post.content}
        </Typography>
        <Stack direction="row" spacing={4}>
          <IconButton size="small">
            <ChatBubbleOutline fontSize="small" />
            <Typography variant="caption" sx={{ ml: 0.5 }}>
              {post.comments}
            </Typography>
          </IconButton>
          <IconButton size="small">
            <Repeat fontSize="small" />
            <Typography variant="caption" sx={{ ml: 0.5 }}>
              {post.reposts}
            </Typography>
          </IconButton>
          <IconButton size="small">
            <FavoriteBorder fontSize="small" />
            <Typography variant="caption" sx={{ ml: 0.5 }}>
              {post.likes}
            </Typography>
          </IconButton>
        </Stack>
      </Box>
    </Stack>
  </Paper>
);

const RedesignXLayout = () => {
  return (
    <Container maxWidth="lg" sx={{ display: "flex", gap: 2, pt: 2 }}>
      <Sidebar />
      <Box sx={{ flex: 1, maxWidth: "calc(100% - 550px)" }}>
        {posts.map((post) => (
          <Post key={post.id} post={post} />
        ))}
      </Box>
      <RightSidebar />
    </Container>
  );
};

export default RedesignXLayout;
