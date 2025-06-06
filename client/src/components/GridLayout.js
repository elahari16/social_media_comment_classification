import { Grid, Stack, Paper } from "@mui/material";
import React from "react";

const GridLayout = (props) => {
  const { left, right } = props;

  return (
    <div style={{ display: "flex", alignItems: "flex-start", width: "100%", maxWidth: "1200px", margin: "0 auto", padding: "0 16px", boxSizing: "border-box", gap: "16px" }}>
      <div style={{ flex: "0 0 300px" }}>
        {left}
      </div>
      <div style={{ flex: "1 1 auto", minWidth: 0 }}>
        {right}
      </div>
    </div>
  );
};

export default GridLayout;