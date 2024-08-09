const multer = require('multer');
const path = require('path');

// Set up storage for uploaded files
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        // Set destination based on file type
        let uploadPath = 'uploads/'; // Default upload path

        if (file.mimetype.startsWith('image/')) {
            uploadPath += 'images/';
        } else if (file.mimetype.startsWith('video/')) {
            uploadPath += 'videos/';
        } else {
            return callback(new Error('Invalid file type'), false);
        }

        callback(null, uploadPath);
    },
    filename: (req, file, callback) => {
        // Generate a unique filename
        callback(null, Date.now() + '-' + file.originalname);
    }
});

// File filter to allow only specific file types
const fileFilter = (req, file, callback) => {
    const allowedFileTypes = /jpeg|jpg|png|gif|mp4|mov|avi|mkv/;
    const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedFileTypes.test(file.mimetype);

    if (mimetype && extname) {
        return callback(null, true);
    } else {
        callback(new Error('Error: File upload only supports the following filetypes - ' + allowedFileTypes));
    }
};

// Create the multer instance 
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024 // Limit file size to 100MB
    },
    fileFilter: fileFilter
}).single('file'); // 'file' can be 'image' or 'video' depending on your form field name


module.exports = upload; 