import React from "react";
import { Box, Typography, Stack } from "@mui/material";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "background.paper",
        py: 3,
        px: 2,
        mt: "auto",
        textAlign: "center",
        borderTop: "1px solid",
        borderColor: "divider",
      }}
    >
      <Stack spacing={1} alignItems="center">
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} BOOMOO. All rights reserved.
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Where innovation meets simplicity — made with love.
        </Typography>
      </Stack>
    </Box>
  );
};

export default Footer;
