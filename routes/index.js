const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('index', {
        logo_title: 'When2Meet2'
    });
});

module.exports = router;