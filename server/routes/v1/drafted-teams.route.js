const express = require('express');
const router = express.Router();
const draftedTeamsController = require('../../controllers/drafted-teams.controller');

router.get('/', draftedTeamsController.getDraftedTeams);
router.post('/update', draftedTeamsController.updateDraftedTeams);

module.exports = router;
