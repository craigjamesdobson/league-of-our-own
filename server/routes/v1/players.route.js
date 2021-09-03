const express = require('express');
const router = express.Router();
const playerController = require('../../controllers/players.controller');

router.get('/', playerController.getPlayers);

router.post('/update', playerController.updatePlayers);

module.exports = router;
