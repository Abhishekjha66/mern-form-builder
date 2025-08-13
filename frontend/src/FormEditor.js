import React, { useState } from 'react';
import axios from 'axios';

// A simple utility to create a new question object
const createQuestion = (type) => {
  const newId = Date.now(); // Unique ID for each question
  switch (type) {
    case 'Categorize':
      return { 
        id: newId, 
        type, 
        prompt: 'Drag the following items to their correct categories:', 
        categories: ['Category 1', 'Category 2'], 
        options: ['Option 1', 'Option 2'] 
      };
    case 'Cloze':
      return { 
        id: newId, 
        type, 
        prompt: 'Fill in the blanks:', 
        clozeText: 'Fill in the blanks: _ is a programming language.',
        answers: ['JavaScript']
      };
    case 'Comprehension':
      return { 
        id: newId, 
        type, 
        prompt: 'Read the following passage:', 
        comprehensionText: 'Once upon a time...', 
        subQuestions: [{
          id: Date.now(),
          prompt: 'What is the main idea of the passage?',
          type: 'Multiple Choice',
          options: ['Option A', 'Option B', 'Option C'],
          correctAnswer: 'Option A'
        }] 
      };
    default:
      return { id: newId, type, prompt: '' };
  }
};

// =================================================================
// NEW COMPONENT: SubQuestionEditor for the Comprehension type.
// =================================================================
const SubQuestionEditor = ({ subQuestion, subIndex, onSubQuestionChange, onRemoveSubQuestion }) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onSubQuestionChange(subIndex, { ...subQuestion, [name]: value });
  };
  
  const handleOptionChange = (optIndex, e) => {
    const newOptions = [...subQuestion.options];
    newOptions[optIndex] = e.target.value;
    onSubQuestionChange(subIndex, { ...subQuestion, options: newOptions });
  };
  
  const handleAddOption = () => {
    const newOptions = [...subQuestion.options, `Option ${subQuestion.options.length + 1}`];
    onSubQuestionChange(subIndex, { ...subQuestion, options: newOptions });
  };
  
  const handleRemoveOption = (optIndex) => {
    const newOptions = subQuestion.options.filter((_, i) => i !== optIndex);
    onSubQuestionChange(subIndex, { ...subQuestion, options: newOptions });
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg shadow-inner my-2 border border-gray-200">
      <div className="flex justify-between items-center mb-2">
        <h5 className="font-semibold text-gray-700">Sub-Question {subIndex + 1}</h5>
        <button
          onClick={() => onRemoveSubQuestion(subIndex)}
          className="text-red-500 hover:text-red-700 text-sm"
        >
          &times;
        </button>
      </div>
      
      <input
        type="text"
        name="prompt"
        value={subQuestion.prompt}
        onChange={handleInputChange}
        placeholder="Sub-Question Prompt"
        className="w-full p-2 border rounded-md mb-2 text-sm"
      />
      
      {/* For now, we'll assume all sub-questions are Multiple Choice */}
      <div className="space-y-1">
        {subQuestion.options.map((option, optIndex) => (
          <div key={optIndex} className="flex items-center space-x-2">
            <input
              type="text"
              value={option}
              onChange={(e) => handleOptionChange(optIndex, e)}
              placeholder={`Option ${optIndex + 1}`}
              className="w-full p-1 border rounded-md text-sm"
            />
            <button
              onClick={() => handleRemoveOption(optIndex)}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={handleAddOption}
        className="mt-2 text-sm text-blue-500 hover:text-blue-700 font-semibold"
      >
        + Add Option
      </button>
      
      {/* Correct Answer selection (for Multiple Choice) */}
      <div className="mt-4">
        <h6 className="text-sm font-medium mb-1">Correct Answer</h6>
        <select
          name="correctAnswer"
          value={subQuestion.correctAnswer}
          onChange={handleInputChange}
          className="w-full p-2 border rounded-md text-sm"
        >
          {subQuestion.options.map((option, optIndex) => (
            <option key={optIndex} value={option}>{option}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

// =================================================================
// UPDATED COMPONENT: QuestionEditor now handles Comprehension
// =================================================================
const QuestionEditor = ({ question, index, onQuestionChange, onRemoveQuestion }) => {
  // Handle changes to a basic question field (like prompt)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onQuestionChange(index, { ...question, [name]: value });
  };
  
  // Handle adding a new category
  const handleAddCategory = () => {
    const newCategories = [...question.categories, `Category ${question.categories.length + 1}`];
    onQuestionChange(index, { ...question, categories: newCategories });
  };

  // Handle changes to a specific category
  const handleCategoryChange = (catIndex, e) => {
    const newCategories = [...question.categories];
    newCategories[catIndex] = e.target.value;
    onQuestionChange(index, { ...question, categories: newCategories });
  };
  
  // Handle removing a category
  const handleRemoveCategory = (catIndex) => {
    const newCategories = question.categories.filter((_, i) => i !== catIndex);
    onQuestionChange(index, { ...question, categories: newCategories });
  };

  // Handle adding a new option
  const handleAddOption = () => {
    const newOptions = [...question.options, `Option ${question.options.length + 1}`];
    onQuestionChange(index, { ...question, options: newOptions });
  };
  
  // Handle changes to a specific option
  const handleOptionChange = (optIndex, e) => {
    const newOptions = [...question.options];
    newOptions[optIndex] = e.target.value;
    onQuestionChange(index, { ...question, options: newOptions });
  };
  
  // Handle removing an option
  const handleRemoveOption = (optIndex) => {
    const newOptions = question.options.filter((_, i) => i !== optIndex);
    onQuestionChange(index, { ...question, options: newOptions });
  };

  // Handle changes to the Cloze text, including updating the answers array
  const handleClozeTextChange = (e) => {
    const clozeText = e.target.value;
    // Find how many blanks are in the new text
    const newBlankCount = (clozeText.match(/_/g) || []).length;
    
    // Adjust the answers array size to match the new blank count
    let newAnswers = [...(question.answers || [])];
    if (newAnswers.length < newBlankCount) {
      // Add empty strings for new blanks
      newAnswers = [...newAnswers, ...Array(newBlankCount - newAnswers.length).fill('')];
    } else if (newAnswers.length > newBlankCount) {
      // Trim the array if blanks were removed
      newAnswers = newAnswers.slice(0, newBlankCount);
    }
    
    onQuestionChange(index, { ...question, clozeText, answers: newAnswers });
  };

  // Handle changes to a specific Cloze answer
  const handleClozeAnswerChange = (ansIndex, e) => {
    const newAnswers = [...question.answers];
    newAnswers[ansIndex] = e.target.value;
    onQuestionChange(index, { ...question, answers: newAnswers });
  };
  
  // NEW: Add a new sub-question to a Comprehension question
  const handleAddSubQuestion = () => {
    const newSubQuestion = {
      id: Date.now(),
      prompt: `New Sub-Question ${question.subQuestions.length + 1}`,
      type: 'Multiple Choice',
      options: ['Option 1', 'Option 2'],
      correctAnswer: 'Option 1'
    };
    const newSubQuestions = [...question.subQuestions, newSubQuestion];
    onQuestionChange(index, { ...question, subQuestions: newSubQuestions });
  };
  
  // NEW: Handle a change to a sub-question's state
  const handleSubQuestionChange = (subIndex, updatedSubQuestion) => {
    const newSubQuestions = [...question.subQuestions];
    newSubQuestions[subIndex] = updatedSubQuestion;
    onQuestionChange(index, { ...question, subQuestions: newSubQuestions });
  };
  
  // NEW: Remove a sub-question
  const handleRemoveSubQuestion = (subIndex) => {
    const newSubQuestions = question.subQuestions.filter((_, i) => i !== subIndex);
    onQuestionChange(index, { ...question, subQuestions: newSubQuestions });
  };
  

  // Dynamically render UI based on question type
  const renderSpecificQuestionUI = () => {
    switch (question.type) {
      case 'Categorize':
        return (
          <div className="space-y-4">
            <input
              type="text"
              name="prompt"
              value={question.prompt}
              onChange={handleInputChange}
              placeholder="Question Prompt"
              className="w-full p-2 border rounded-md"
            />
            
            {/* Categories Section */}
            <div className="border p-4 rounded-lg bg-white shadow-inner">
              <h4 className="font-semibold mb-2">Categories</h4>
              <div className="flex flex-wrap gap-2">
                {question.categories.map((category, catIndex) => (
                  <div key={catIndex} className="flex items-center space-x-2 bg-gray-100 p-2 rounded-md">
                    <input
                      type="text"
                      value={category}
                      onChange={(e) => handleCategoryChange(catIndex, e)}
                      placeholder={`Category ${catIndex + 1}`}
                      className="w-40 p-1 border rounded-md text-sm"
                    />
                    <button
                      onClick={() => handleRemoveCategory(catIndex)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={handleAddCategory}
                className="mt-2 text-sm text-blue-500 hover:text-blue-700 font-semibold"
              >
                + Add Category
              </button>
            </div>

            {/* Options Section */}
            <div className="border p-4 rounded-lg bg-white shadow-inner">
              <h4 className="font-semibold mb-2">Options</h4>
              <div className="flex flex-wrap gap-2">
                {question.options.map((option, optIndex) => (
                  <div key={optIndex} className="flex items-center space-x-2 bg-gray-100 p-2 rounded-md">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(optIndex, e)}
                      placeholder={`Option ${optIndex + 1}`}
                      className="w-40 p-1 border rounded-md text-sm"
                    />
                    <button
                      onClick={() => handleRemoveOption(optIndex)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={handleAddOption}
                className="mt-2 text-sm text-blue-500 hover:text-blue-700 font-semibold"
              >
                + Add Option
              </button>
            </div>
          </div>
        );
      case 'Cloze':
        return (
          <div className="space-y-4">
            <input
              type="text"
              name="prompt"
              value={question.prompt}
              onChange={handleInputChange}
              placeholder="Question Prompt (e.g., Fill in the blanks)"
              className="w-full p-2 border rounded-md"
            />
            <textarea
              name="clozeText"
              value={question.clozeText}
              onChange={handleClozeTextChange}
              placeholder="Enter a sentence with blanks (use underscores like: _)"
              rows="3"
              className="w-full p-2 border rounded-md"
            />
            {/* NEW: Input fields for the answers */}
            <div className="border p-4 rounded-lg bg-white shadow-inner">
              <h4 className="font-semibold mb-2">Correct Answers</h4>
              <div className="flex flex-wrap gap-2">
                {question.answers && question.answers.map((answer, ansIndex) => (
                  <input
                    key={ansIndex}
                    type="text"
                    value={answer}
                    onChange={(e) => handleClozeAnswerChange(ansIndex, e)}
                    placeholder={`Answer ${ansIndex + 1}`}
                    className="w-40 p-1 border rounded-md text-sm"
                  />
                ))}
              </div>
            </div>
          </div>
        );
      case 'Comprehension':
        return (
          <div className="space-y-4">
            <input
              type="text"
              name="prompt"
              value={question.prompt}
              onChange={handleInputChange}
              placeholder="Question Prompt (e.g., Read the following passage)"
              className="w-full p-2 border rounded-md"
            />
            <textarea
              name="comprehensionText"
              value={question.comprehensionText}
              onChange={handleInputChange}
              placeholder="Enter the comprehension passage here..."
              rows="5"
              className="w-full p-2 border rounded-md"
            />
            {/* NEW: Sub-questions section */}
            <div className="border p-4 rounded-lg bg-white shadow-inner">
              <h4 className="font-semibold mb-2">Sub-Questions</h4>
              {question.subQuestions.map((subQuestion, subIndex) => (
                <SubQuestionEditor 
                  key={subQuestion.id}
                  subQuestion={subQuestion}
                  subIndex={subIndex}
                  onSubQuestionChange={handleSubQuestionChange}
                  onRemoveSubQuestion={handleRemoveSubQuestion}
                />
              ))}
              <button
                onClick={handleAddSubQuestion}
                className="mt-2 text-sm text-blue-500 hover:text-blue-700 font-semibold"
              >
                + Add Sub-Question
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md my-4 border border-gray-200">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-gray-800">Question {index + 1} ({question.type})</h3>
        <button
          onClick={() => onRemoveQuestion(index)}
          className="text-red-500 hover:text-red-700 font-semibold"
        >
          &times;
        </button>
      </div>
      {renderSpecificQuestionUI()}
    </div>
  );
};


// Main App component
function FormEditor() {
  const [form, setForm] = useState({
    title: '',
    headerImage: '',
    questions: []
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleAddQuestion = (type) => {
    setForm(prevForm => ({
      ...prevForm,
      questions: [...prevForm.questions, createQuestion(type)]
    }));
  };

  const handleQuestionChange = (index, updatedQuestion) => {
    const newQuestions = [...form.questions];
    newQuestions[index] = updatedQuestion;
    setForm({ ...form, questions: newQuestions });
  };
  
  const handleRemoveQuestion = (index) => {
    const newQuestions = form.questions.filter((_, i) => i !== index);
    setForm({ ...form, questions: newQuestions });
  };

  const handleSaveForm = async () => {
    if (!form.title) {
      alert('Please enter a form title!');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/forms', form);
      console.log('Form saved successfully!', response.data);
      alert(`Form "${form.title}" saved successfully!`);
      setForm({ title: '', headerImage: '', questions: [] }); // Reset form
    } catch (error) {
      console.error('Error saving form:', error);
      alert('Failed to save form. Check the console for details.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-3xl">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Form Editor</h1>
        
        {/* Form Title */}
        <input
          type="text"
          name="title"
          placeholder="Enter Form Title"
          value={form.title}
          onChange={handleInputChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 text-lg font-semibold mb-4"
        />

        {/* Header Image (Placeholder) */}
        <p className="text-sm text-gray-500 mb-4">Header Image functionality to be added later...</p>

        {/* Question List */}
        {form.questions.map((question, index) => (
          <QuestionEditor 
            key={question.id}
            question={question} 
            index={index} 
            onQuestionChange={handleQuestionChange}
            onRemoveQuestion={handleRemoveQuestion}
          />
        ))}

        {/* Add Question Buttons */}
        <div className="flex justify-center space-x-4 mt-6">
          <button
            onClick={() => handleAddQuestion('Categorize')}
            className="bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600 transition duration-300 shadow-md"
          >
            Add Categorize
          </button>
          <button
            onClick={() => handleAddQuestion('Cloze')}
            className="bg-yellow-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-yellow-600 transition duration-300 shadow-md"
          >
            Add Cloze
          </button>
          <button
            onClick={() => handleAddQuestion('Comprehension')}
            className="bg-purple-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-600 transition duration-300 shadow-md"
          >
            Add Comprehension
          </button>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSaveForm}
          className="w-full bg-blue-600 text-white font-semibold py-3 mt-6 rounded-lg hover:bg-blue-700 transition duration-300 shadow-md"
        >
          Save Form
        </button>
      </div>
    </div>
  );
}

export default FormEditor;
