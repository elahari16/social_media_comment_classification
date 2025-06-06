import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  TextField,
  Stack,
  Paper,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { isLoggedIn, logoutUser } from "../helpers/authHelper";
import UserAvatar from "./UserAvatar";
import HorizontalStack from "./util/HorizontalStack";
import {
  AiFillFileText,
  AiFillHome,
  AiFillMessage,
  AiOutlineSearch,
  AiFillHeart,
} from "react-icons/ai";

const Navbar = () => {
  const navigate = useNavigate();
  const user = isLoggedIn();
  const username = user && user.username;
  const [search, setSearch] = useState("");
  const [searchIcon, setSearchIcon] = useState(false);
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const mobile = width < 500;
  const navbarWidth = width < 600;

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  const handleChange = (e) => {
    setSearch(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/search?" + new URLSearchParams({ search }));
  };

  const toggleSearchIcon = () => {
    setSearchIcon(!searchIcon);
  };

  return (
    <Paper elevation={3} sx={{ mb: 2 }}>
      <Stack>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ pt: 2, pb: 2, px: 2 }}
          spacing={!mobile ? 2 : 0}
        >
          <HorizontalStack>
            <AiFillFileText
              size={33}
              color="#00adb5"
              onClick={() => navigate("/")}
              style={{ cursor: "pointer" }}
            />
            <Typography
              sx={{
                display: mobile ? "none" : "flex",
                alignItems: "center",
                color: "#00adb5",
                fontWeight: "bold",
              }}
              variant={navbarWidth ? "h6" : "h4"}
              mr={1}
            >
              BOOMOO
              <AiFillHeart style={{ marginLeft: 6, color: "red" }} />
            </Typography>
          </HorizontalStack>

          {!navbarWidth && (
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                size="small"
                label="Search for posts..."
                sx={{ flexGrow: 1, maxWidth: 300 }}
                onChange={handleChange}
                value={search}
              />
            </Box>
          )}

          <HorizontalStack>
            {mobile && (
              <IconButton onClick={toggleSearchIcon}>
                <AiOutlineSearch />
              </IconButton>
            )}

            <IconButton component={Link} to="/">
              <AiFillHome />
            </IconButton>

            {user ? (
              <>
                <IconButton component={Link} to="/messenger">
                  <AiFillMessage />
                </IconButton>
                <IconButton component={Link} to={`/users/${username}`}>
                  <UserAvatar width={30} height={30} username={username} />
                </IconButton>
                <Button onClick={handleLogout}>Logout</Button>
              </>
            ) : (
              <>
                <Button variant="text" sx={{ minWidth: 80 }} href="/signup">
                  Sign Up
                </Button>
                <Button variant="text" sx={{ minWidth: 65 }} href="/login">
                  Login
                </Button>
              </>
            )}
          </HorizontalStack>
        </Stack>

        {navbarWidth && searchIcon && (
          <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
            <TextField
              size="small"
              label="Search for posts..."
              fullWidth
              onChange={handleChange}
              value={search}
            />
          </Box>
        )}
      </Stack>
    </Paper>
  );
};

export default Navbar;