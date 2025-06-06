import React, { useEffect, lazy, Suspense } from "react";
import { CssBaseline, Box, CircularProgress } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";
import theme from "./theme";
import { initiateSocketConnection } from "./helpers/socketHelper";

// Lazy load components to improve initial load time
const PostView = lazy(() => import("./components/views/PostView"));
const CreatePostView = lazy(() => import("./components/views/CreatePostView"));
const ProfileView = lazy(() => import("./components/views/ProfileView"));
const LoginView = lazy(() => import("./components/views/LoginView"));
const SignupView = lazy(() => import("./components/views/SignupView"));
const ExploreView = lazy(() => import("./components/views/ExploreView"));
const PrivateRoute = lazy(() => import("./components/PrivateRoute"));
const SearchView = lazy(() => import("./components/views/SearchView"));
const MessengerView = lazy(() => import("./components/views/MessengerView"));

function App() {
  // Initialize socket connection only when needed
  useEffect(() => {
    initiateSocketConnection();
  }, []);

  // Loading fallback component
  const LoadingFallback = () => (
    <Box 
      display="flex" 
      justifyContent="center" 
      alignItems="center" 
      minHeight="100vh"
    >
      <CircularProgress />
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          bgcolor: "background.default",
          minHeight: "100vh",
          color: "text.primary",
          transition: "background-color 0.5s ease",
        }}
      >
        <BrowserRouter>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<ExploreView />} />
              <Route path="/posts/:id" element={<PostView />} />
              <Route
                path="/posts/create"
                element={
                  <PrivateRoute>
                    <CreatePostView />
                  </PrivateRoute>
                }
              />
              <Route
                path="/messenger"
                element={
                  <PrivateRoute>
                    <MessengerView />
                  </PrivateRoute>
                }
              />
              <Route path="/search" element={<SearchView />} />
              <Route path="/users/:username" element={<ProfileView />} />
              <Route path="/login" element={<LoginView />} />
              <Route path="/signup" element={<SignupView />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </Box>
    </ThemeProvider>
  );
}

export default App;
