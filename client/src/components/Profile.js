import { useTheme } from "@emotion/react";
import {
  Avatar,
  Button,
  Card,
  Divider,
  Stack,
  Typography,
  IconButton,
  TextField,
  Input,
} from "@mui/material";
import { Box } from "@mui/system";
import React, { useEffect, useState, useRef } from "react";
import { AiFillEdit, AiFillCamera } from "react-icons/ai";
import { isLoggedIn } from "../helpers/authHelper";
import ContentUpdateEditor from "./ContentUpdateEditor";
import Footer from "./Footer";
import Loading from "./Loading";
import UserAvatar from "./UserAvatar";
import HorizontalStack from "./util/HorizontalStack";

const Profile = (props) => {
  const [user, setUser] = useState(null);
  const currentUser = isLoggedIn();
  const theme = useTheme();
  const iconColor = theme.palette.primary.main;

  useEffect(() => {
    if (props.profile) {
      // Check for saved profile image in localStorage
      const savedImage = localStorage.getItem(`profileImage-${props.profile.user._id}`);
      if (savedImage) {
        setUser({
          ...props.profile.user,
          profileImage: savedImage
        });
      } else {
        setUser(props.profile.user);
      }
    }
  }, [props.profile]);

  return (
    <Card>
      {user ? (
        <Stack alignItems="center" spacing={2}>
          <Box my={1} position="relative">
            <UserAvatar 
              width={150} 
              height={150} 
              username={user.username} 
              src={user.profileImage}
            />
            {currentUser && user._id === currentUser.userId && (
              <IconButton 
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  }
                }}
                component="label"
              >
                <input
                  hidden
                  accept="image/*"
                  type="file"
                  onChange={props.handleImageUpload}
                />
                <AiFillCamera color={iconColor} />
              </IconButton>
            )}
          </Box>

          <Typography variant="h5">{user.username}</Typography>

          {props.editing ? (
            <Box>
              <ContentUpdateEditor
                handleSubmit={props.handleSubmit}
                originalContent={user.biography}
                validate={props.validate}
              />
            </Box>
          ) : user.biography ? (
            <Typography textAlign="center" variant="p">
              <b>Bio: </b>
              {user.biography}
            </Typography>
          ) : (
            <Typography variant="p">
              <i>No bio yet</i>
            </Typography>
          )}

          {currentUser && user._id === currentUser.userId && (
            <Box>
              <Button
                startIcon={<AiFillEdit color={iconColor} />}
                onClick={props.handleEditing}
              >
                {props.editing ? <>Cancel</> : <>Edit bio</>}
              </Button>
            </Box>
          )}

          {currentUser && user._id !== currentUser.userId && (
            <Button variant="outlined" onClick={props.handleMessage}>
              Message
            </Button>
          )}

          <HorizontalStack>
            <Typography color="text.secondary">
              Likes <b>{props.profile.posts.likeCount}</b>
            </Typography>
            <Typography color="text.secondary">
              Posts <b>{props.profile.posts.count}</b>
            </Typography>
          </HorizontalStack>
        </Stack>
      ) : (
        <Loading label="Loading profile" />
      )}
    </Card>
  );
};

export default Profile;
