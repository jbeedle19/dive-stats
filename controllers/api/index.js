const router = require('express').Router();
const diveRoutes = require('./dives');
const diverRoutes = require('./divers');

router.use('/dives', diveRoutes);
router.use('/divers', diverRoutes);

module.exports = router;