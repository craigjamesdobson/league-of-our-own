const express = require('express');
const playersRoute = require('./players.route');
const draftedTeamsRoute = require('./drafted-teams.route');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/players',
    route: playersRoute,
  },
  {
    path: '/drafted-teams',
    route: draftedTeamsRoute,
  },
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
