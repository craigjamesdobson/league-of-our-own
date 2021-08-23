const express = require('express');
const router = express.Router();
const fixturesController = require('../../controllers/fixtures.controller');

router.get('/', fixturesController.getFixtures);

router.post('/update', fixturesController.updateFixtures);

module.exports = router;
