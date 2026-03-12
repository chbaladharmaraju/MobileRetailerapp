const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(auth);

router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  
  // With Cloudinary Storage, the URL is available as req.file.path
  const url = req.file.path;
  res.json({ url, filename: req.file.filename });
});

module.exports = router;
