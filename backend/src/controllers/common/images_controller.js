const { pipeline } = require("node:stream/promises");
const Minio = require("minio");

const minioClient = new Minio.Client({
  endPoint: process.env.S3_ENDPOINT,        // host only, e.g. 127.0.0.1 (no http://)
  port: Number(process.env.S3_PORT || 9000),
  useSSL: false,
  accessKey: process.env.S3_ACCESS_KEY,
  secretKey: process.env.S3_SECRET_KEY,
});
const BUCKET = process.env.S3_BUCKET;
const SAFE_KEY = /^[\w.-]+$/;


exports.fetchImage = async (req,res, next ) => {
    
    const { key } = req.params;
    if (!SAFE_KEY.test(key)) return res.status(400).end();

    try {
        const stat = await minioClient.statObject(BUCKET, key);
        res.set("Content-Type", stat.metaData["content-type"] || "application/octet-stream");
        res.set("Content-Length", String(stat.size));
        res.set("Cache-Control", "public, max-age=86400");

        const stream = await minioClient.getObject(BUCKET, key);
        await pipeline(stream, res);
    } catch (err) {
        if (err.code === "NotFound" || err.code === "NoSuchKey") return res.status(404).end();
        next(err);
    }
   
}








