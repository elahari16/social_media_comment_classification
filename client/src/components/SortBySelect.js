import { FormControl, MenuItem, Select, Typography } from "@mui/material";
import React, { useState } from "react";
import { BiNoEntry } from "react-icons/bi";
import HorizontalStack from "./util/HorizontalStack";

const SortBySelect = ({ onSortBy, sortBy, sorts }) => {
  const defaultSorts = sorts || {
    "-createdAt": "Newest First",
    "createdAt": "Oldest First",
    "classification": "By Classification",
  };
  
  return (
    <HorizontalStack spacing={1}>
      <Typography
        color="text.secondary"
        variant="subtitle2"
        sx={{
          display: {
            xs: "none",
            sm: "block",
          },
        }}
      >
        Sort by:
      </Typography>
      <Select
        size="small"
        value={sortBy}
        sx={{ minWidth: 150 }}
        onChange={onSortBy}
      >
        {Object.keys(defaultSorts).map((sortName, i) => (
          <MenuItem value={sortName} key={i}>
            {defaultSorts[sortName]}
          </MenuItem>
        ))}
      </Select>
    </HorizontalStack>
  );
};

export default SortBySelect;
