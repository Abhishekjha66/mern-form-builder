// backend/model/Form.js
const mongoose = require('mongoose');

// This schema defines what a single question looks like
const questionSchema = new mongoose.Schema({
  // The type of question (e.g., Categorize, Cloze, Comprehension)
  type: {
    type: String,
    required: true,
    enum: ['Categorize', 'Cloze', 'Comprehension']
  },
  // The main text of the question
  prompt: {
    type: String,
    required: true
  },
  // URL for an image associated with the question (optional)
  image: String,

  // Properties specific to the "Categorize" question type
  categories: [String],
  options: [String],

  // Properties specific to the "Cloze" question type
  clozeText: String,

  // Properties specific to the "Comprehension" question type
  comprehensionText: String,
  subQuestions: [{
    question: String,
    options: [String],
    correctAnswer: String
  }]
});

// This schema defines what a full form looks like
const formSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  // The URL for the header image at the top of the form (optional)
  headerImage: String,
  // An array to hold all the questions
  questions: [questionSchema]
});

module.exports = mongoose.model('Form', formSchema);
