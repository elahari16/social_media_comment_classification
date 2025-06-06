import { BASE_URL } from "../config";

const handleResponse = async (res) => {
  if (res.ok) {
    try {
      return await res.json();
    } catch (err) {
      console.error("Error parsing JSON response:", err);
      return { error: "Invalid response format from the server" };
    }
  } else {
    let errorData;
    try {
      errorData = await res.json();
    } catch {
      errorData = { error: `Server error: ${res.status}` };
    }
    return errorData;
  }
};

const signup = async (user) => {
  try {
    const res = await fetch(BASE_URL + "api/users/register", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });
    return await handleResponse(res);
  } catch (err) {
    console.log(err);
  }
};

const login = async (user) => {
  try {
    const res = await fetch(BASE_URL + "api/users/login", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });
    return await handleResponse(res);
  } catch (err) {
    console.log(err);
  }
};

const getUser = async (params) => {
  try {
    // Add cache busting if provided
    const url = params._nocache 
      ? `${BASE_URL}api/users/${params.username}?_nocache=${params._nocache}`
      : `${BASE_URL}api/users/${params.username}`;
      
    const res = await fetch(url, {
      // Prevent browser caching
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    return await handleResponse(res);
  } catch (err) {
    console.error("Error fetching user:", err);
    return { error: "Failed to fetch user profile" };
  }
};

const getRandomUsers = async (query) => {
  try {
    const res = await fetch(
      BASE_URL + "api/users/random?" + new URLSearchParams(query)
    );
    return await handleResponse(res);
  } catch (err) {
    console.log(err);
  }
};

const updateUser = async (user, data) => {
  try {
    console.log("Updating user profile:", data);
    const res = await fetch(BASE_URL + "api/users/" + user.userId, {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "x-access-token": user.token,
      },
      body: JSON.stringify(data),
    });
    const responseData = await handleResponse(res);
    console.log("Update response:", responseData);
    return responseData;
  } catch (err) {
    console.error("Error updating user:", err);
    return { error: "Failed to update profile" };
  }
};

export { signup, login, getUser, getRandomUsers, updateUser };
