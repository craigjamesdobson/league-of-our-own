const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const Player = require('../models/player.model');
const catchAsync = require('../utils/catchAsync');

const getPlayers = catchAsync(async (req, res) => {
  const players = await Player.find({}).select(
    `-_id
     id 
     code 
     status 
     news team 
     now_cost 
     cost_change_start_fall 
     first_name 
     second_name 
     web_name 
     element_type 
     goals_scored 
     assists 
     clean_sheets`
  );
  res
    .status(httpStatus.OK)
    .send({ message: 'Fetched posts successfully.', players: players });
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
  getPlayers,
  createPost,
  getPost,
};
