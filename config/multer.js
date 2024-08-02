const multer = require('multer');

// Set up storage for uploaded files
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'uploads/');
    },
    filename: (req, file, callback) =>{
        callback(null, Date.now() + '-' + file.originalname);
    }
});

// create the multer instance 
const upload = multer({ storage }).single('image');

module.exports = upload; 