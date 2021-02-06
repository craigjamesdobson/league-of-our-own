const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const Post = require('../models/post');
const catchAsync = require('../utils/catchAsync');

const getPosts = catchAsync(async (req, res) => {
  const posts = await Post.find();
  res
    .status(httpStatus.OK)
    .send({ message: 'Fetched posts successfully.', posts: posts });
});

const createPost = catchAsync(async (req, res) => {
  const title = req.body.title;
  const content = req.body.content;
  const post = new Post({
    title: title,
    content: content,
    creator: {
      name: 'Craig',
    },
  });
  const newPost = await post.save();
  res
    .status(httpStatus.CREATED)
    .send({ Message: 'Post created successfully!', post: newPost });
});

const getPost = async (req, res, next) => {
  try {
    const postID = req.params.postId;
    const post = await Post.findById(postID);
    if (!post) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
    }
    res.status(httpStatus.OK).send({ message: 'Post fetched.', post: post });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPosts,
  createPost,
  getPost,
};
