const { googleSignup } = require('../controllers/authController');

const router = require('express').Router();

router.get('/test', (req, res) => {
    res.send('test pass');
})

router.get('/google', googleSignup)

module.exports = router;