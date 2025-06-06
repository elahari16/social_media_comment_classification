import { BASE_URL } from "../config";

const handleResponse = async (res) => {
  if (res.ok) {
    return res.json();
  } else {
    let errorData;
    try {
      errorData = await res.json();
    } catch {
      errorData = { error: "Unknown error occurred" };
    }
    return errorData;
  }
};

const getConversations = async (user) => {
  try {
    const res = await fetch(BASE_URL + "api/messages", {
      headers: {
        "x-access-token": user.token,
      },
    });
    return await handleResponse(res);
  } catch (err) {
    console.log(err);
  }
};

const getMessages = async (user, conversationId) => {
  try {
    const res = await fetch(BASE_URL + "api/messages/" + conversationId, {
      headers: {
        "x-access-token": user.token,
      },
    });
    return await handleResponse(res);
  } catch (err) {
    console.log(err);
  }
};

const sendMessage = async (user, message, recipientId) => {
  try {
    const res = await fetch(BASE_URL + "api/messages/" + recipientId, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "x-access-token": user.token,
      },
      body: JSON.stringify(message),
    });
    return await handleResponse(res);
  } catch (err) {
    console.log(err);
  }
};

export { getConversations, getMessages, sendMessage };
