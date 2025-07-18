// Future implementation with Cloudinary
// npm install cloudinary multer-storage-cloudinary

import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const cloudinaryStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'petopia/avatars',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
        transformation: [
            {
                width: 300,
                height: 300,
                crop: 'fill',
                gravity: 'auto',
            },
            {
                quality: 'auto',
                fetch_format: 'auto',
            },
        ],
        public_id: (req, file) => {
            return `avatar-${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        },
    },
});

const uploadToCloudinary = multer({
    storage: cloudinaryStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

export default uploadToCloudinary;
