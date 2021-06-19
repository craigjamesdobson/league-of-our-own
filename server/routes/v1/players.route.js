const express = require('express');
const router = express.Router();
const playerController = require('../../controllers/players.controller');

router.get('/', playerController.getPlayers);

module.exports = router;