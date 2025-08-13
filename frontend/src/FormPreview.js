import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Component for an interactive Categorize question
const InteractiveCategorize = ({ question, onAnswerChange }) => {
  const [selectedOptions, setSelectedOptions] = useState({});

  useEffect(() => {
    // Initialize state with empty arrays for each category
    const initialSelection = question.categories.reduce((acc, category) => {
      acc[category] = [];
      return acc;
    }, {});
    setSelectedOptions(initialSelection);
    onAnswerChange(initialSelection);
  }, [question]);

  const handleDragStart = (e, option) => {
    e.dataTransfer.setData("text/plain", option);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Allows drop
  };

  const handleDrop = (e, category) => {
    e.preventDefault();
    const option = e.dataTransfer.getData("text/plain");

    // Remove option from all other categories, then add to the new one
    const newSelectedOptions = { ...selectedOptions };
    for (const cat in newSelectedOptions) {
      newSelectedOptions[cat] = newSelectedOptions[cat].filter(item => item !== option);
    }
    newSelectedOptions[category] = [...newSelectedOptions[category], option];

    setSelectedOptions(newSelectedOptions);
    onAnswerChange(newSelectedOptions);
  };

  // Get options that haven't been dragged into a category yet
  const availableOptions = question.options.filter(option =>
    !Object.values(selectedOptions).flat().includes(option)
  );

  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow-inner mb-4">
      <h4 className="text-xl font-semibold mb-2">{question.prompt}</h4>
      <div className="flex flex-wrap gap-2 mt-4 min-h-[50px] border-b-2 border-dashed border-gray-300 pb-4">
        {availableOptions.map((option, index) => (
          <span
            key={index}
            className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium shadow-sm cursor-grab"
            draggable
            onDragStart={(e) => handleDragStart(e, option)}
          >
            {option}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 mt-4">
        {question.categories.map((category, index) => (
          <div
            key={index}
            className="p-4 bg-white border border-gray-200 rounded-lg shadow min-h-[150px]"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, category)}
          >
            <h5 className="font-bold text-gray-700 mb-2">{category}</h5>
            <div className="flex flex-wrap gap-2">
              {selectedOptions[category]?.map((option, optIndex) => (
                <span
                  key={optIndex}
                  className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium shadow-sm"
                >
                  {option}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Component for an interactive Cloze question
const InteractiveCloze = ({ question, onAnswerChange }) => {
  const [answers, setAnswers] = useState(Array(question.answers.length).fill(''));

  useEffect(() => {
    onAnswerChange(answers);
  }, [answers]);

  const handleInputChange = (e, index) => {
    const newAnswers = [...answers];
    newAnswers[index] = e.target.value;
    setAnswers(newAnswers);
  };

  const parts = question.clozeText.split('_');

  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow-inner mb-4">
      <h4 className="text-xl font-semibold mb-2">{question.prompt}</h4>
      <div className="flex flex-wrap items-center">
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            {part}
            {index < parts.length - 1 && (
              <input
                type="text"
                className="mx-2 p-1 border-b border-gray-400 focus:outline-none focus:border-blue-500"
                value={answers[index] || ''}
                onChange={(e) => handleInputChange(e, index)}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// Component for an interactive Comprehension question
const InteractiveComprehension = ({ question, onAnswerChange }) => {
  const [subQuestionAnswers, setSubQuestionAnswers] = useState({});

  useEffect(() => {
    // Initialize state with null for each sub-question
    const initialAnswers = question.subQuestions.reduce((acc, subQ) => {
      acc[subQ.prompt] = null;
      return acc;
    }, {});
    setSubQuestionAnswers(initialAnswers);
    onAnswerChange(initialAnswers);
  }, [question]);

  const handleOptionChange = (e, subQuestionPrompt) => {
    const newAnswers = { ...subQuestionAnswers, [subQuestionPrompt]: e.target.value };
    setSubQuestionAnswers(newAnswers);
    onAnswerChange(newAnswers);
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow-inner mb-4">
      <h4 className="text-xl font-semibold mb-2">{question.prompt}</h4>
      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{question.comprehensionText}</p>
      <div className="mt-4 space-y-4">
        {question.subQuestions.map((subQuestion, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow">
            <p className="font-medium text-gray-800">{subQuestion.prompt}</p>
            <div className="mt-2 space-y-1">
              {subQuestion.options.map((option, optIndex) => (
                <label key={optIndex} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name={`subQuestion-${index}`}
                    value={option}
                    checked={subQuestionAnswers[subQuestion.prompt] === option}
                    onChange={(e) => handleOptionChange(e, subQuestion.prompt)}
                    className="form-radio"
                  />
                  <span className="text-gray-600">{option}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main Form Preview component
export default function FormPreview({ formId }) {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submissionMessage, setSubmissionMessage] = useState('');

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/forms/${formId}`);
        setForm(response.data);
      } catch (err) {
        console.error('Error fetching form:', err);
        setError('Failed to load form.');
      } finally {
        setLoading(false);
      }
    };

    if (formId) {
      fetchForm();
    }
  }, [formId]);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prevAnswers => ({
      ...prevAnswers,
      [questionId]: answer
    }));
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/responses', {
        formId: form._id,
        answers: answers
      });
      setSubmissionMessage('Form submitted successfully! Thank you.');
      console.log('Submission successful:', response.data);
    } catch (err) {
      console.error('Error submitting form:', err);
      setSubmissionMessage('There was an error submitting your form.');
    }
  };

  if (loading) {
    return <div className="text-center text-gray-500 text-lg">Loading form...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 text-lg">{error}</div>;
  }

  if (!form) {
    return <div className="text-center text-gray-500 text-lg">No form found with that ID.</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto font-sans bg-gray-100 min-h-screen">
      <div className="bg-white p-8 rounded-xl shadow-2xl">
        <h1 className="text-4xl font-extrabold text-center mb-6 text-gray-800">{form.title}</h1>
        {form.headerImage && (
          <img
            src={form.headerImage}
            alt="Form Header"
            className="w-full h-auto object-cover rounded-lg mb-6 shadow-md"
          />
        )}
        <div className="space-y-6">
          {form.questions.map((question, index) => {
            switch (question.type) {
              case 'Categorize':
                return (
                  <InteractiveCategorize
                    key={index}
                    question={question}
                    onAnswerChange={(ans) => handleAnswerChange(index, ans)}
                  />
                );
              case 'Cloze':
                return (
                  <InteractiveCloze
                    key={index}
                    question={question}
                    onAnswerChange={(ans) => handleAnswerChange(index, ans)}
                  />
                );
              case 'Comprehension':
                return (
                  <InteractiveComprehension
                    key={index}
                    question={question}
                    onAnswerChange={(ans) => handleAnswerChange(index, ans)}
                  />
                );
              default:
                return null;
            }
          })}
        </div>
        {submissionMessage && (
          <div className="mt-6 p-4 text-center bg-green-100 text-green-800 rounded-lg">
            {submissionMessage}
          </div>
        )}
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white font-bold text-xl py-4 mt-8 rounded-full hover:bg-blue-700 transition duration-300 transform hover:scale-105 shadow-xl"
        >
          Submit Form
        </button>
      </div>
    </div>
  );
}
