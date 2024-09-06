const { googleSignup, googleLogin } = require('../controllers/authController');

const router = require('express').Router();

router.get('/test', (req, res) => {
    res.send('test pass');
})

router.get('/google/signup', googleSignup);
router.get('/google/login', googleLogin);

module.exports = router;