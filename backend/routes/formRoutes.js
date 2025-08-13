const express = require('express');
// 🚨 This is the line with the pathing issue.
// The code is looking for a folder named 'models', but yours is named 'model'.
const Form = require('../models/Form');

const router = express.Router();

// Get all forms
router.get('/', async (req, res) => {
  try {
    const forms = await Form.find();
    res.json(forms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single form by ID (NEW ROUTE)
router.get('/:id', async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }
    res.json(form);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new form
router.post('/', async (req, res) => {
  const form = new Form({
    title: req.body.title,
    headerImage: req.body.headerImage,
    questions: req.body.questions,
  });

  try {
    const newForm = await form.save();
    res.status(201).json(newForm);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;

