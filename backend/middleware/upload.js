// middleware/upload.js
// Multer configuration for direct file uploads on complaints (photos/videos/
// audio evidence). Stores to local disk under /uploads for the hackathon —
// swap `storage` for a multer-s3 or Cloudinary storage engine later without
// touching the route/controller, since they only see req.file.

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Mime type -> our complaint_media.type enum ('image', 'video', 'audio')
const ALLOWED_MIME_TYPES = {
    'image/jpeg': 'image',
    'image/png': 'image',
    'image/webp': 'image',
    'image/gif': 'image',
    'video/mp4': 'video',
    'video/quicktime': 'video',
    'video/webm': 'video',
    'audio/mpeg': 'audio',
    'audio/mp4': 'audio',
    'audio/wav': 'audio',
    'audio/webm': 'audio',
    'audio/ogg': 'audio',
};

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB — plenty for photos/short clips, keeps disk use sane

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
        const uniqueSuffix = crypto.randomBytes(16).toString('hex');
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${Date.now()}-${uniqueSuffix}${ext}`);
    },
});

function fileFilter(req, file, cb) {
    if (!ALLOWED_MIME_TYPES[file.mimetype]) {
        return cb(new Error(
            `Unsupported file type "${file.mimetype}". Allowed: ${Object.keys(ALLOWED_MIME_TYPES).join(', ')}`
        ));
    }
    cb(null, true);
}

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: MAX_FILE_SIZE_BYTES, files: 1 },
});

module.exports = { upload, ALLOWED_MIME_TYPES, UPLOAD_DIR };
