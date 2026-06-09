const express = require('express');
const router = express.Router();
const { createLink, getLinks, deleteLink, getAnalytics } = require('../controllers/linkController');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/', createLink);
router.get('/', getLinks);
router.delete('/:id', deleteLink);
router.get('/:id/analytics', getAnalytics);

module.exports = router;
