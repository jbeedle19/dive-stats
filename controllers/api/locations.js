const router = require('express').Router();
const { Location } = require('../../models');

router.get('/', async (req, res) => {
    const { rows } = await Location.getAll();
    res.json(rows);
});

router.get('/:id', async (req, res) => {
    const { rows } = await Location.getOne({
        id: req.params.id
    });
    res.json(rows[0] || {});
});

router.get('/:id/stats', async (req, res) => {
    let rows;

    switch(req.query.data) {
        case 'duration':
            ({ rows } = await Location.getAverageTime({
                id: req.params.id
            }));
            break;
        case 'depth':
            ({ rows } = await Location.getMaxDepth({
                id: req.params.id
            }));
            break;
        case 'certification':
            ({ rows } = await Location.getCertification({
                id: req.params.id
            }));
            break;
        default:
            res.status(404).end();
            return;
    }

    res.json(rows[0]);
});

router.post('/', async (req, res) => {
    try {
        const { rows } = await Location.create(req.body);
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;