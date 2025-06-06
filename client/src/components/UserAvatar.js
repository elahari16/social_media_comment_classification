import { Avatar } from "@mui/material";
import React from "react";

const UserAvatar = ({ username, height, width, src, sx = {} }) => {
  return (
    <Avatar
      sx={{
        height: height,
        width: width,
        backgroundColor: "lightgray",
        borderRadius: '50%',
        ...sx
      }}
      src={src || ("https://robohash.org/" + username)}
    />
  );
};

export default UserAvatar;
