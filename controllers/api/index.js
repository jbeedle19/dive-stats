const router = require('express').Router();
const diveRoutes = require('./dives');

router.use('/dives', diveRoutes);

module.exports = router;