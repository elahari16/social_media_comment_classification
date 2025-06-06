import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getUser, updateUser } from "../../api/users";
import Profile from "../Profile";
import Loading from "../Loading";
import { Box, Typography, Stack, Card, Divider, Button, Link } from "@mui/material";
import { isLoggedIn } from "../../helpers/authHelper";

const ProfileView = () => {
  const { username } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const currentUser = isLoggedIn();

  const fetchProfile = async () => {
    // Don't set loading to true for refreshes if we already have profile data
    // This prevents UI flicker during updates
    if (!profileData) {
      setLoading(true);
    }
    
    setError("");
    try {
      console.log("Fetching profile for:", username);
      
      // Add a cache-busting parameter to prevent browser caching
      const timestamp = new Date().getTime();
      const data = await getUser({ 
        username, 
        _nocache: timestamp 
      });
      
      console.log("Profile data received:", data);
      
      if (data && data.error) {
        setError(data.error);
        console.error("Error fetching profile:", data.error);
      } else if (data) {
        setProfileData(data);
      } else {
        setError("No profile data received");
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [username]);
  
  // Refresh profile after updating
  useEffect(() => {
    if (!updating && profileData) {
      // This will refresh the profile data from the server after an update
      setTimeout(() => {
        fetchProfile();
      }, 500); // Add a small delay to ensure server has processed the update
    }
  }, [updating]);

  if (loading) {
    return <Loading label="Loading profile..." />;
  }

  if (error) {
    return (
      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  const handleEditing = () => {
    setEditing(!editing);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    const content = e.target.content.value.trim();
    
    setUpdating(true);
    setError("");
    try {
      console.log("Updating bio to:", content);
      const data = await updateUser(currentUser, { biography: content });
      
      if (data && data.error) {
        setError(data.error);
        console.error("Error updating bio:", data.error);
      } else {
        console.log("Bio updated successfully");
        // Update the profile data with the new biography immediately for UI feedback
        setProfileData(prevData => ({
          ...prevData,
          user: {
            ...prevData.user,
            biography: content
          }
        }));
        setEditing(false);
        
        // Force a complete refresh after a short delay
        setTimeout(() => {
          fetchProfile();
        }, 500);
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };
  
  const handleImageUpload = async (e) => {
    if (!currentUser || !e.target.files || !e.target.files[0]) return;
    
    const file = e.target.files[0];
    
    // Convert image to base64 for storage
    const reader = new FileReader();
    
    reader.onload = async () => {
      const base64Image = reader.result;
      
      // Save to localStorage immediately for persistence
      localStorage.setItem(`profileImage-${currentUser.userId}`, base64Image);
      
      // Update UI immediately
      setProfileData(prevData => ({
        ...prevData,
        user: {
          ...prevData.user,
          profileImage: base64Image
        }
      }));
      
      setUpdating(true);
      try {
        // Send the base64 image data to the server
        const data = await updateUser(currentUser, { 
          profileImage: base64Image 
        });
        
        if (data && data.error) {
          setError(data.error);
          console.error("Error updating profile image:", data.error);
        } else {
          console.log("Profile image updated successfully");
        }
      } catch (err) {
        console.error("Error uploading image:", err);
        setError("Failed to upload image");
      } finally {
        setUpdating(false);
      }
    };
    
    reader.readAsDataURL(file);
  };

  const validate = (content) => {
    if (content.length > 250) {
      return "Bio cannot be more than 250 characters";
    }
    return null;
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", mt: 4 }}>
      <Profile 
        profile={profileData} 
        editing={editing}
        handleEditing={handleEditing}
        handleSubmit={handleSubmit}
        handleImageUpload={handleImageUpload}
        validate={validate}
      />
      <Divider sx={{ my: 3 }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Posts
        </Typography>
        {currentUser && profileData.user._id === currentUser.userId && (
          <Button 
            variant="contained" 
            color="primary" 
            component={Link} 
            href="/create-post"
          >
            Create New Post
          </Button>
        )}
      </Box>
      {profileData.posts && profileData.posts.data && profileData.posts.data.length > 0 ? (
        <Stack spacing={2}>
          {profileData.posts.data.map((post) => (
            <Card key={post._id} sx={{ p: 2, transition: 'all 0.3s', '&:hover': { boxShadow: 6 } }}>
              <Link href={`/posts/${post._id}`} underline="none" color="inherit">
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                  {post.title}
                </Typography>
                <Typography variant="body2" sx={{ 
                  whiteSpace: "pre-wrap", 
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                }}>
                  {post.content}
                </Typography>
              </Link>
            </Card>
          ))}
        </Stack>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            No posts yet.
          </Typography>
          {currentUser && profileData.user._id === currentUser.userId && (
            <Button 
              variant="outlined" 
              color="primary" 
              component={Link} 
              href="/create-post"
              sx={{ mt: 2 }}
            >
              Create Your First Post
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
};

export default ProfileView;
