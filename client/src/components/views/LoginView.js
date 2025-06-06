import {
  Alert,
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
  Fade,
  Box,
} from "@mui/material";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../../api/users";
import ErrorAlert from "../ErrorAlert";
import { loginUser } from "../../helpers/authHelper";

const LoginView = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [serverError, setServerError] = useState("");
  const [showForm, setShowForm] = useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowForm(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = await login(formData);
    if (data.error) {
      setServerError(data.error);
    } else {
      loginUser(data);
      navigate("/");
    }
  };

  return (
    <Container maxWidth={"xs"} sx={{ mt: 6 }}>
      <Stack alignItems="center">
        <Typography variant="h2" color="text.secondary" sx={{ mb: 6 }}>
          <Link to="/" color="inherit" underline="none">
            BOOMOO ❤️
          </Link>
        </Typography>
        <Typography variant="h5" gutterBottom>
          Login
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Don't have an account yet? <Link to="/signup">Sign Up</Link>
        </Typography>
        <Fade in={showForm} timeout={600}>
          <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
            <TextField
              label="Email Address"
              fullWidth
              margin="normal"
              autoComplete="email"
              autoFocus
              required
              id="email"
              name="email"
              onChange={handleChange}
            />
            <TextField
              label="Password"
              fullWidth
              required
              margin="normal"
              id="password"
              name="password"
              onChange={handleChange}
              type="password"
            />

            <ErrorAlert error={serverError} />
            <Button type="submit" fullWidth variant="contained" sx={{ my: 2 }}>
              Login
            </Button>
          </Box>
        </Fade>
      </Stack>
    </Container>
  );
};

export default LoginView;
