import { Box } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";

const PostContentBox = (props) => {
  const { clickable, post, editing, children, sx } = props;
  const navigate = useNavigate();

  const handleClick = () => {
    if (clickable && !editing) {
      navigate("/posts/" + post._id);
    }
  };

  return (
    <Box
      sx={{
        padding: 2,
        width: "100%",
        cursor: clickable && !editing ? "pointer" : "auto",
        ...sx
      }}
      onClick={handleClick}
    >
      {children}
    </Box>
  );
};

export default PostContentBox;