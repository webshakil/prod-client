import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { FaPlus, FaTrash, FaGripVertical, FaImage } from 'react-icons/fa';
import QuestionBuilder from '../../../election/QuestionBuilder';

export default function Step3Questions({ data, updateData, onNext, onPrevious }) {
  const [errors, setErrors] = useState({});
  
  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      question_text: '',
      question_type: 'multiple_choice',
      question_order: (data.questions || []).length + 1,
      is_required: true,
      max_selections: 1,
      question_image: null,
      options: [
        { id: Date.now() + 1, option_text: '', option_order: 1, option_image: null },
        { id: Date.now() + 2, option_text: '', option_order: 2, option_image: null }
      ]
    };
    
    updateData({
      questions: [...(data.questions || []), newQuestion]
    });
  };
  
  const updateQuestion = (questionId, updates) => {
    const updatedQuestions = (data.questions || []).map(q =>
      q.id === questionId ? { ...q, ...updates } : q
    );
    updateData({ questions: updatedQuestions });
  };
  
  const deleteQuestion = (questionId) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      const updatedQuestions = (data.questions || [])
        .filter(q => q.id !== questionId)
        .map((q, index) => ({ ...q, question_order: index + 1 }));
      updateData({ questions: updatedQuestions });
      toast.success('Question deleted');
    }
  };
  
  const moveQuestion = (index, direction) => {
    const questions = [...(data.questions || [])];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= questions.length) return;
    
    [questions[index], questions[newIndex]] = [questions[newIndex], questions[index]];
    
    // Update order
    questions.forEach((q, i) => {
      q.question_order = i + 1;
    });
    
    updateData({ questions });
  };
  
  const validate = () => {
    const newErrors = {};
    
    if (!data.questions || data.questions.length === 0) {
      newErrors.questions = 'Please add at least one question';
      toast.error('Please add at least one question');
      setErrors(newErrors);
      return false;
    }
    
    // Validate each question
    for (let i = 0; i < data.questions.length; i++) {
      const question = data.questions[i];
      
      if (!question.question_text?.trim()) {
        newErrors[`question_${i}`] = 'Question text is required';
        toast.error(`Question ${i + 1}: Text is required`);
        setErrors(newErrors);
        return false;
      }
      
      if (question.question_type === 'multiple_choice' || question.question_type === 'image_based') {
        if (!question.options || question.options.length < 2) {
          newErrors[`question_${i}_options`] = 'At least 2 options required';
          toast.error(`Question ${i + 1}: At least 2 options required`);
          setErrors(newErrors);
          return false;
        }
        
        // Check if all options have text
        for (let j = 0; j < question.options.length; j++) {
          if (!question.options[j].option_text?.trim()) {
            newErrors[`question_${i}_option_${j}`] = 'Option text is required';
            toast.error(`Question ${i + 1}, Option ${j + 1}: Text is required`);
            setErrors(newErrors);
            return false;
          }
        }
      }
    }
    
    setErrors({});
    return true;
  };
  
  const handleNext = () => {
    if (validate()) {
      onNext();
    }
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Step 3: Add Questions
          </h2>
          <p className="text-gray-600 mt-1">
            Create questions and options for your election
          </p>
        </div>
        <button
          onClick={addQuestion}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition shadow-md"
        >
          <FaPlus />
          Add Question
        </button>
      </div>
      
      {/* Questions List */}
      {(!data.questions || data.questions.length === 0) ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
          <div className="text-6xl mb-4">❓</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No Questions Yet
          </h3>
          <p className="text-gray-600 mb-6">
            Click "Add Question" to create your first question
          </p>
          <button
            onClick={addQuestion}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition"
          >
            <FaPlus />
            Add Your First Question
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {data.questions.map((question, index) => (
            <div
              key={question.id}
              className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition"
            >
              {/* Question Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => moveQuestion(index, 'up')}
                      disabled={index === 0}
                      className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                      ▲
                    </button>
                    <FaGripVertical className="text-gray-400" />
                    <button
                      onClick={() => moveQuestion(index, 'down')}
                      disabled={index === data.questions.length - 1}
                      className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                      ▼
                    </button>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-blue-600">
                      Question {index + 1}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => deleteQuestion(question.id)}
                  className="text-red-600 hover:text-red-700 p-2"
                  title="Delete Question"
                >
                  <FaTrash />
                </button>
              </div>
              
              {/* Question Builder Component */}
              <QuestionBuilder
                question={question}
                onChange={(updates) => updateQuestion(question.id, updates)}
                questionNumber={index + 1}
              />
            </div>
          ))}
        </div>
      )}
      
      {errors.questions && (
        <p className="text-red-500 text-sm mt-4">{errors.questions}</p>
      )}
      
      {/* Summary */}
      {data.questions && data.questions.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-2">Questions Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total Questions:</span>
              <span className="ml-2 font-bold text-blue-600">{data.questions.length}</span>
            </div>
            <div>
              <span className="text-gray-600">Multiple Choice:</span>
              <span className="ml-2 font-bold text-blue-600">
                {data.questions.filter(q => q.question_type === 'multiple_choice').length}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Open Text:</span>
              <span className="ml-2 font-bold text-blue-600">
                {data.questions.filter(q => q.question_type === 'open_text').length}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Image Based:</span>
              <span className="ml-2 font-bold text-blue-600">
                {data.questions.filter(q => q.question_type === 'image_based').length}
              </span>
            </div>
          </div>
        </div>
      )}
      
      {/* Actions */}
      <div className="flex justify-between pt-6 border-t mt-8">
        <button
          onClick={onPrevious}
          className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition"
        >
          ← Previous
        </button>
        
        <button
          onClick={handleNext}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition shadow-md"
        >
          Next: Review →
        </button>
      </div>
    </div>
  );
}