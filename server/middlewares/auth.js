const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const config = require('../config/config');
const logger = require('../config/logger');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await User.findOne({
      _id: decoded._id,
      'tokens.token': token,
    });

    if (!user) {
      throw new Error();
    }

    next();
  } catch (e) {
    res.status(401).send({ error: 'Please authenticate.' });
    logger.error(e);
  }
};

module.exports = auth;
