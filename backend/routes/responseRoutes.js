const express = require('express');
const Response = require('../models/Response');

const router = express.Router();

// Submit a new response to a form
router.post('/', async (req, res) => {
  const response = new Response({
    formId: req.body.formId,
    answers: req.body.answers,
  });

  try {
    const newResponse = await response.save();
    res.status(201).json(newResponse);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
