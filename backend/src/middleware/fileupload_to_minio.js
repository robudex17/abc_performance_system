const multer = require('multer')
const Minio = require('minio')
const path = require('path')

// Remove the MinIO client from top level — don't initialize here
const BUCKET = process.env.S3_BUCKET

const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
    if (!allowedTypes.includes(file.mimetype)) {
        return cb(new Error('Only image files are allowed'), false)
    }
    cb(null, true)
}

const upload = multer({ storage: storage, fileFilter: fileFilter })

// Create MinIO client INSIDE the function
// so it only runs when actually called (env vars loaded by then)
const uploadToMinio = async (file) => {
    
    // Initialize client here instead of top level
    const minioClient = new Minio.Client({
        endPoint: process.env.S3_ENDPOINT,
        port: parseInt(process.env.S3_PORT) || 9000,
        useSSL: false,
        accessKey: process.env.S3_ACCESS_KEY,
        secretKey: process.env.S3_SECRET_KEY,
    })

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const filename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)

    await minioClient.putObject(
        BUCKET,
        filename,
        file.buffer,
        file.size,
        { 'Content-Type': file.mimetype }
    )

    return filename
}

module.exports = { upload, uploadToMinio }