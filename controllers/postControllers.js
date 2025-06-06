const mongoose = require("mongoose");
const Post = require("../models/Post");
const User = require("../models/User");
const Comment = require("../models/Comment");
const PostLike = require("../models/PostLike");
const paginate = require("../util/paginate");
const cooldown = new Set();

const USER_LIKES_PAGE_SIZE = 9;

const createPost = async (req, res) => {
  try {
    const { title, content } = req.body;
    const { userId } = req.user;

    if (!(title && content)) {
      throw new Error("All input required");
    }

    if (cooldown.has(userId)) {
      throw new Error(
        "You are posting too frequently. Please try again shortly."
      );
    }

    cooldown.add(userId);
    setTimeout(() => cooldown.delete(userId), 60000);

    const post = await Post.create({ title, content, poster: userId });

    res.json(post);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

const getPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user ? req.user.userId : null;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      throw new Error("Post does not exist");
    }

    const post = await Post.findById(postId)
      .populate("poster", "-password")
      .lean();

    if (!post) {
      throw new Error("Post does not exist");
    }

    if (userId) {
      await setLiked([post], userId);
    }

    await enrichWithUserLikePreview([post]);

    return res.json(post);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

const updatePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const { content } = req.body;
    const { userId, isAdmin } = req.user;

    const post = await Post.findById(postId);

    if (!post) {
      throw new Error("Post does not exist");
    }

    if (post.poster != userId && !isAdmin) {
      throw new Error("Not authorized to update post");
    }

    post.content = content;
    post.edited = true;

    await post.save();

    return res.json(post);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const { userId, isAdmin } = req.user;

    const post = await Post.findById(postId);

    if (!post) {
      throw new Error("Post does not exist");
    }

    if (post.poster != userId && !isAdmin) {
      throw new Error("Not authorized to delete post");
    }

    await Post.deleteOne({ _id: postId });
    await Comment.deleteMany({ post: post._id });

    return res.json(post);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

const likePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const { userId } = req.user;

    const post = await Post.findById(postId);
    if (!post) throw new Error("Post does not exist");

    const existingPostLike = await PostLike.findOne({ postId, userId });
    if (existingPostLike) throw new Error("Post is already liked");

    await PostLike.create({ postId, userId });

    post.likeCount = await PostLike.countDocuments({ postId });
    await post.save();

    return res.json({ success: true });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

const unlikePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const { userId } = req.user;

    const post = await Post.findById(postId);
    if (!post) throw new Error("Post does not exist");

    const existingPostLike = await PostLike.findOne({ postId, userId });
    if (!existingPostLike) throw new Error("Post is already not liked");

    await PostLike.deleteOne({ _id: existingPostLike._id });

    post.likeCount = await PostLike.countDocuments({ postId });
    await post.save();

    return res.json({ success: true });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

const getUserLikedPosts = async (req, res) => {
  try {
    const likerId = req.params.id;
    const { userId } = req.body;
    let { page = 1, sortBy = "-createdAt" } = req.query;

    let posts = await PostLike.find({ userId: likerId })
      .sort(sortBy)
      .populate({ path: "postId", populate: { path: "poster" } })
      .lean();

    posts = paginate(posts, 10, page);
    const count = posts.length;

    let responsePosts = posts.map((post) => post.postId);

    if (userId) await setLiked(responsePosts, userId);

    await enrichWithUserLikePreview(responsePosts);

    return res.json({ data: responsePosts, count });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: err.message });
  }
};

const getPosts = async (req, res) => {
  try {
    const { userId } = req.body;
    let { page = 1, sortBy = "-createdAt", author, search } = req.query;

    let posts = await Post.find()
      .populate("poster", "-password")
      .sort(sortBy)
      .lean();

    if (author) {
      posts = posts.filter((post) => post.poster.username === author);
    }

    if (search) {
      posts = posts.filter((post) =>
        post.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    const count = posts.length;
    posts = paginate(posts, 10, page);

    if (userId) await setLiked(posts, userId);

    await enrichWithUserLikePreview(posts);

    return res.json({ data: posts, count });
  } catch (err) {
    console.log(err.message);
    return res.status(400).json({ error: err.message });
  }
};

const getUserLikes = async (req, res) => {
  try {
    const { postId } = req.params;
    const { anchor } = req.query;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ error: "Invalid post ID format" });
    }

    const postLikesQuery = PostLike.find({ postId })
      .sort("_id")
      .limit(USER_LIKES_PAGE_SIZE + 1)
      .populate("userId", "username");

    if (anchor) {
      postLikesQuery.where("_id").gt(anchor);
    }

    const postLikes = await postLikesQuery.exec();
    const hasMorePages = postLikes.length > USER_LIKES_PAGE_SIZE;

    if (hasMorePages) postLikes.pop();

    const userLikes = postLikes.map((like) => ({
      id: like._id,
      username: like.userId ? like.userId.username : "Unknown User",
    }));

    return res
      .status(200)
      .json({ userLikes, hasMorePages, success: true });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

const setLiked = async (posts, userId) => {
  try {
    if (!userId || !posts || posts.length === 0) return;

    const userPostLikes = await PostLike.find({ userId });

    posts.forEach((post) => {
      if (post && post._id) {
        post.liked = userPostLikes.some((like) => 
          like.postId && like.postId.equals && like.postId.equals(post._id)
        );
      }
    });
  } catch (err) {
    console.error("Error setting liked status:", err);
  }
};

const enrichWithUserLikePreview = async (posts) => {
  try {
    const postMap = posts.reduce((acc, post) => {
      acc[post._id] = post;
      return acc;
    }, {});

    if (Object.keys(postMap).length === 0) return;

    const postLikes = await PostLike.find({
      postId: { $in: Object.keys(postMap) },
    })
      .limit(200)
      .populate("userId", "username");

    postLikes.forEach((like) => {
      const post = postMap[like.postId];
      if (post) {
        if (!post.userLikePreview) post.userLikePreview = [];
        post.userLikePreview.push(like.userId);
      }
    });
  } catch (err) {
    console.error("Error enriching with user like preview:", err);
  }
};

module.exports = {
  getPost,
  getPosts,
  createPost,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  getUserLikedPosts,
  getUserLikes,
};
