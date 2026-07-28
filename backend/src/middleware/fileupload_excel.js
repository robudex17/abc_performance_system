const multer = require('multer')

// Configure Multer for file uploads
const storage = multer.memoryStorage();



// File filter to accept only excel file 

const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'application/vnd.ms-excel', // .xls
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // .xlsx
    ]

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true) // Accept the file
      } else {
        cb(new Error('Only Excel files are allowed (.xls, .xlsx)'), false)
      }
    
}


const upload = multer({ storage: storage, fileFilter: fileFilter });

module.exports = upload

