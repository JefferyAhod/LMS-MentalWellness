// backend/middleware/uploadMiddleware.js

import multer from 'multer';
import path from 'path';

// Set storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Specify the directory where uploaded files should be stored temporarily
    // Make sure this directory exists or is created by your server startup script
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Generate a unique filename for the uploaded file
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// Check file type
function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}

// Init upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },
});

export default upload;
