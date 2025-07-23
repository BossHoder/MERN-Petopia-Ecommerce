// Simple local storage configuration for personal project
import multer from 'multer';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync } from 'fs';
import { ERROR_MESSAGES } from '../constants/errorMessages.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Ensure upload directory exists
const uploadDir = join(__dirname, '../../public/images');
console.log('🔍 Calculated upload directory:', uploadDir);
if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true });
    console.log('✅ Created upload directory:', uploadDir);
} else {
    console.log('✅ Upload directory exists:', uploadDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log('� MULTER DESTINATION CALLED');
        console.log('�📁 Upload directory:', uploadDir);
        console.log('📁 Directory exists:', existsSync(uploadDir));

        // Double check directory exists before callback
        if (!existsSync(uploadDir)) {
            console.log('❌ Directory does not exist, creating...');
            mkdirSync(uploadDir, { recursive: true });
        }

        console.log('✅ Calling callback with:', uploadDir);
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        console.log('🔥 MULTER FILENAME CALLED');
        console.log('📄 Original file:', file.originalname);
        console.log('📄 File mimetype:', file.mimetype);

        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = file.originalname.split('.').pop().toLowerCase();
        const filename = `avatar-${uniqueSuffix}.${ext}`;

        console.log('📝 Generated filename:', filename);
        console.log('✅ Calling filename callback');
        cb(null, filename);
    },
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 1, // Only 1 file at a time
    },
    fileFilter: (req, file, cb) => {
        console.log('Uploading file:', file.originalname, 'Type:', file.mimetype);

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(ERROR_MESSAGES.INVALID_FILE_TYPE));
        }
    },
});

export default upload;
