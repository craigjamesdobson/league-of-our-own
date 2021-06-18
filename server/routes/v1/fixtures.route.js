const express = require('express');
const router = express.Router();
const fixturesController = require('../../controllers/fixtures.controller');

router.get('/', fixturesController.getFixtures);

module.exports = router;
