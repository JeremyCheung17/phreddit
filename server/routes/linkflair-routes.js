const express = require('express');
const router = express.Router();
const LinkFlair = require('../models/linkflairs');

router.get('/', async (req, res) => {
    try {
      const linkFlairs = await LinkFlair.find();
      res.json(linkFlairs);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
});

router.post('/', async (req, res) => {
    const linkFlair = new LinkFlair({
      content: req.body.content
    });
    try {
      const newLinkFlair = await linkFlair.save();
      res.status(201).json(newLinkFlair);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
});

router.get('/:id', async (req, res) => {
  try {
    const linkFlair = await LinkFlair.findById(req.params.id);
    if (!linkFlair) return res.status(404).json({ message: 'link flair not found' });
    res.json(linkFlair);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;