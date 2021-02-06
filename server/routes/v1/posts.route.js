const express = require('express');
const router = express.Router();
const postController = require('../../controllers/posts.controller');

router.get('/', postController.getPosts);
router.post('/post', postController.createPost);
router.get('/post/:postId', postController.getPost);

module.exports = router;
