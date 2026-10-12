const { S3Client } = require("@aws-sdk/client-s3");
 
const s3 = new S3Client({
  region: process.env.S3_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  },
  // Set for MinIO/Garage/etc.; leave S3_ENDPOINT empty for AWS S3
  ...(process.env.S3_ENDPOINT && {
    endpoint: process.env.S3_ENDPOINT,
    forcePathStyle: true,
  }),
});
 
const BUCKET = process.env.S3_BUCKET;
 
module.exports = { s3, BUCKET };

