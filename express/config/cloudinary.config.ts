import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import multer from 'multer';
import { MAX_FILE_SIZE } from '../../library/utils/constants';

dotenv.config();

export const configureCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
};

// configure multer for handling image upload
export const upload = multer({
  // store files in memory instead of on disk because we don't need to save the file
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (req, file, cb) => {
    // accept image only. throw error in callback if not an image
    if (!file.mimetype.startsWith('image')) {
      cb(new Error('Only image files are allowed!'));
    }
    // callback with no error to accept the file
    cb(null, true);
  },
}).single('image'); // this allows us to access the image file in the request object as req.file
