const multer = require('multer')
const path = require('path')

// Configure Multer for file storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      // Specify the folder where files will be saved
      const uploadPath = path.join(__dirname, '../', 'images');
      console.log(file)
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      // Save the file with its original name
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  })



// File filter to ensure only images are uploaded
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']; // Add other image types as needed
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Only image files are allowed'), false);
    }
    cb(null, true); // File is valid
  };
  
  const upload = multer({ storage: storage, fileFilter: fileFilter });

  module.exports = upload
