import multer from 'multer';
import path from 'path';
import { randomBytes } from 'crypto';
import { ApiError } from '../utils/ApiError';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, 'uploads/'),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${randomBytes(4).toString('hex')}${ext}`);
  },
});

const allowed = ['image/png', 'image/jpeg', 'application/pdf'];

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo
  fileFilter: (_req, file, cb) => {
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new ApiError(400, 'Format non autorise (PNG, JPG, PDF uniquement)'));
  },
});