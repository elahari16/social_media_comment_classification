const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://post-it-heroku.herokuapp.com/"
    : "http://localhost:5001/";

export { BASE_URL };
