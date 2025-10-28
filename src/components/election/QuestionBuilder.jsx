import React from 'react';
import { FaPlus, FaTrash, FaImage, FaTimes, FaUpload } from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function QuestionBuilder({ question, onChange }) {
  
  const handleQuestionImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }
    
    onChange({ question_image: file });
  };
  
  const handleOptionImageChange = (optionId, file) => {
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }
    
    const updatedOptions = question.options.map(opt =>
      opt.id === optionId ? { ...opt, option_image: file } : opt
    );
    onChange({ options: updatedOptions });
  };
  
  const addOption = () => {
    const newOption = {
      id: Date.now(),
      option_text: '',
      option_order: question.options.length + 1,
      option_image: null
    };
    onChange({ options: [...question.options, newOption] });
  };
  
  const removeOption = (optionId) => {
    if (question.options.length <= 2) {
      toast.error('At least 2 options are required');
      return;
    }
    const updatedOptions = question.options
      .filter(opt => opt.id !== optionId)
      .map((opt, index) => ({ ...opt, option_order: index + 1 }));
    onChange({ options: updatedOptions });
  };
  
  const updateOption = (optionId, field, value) => {
    const updatedOptions = question.options.map(opt =>
      opt.id === optionId ? { ...opt, [field]: value } : opt
    );
    onChange({ options: updatedOptions });
  };
  
  return (
    <div className="space-y-4">
      {/* Question Type */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Question Type
        </label>
        <select
          value={question.question_type}
          onChange={(e) => onChange({ question_type: e.target.value })}
          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="multiple_choice">Multiple Choice</option>
          <option value="open_text">Open Text</option>
          <option value="image_based">Image Based</option>
        </select>
      </div>
      
      {/* Question Text */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Question Text <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={question.question_text}
          onChange={(e) => onChange({ question_text: e.target.value })}
          placeholder="Enter your question..."
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      {/* Question Image (Optional) */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Question Image (Optional)
        </label>
        {!question.question_image ? (
          <label className="flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
            <FaUpload className="mr-2 text-gray-400" />
            <span className="text-gray-600">Click to upload image</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleQuestionImageChange}
              className="hidden"
            />
          </label>
        ) : (
          <div className="relative border-2 border-green-500 rounded-lg p-2 bg-green-50">
            <p className="text-sm text-gray-700">{question.question_image.name}</p>
            <button
              onClick={() => onChange({ question_image: null })}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
            >
              <FaTimes />
            </button>
          </div>
        )}
      </div>
      
      {/* Options (for multiple_choice and image_based) */}
      {(question.question_type === 'multiple_choice' || question.question_type === 'image_based') && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-semibold text-gray-700">
              Options <span className="text-red-500">*</span>
            </label>
            <button
              onClick={addOption}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              <FaPlus />
              Add Option
            </button>
          </div>
          
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <div key={option.id} className="flex items-start gap-2">
                <span className="text-sm font-semibold text-gray-500 mt-3">
                  {index + 1}.
                </span>
                
                <div className="flex-1">
                  <input
                    type="text"
                    value={option.option_text}
                    onChange={(e) => updateOption(option.id, 'option_text', e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  
                  {/* Option Image for image_based type */}
                  {question.question_type === 'image_based' && (
                    <div className="mt-2">
                      {!option.option_image ? (
                        <label className="flex items-center px-3 py-2 border-2 border-dashed border-gray-300 rounded cursor-pointer hover:border-blue-500 text-sm">
                          <FaImage className="mr-2 text-gray-400" />
                          <span className="text-gray-600">Upload image</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleOptionImageChange(option.id, e.target.files[0])}
                            className="hidden"
                          />
                        </label>
                      ) : (
                        <div className="relative border border-green-500 rounded p-2 bg-green-50">
                          <p className="text-xs text-gray-700">{option.option_image.name}</p>
                          <button
                            onClick={() => updateOption(option.id, 'option_image', null)}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 text-xs"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => removeOption(option.id)}
                  className="mt-2 p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition"
                  title="Remove Option"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Question Settings */}
      <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={question.is_required}
            onChange={(e) => onChange({ is_required: e.target.checked })}
            className="w-5 h-5 text-blue-600"
          />
          <span className="text-sm font-medium text-gray-700">Required Question</span>
        </label>
        
        {question.question_type === 'multiple_choice' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Selections Allowed
            </label>
            <input
              type="number"
              min="1"
              max={question.options.length}
              value={question.max_selections}
              onChange={(e) => onChange({ max_selections: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </div>
      
      {/* Info for Open Text */}
      {question.question_type === 'open_text' && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Open Text Question:</strong> Voters will be able to type their answer in a text box.
          </p>
        </div>
      )}
    </div>
  );
}