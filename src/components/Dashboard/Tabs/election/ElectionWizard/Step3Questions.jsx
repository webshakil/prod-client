import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  FaVoteYea,
  FaQuestionCircle,
  FaImage,
  FaFont,
  FaBalanceScale,
  FaPlus,
  FaTrash,
  FaCheckCircle,
  FaInfoCircle,
  FaArrowUp,
  FaArrowDown,
  FaLink,
  FaShare,
  FaCopy,
  FaKey,
  FaEnvelope,
  FaLock,
  FaFingerprint,
  FaGoogle,
  FaShieldAlt
} from 'react-icons/fa';

// Authentication methods
const AUTH_METHODS = [
  {
    id: 'passkey',
    name: 'Passkey Authentication',
    icon: <FaFingerprint />,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    color: 'blue',
    badge: 'Recommended',
    badgeColor: 'green',
    security: 'High',
    securityColor: 'green',
    description: 'Modern, secure authentication using device credentials',
    features: ['Device-based', 'No passwords', 'Phishing resistant']
  },
  {
    id: 'oauth',
    name: 'OAuth (Social Login)',
    icon: <FaGoogle />,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    color: 'purple',
    security: 'Medium',
    securityColor: 'yellow',
    description: 'Login with Google, Facebook, Twitter, LinkedIn',
    features: ['Quick signup', 'Trusted providers', 'Wide adoption']
  },
  {
    id: 'magic_link',
    name: 'Magic Link',
    icon: <FaEnvelope />,
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    color: 'orange',
    security: 'Medium',
    securityColor: 'yellow',
    description: 'Passwordless login via email link',
    features: ['No passwords', 'Email-based', 'Simple UX']
  },
  {
    id: 'email_password',
    name: 'Email & Password',
    icon: <FaLock />,
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-600',
    color: 'gray',
    security: 'Medium',
    securityColor: 'yellow',
    description: 'Traditional username/password with 2FA/OTP',
    features: ['Familiar', '2FA support', 'OTP verification']
  }
];

// Voting methods
const VOTING_METHODS = [
  {
    id: 'plurality',
    name: 'Plurality Voting',
    icon: '🗳️',
    color: 'blue',
    description: 'Single candidate selection - most votes wins',
    details: 'Voters select one candidate. Candidate with most votes wins.',
    benefits: ['Simple and intuitive', 'Quick vote counting', 'Clear winners', 'Traditional democratic voting']
  },
  {
    id: 'ranked_choice',
    name: 'Ranked Choice Voting',
    icon: '📊',
    color: 'purple',
    description: 'Preference ranking with elimination rounds',
    details: 'Voters rank candidates by preference. Elimination rounds until majority.',
    benefits: ['Eliminates spoiler effect', 'Ensures majority winner', 'More representative results', 'Encourages broader appeal']
  },
  {
    id: 'approval',
    name: 'Approval Voting',
    icon: '✅',
    color: 'green',
    description: 'Multiple candidate approval selection',
    details: 'Voters approve multiple candidates they support.',
    benefits: ['Reduces strategic voting', 'Simple ballot design', 'Encourages moderate candidates', 'Express broader preferences']
  }
];

// Question types
const QUESTION_TYPES = [
  {
    id: 'mcq',
    name: 'Multiple Choice',
    icon: <FaQuestionCircle />,
    color: 'blue',
    description: 'Choose from predefined options',
    requiresAnswers: true,
    minAnswers: 2,
    maxAnswers: 100
  },
  {
    id: 'text',
    name: 'Open-Ended Text',
    icon: <FaFont />,
    color: 'green',
    description: 'Free text response',
    requiresAnswers: false,
    minChars: 1,
    maxChars: 5000
  },
  {
    id: 'image',
    name: 'Image-Based',
    icon: <FaImage />,
    color: 'purple',
    description: 'Select from images',
    requiresAnswers: true,
    minAnswers: 2,
    maxAnswers: 50
  },
  {
    id: 'comparison',
    name: 'Comparison',
    icon: <FaBalanceScale />,
    color: 'orange',
    description: 'Compare items pairwise',
    requiresAnswers: true,
    minAnswers: 2,
    maxAnswers: 20
  }
];

// Generate slug from title
const generateSlug = (title) => {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50);
  
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${slug}-${randomSuffix}`;
};

export default function Step3QuestionsVoting({ data, updateData, onNext, onBack, electionTitle }) {
  const [errors, setErrors] = useState({});
  const [selectedAuthMethod, setSelectedAuthMethod] = useState(data.auth_method || '');
  const [selectedVotingMethod, setSelectedVotingMethod] = useState(data.voting_type || '');
  const [questions, setQuestions] = useState(data.questions || []);
  const [electionSlug, setElectionSlug] = useState(data.election_slug || '');
  const [showSlugGenerator, setShowSlugGenerator] = useState(false);

  // Generate slug on mount if not exists
  useEffect(() => {
    if (!electionSlug && electionTitle) {
      const newSlug = generateSlug(electionTitle);
      setElectionSlug(newSlug);
      updateData({ election_slug: newSlug });
    }
  }, [electionTitle]);

  const handleAuthMethodSelect = (methodId) => {
    setSelectedAuthMethod(methodId);
    updateData({ auth_method: methodId });
  };

  // Keyboard handler for auth method selection
  const handleAuthMethodKeyPress = (e, methodId) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleAuthMethodSelect(methodId);
    }
  };

  const handleVotingMethodSelect = (methodId) => {
    setSelectedVotingMethod(methodId);
    updateData({ voting_type: methodId });
  };

  // Keyboard handler for voting method selection
  const handleVotingMethodKeyPress = (e, methodId) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleVotingMethodSelect(methodId);
    }
  };

  const addQuestion = (type) => {
    const newQuestion = {
      id: Date.now(),
      type: type,
      question_text: '',
      required: true,
      answers: type === 'text' ? [] : ['', ''],
      images: type === 'image' ? [null, null] : []
    };
    
    const updatedQuestions = [...questions, newQuestion];
    setQuestions(updatedQuestions);
    updateData({ questions: updatedQuestions });
  };

  // Keyboard handler for adding questions
  const handleAddQuestionKeyPress = (e, type) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      addQuestion(type);
    }
  };

  const updateQuestion = (questionId, field, value) => {
    const updatedQuestions = questions.map(q => 
      q.id === questionId ? { ...q, [field]: value } : q
    );
    setQuestions(updatedQuestions);
    updateData({ questions: updatedQuestions });
  };

  const deleteQuestion = (questionId) => {
    const updatedQuestions = questions.filter(q => q.id !== questionId);
    setQuestions(updatedQuestions);
    updateData({ questions: updatedQuestions });
    toast.success('Question deleted');
  };

  const moveQuestion = (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= questions.length) return;
    
    const updatedQuestions = [...questions];
    [updatedQuestions[index], updatedQuestions[newIndex]] = [updatedQuestions[newIndex], updatedQuestions[index]];
    setQuestions(updatedQuestions);
    updateData({ questions: updatedQuestions });
  };

  const addAnswer = (questionId) => {
    const updatedQuestions = questions.map(q => {
      if (q.id === questionId) {
        if (q.type === 'image') {
          return { ...q, answers: [...q.answers, ''], images: [...q.images, null] };
        }
        return { ...q, answers: [...q.answers, ''] };
      }
      return q;
    });
    setQuestions(updatedQuestions);
    updateData({ questions: updatedQuestions });
  };

  const updateAnswer = (questionId, answerIndex, value) => {
    const updatedQuestions = questions.map(q => {
      if (q.id === questionId) {
        const newAnswers = [...q.answers];
        newAnswers[answerIndex] = value;
        return { ...q, answers: newAnswers };
      }
      return q;
    });
    setQuestions(updatedQuestions);
    updateData({ questions: updatedQuestions });
  };

  const deleteAnswer = (questionId, answerIndex) => {
    const updatedQuestions = questions.map(q => {
      if (q.id === questionId) {
        const newAnswers = q.answers.filter((_, i) => i !== answerIndex);
        const newImages = q.type === 'image' ? q.images.filter((_, i) => i !== answerIndex) : q.images;
        return { ...q, answers: newAnswers, images: newImages };
      }
      return q;
    });
    setQuestions(updatedQuestions);
    updateData({ questions: updatedQuestions });
  };

  const handleImageUpload = (questionId, answerIndex, file) => {
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    const updatedQuestions = questions.map(q => {
      if (q.id === questionId) {
        const newImages = [...q.images];
        newImages[answerIndex] = file;
        return { ...q, images: newImages };
      }
      return q;
    });
    setQuestions(updatedQuestions);
    updateData({ questions: updatedQuestions });
    toast.success('Image uploaded');
  };

  const regenerateSlug = () => {
    const newSlug = generateSlug(electionTitle || 'election');
    setElectionSlug(newSlug);
    updateData({ election_slug: newSlug });
    toast.success('New slug generated!');
  };

  const copySlugToClipboard = () => {
    const fullUrl = `https://prod-client-omega.vercel.app/vote/${electionSlug}`;
    navigator.clipboard.writeText(fullUrl);
    toast.success('Link copied to clipboard!');
  };

  const validateStep = () => {
    const newErrors = {};

    if (!selectedAuthMethod) {
      newErrors.auth_method = 'Please select an authentication method';
    }

    if (!selectedVotingMethod) {
      newErrors.voting_type = 'Please select a voting method';
    }

    if (questions.length === 0) {
      newErrors.questions = 'Please add at least one question';
    }
/*eslint-disable*/
    questions.forEach((q, index) => {
      if (!q.question_text.trim()) {
        newErrors[`question_${q.id}_text`] = 'Question text is required';
      }

      const questionType = QUESTION_TYPES.find(t => t.id === q.type);
      
      if (questionType.requiresAnswers) {
        const validAnswers = q.answers.filter(a => a && a.trim());
        
        if (validAnswers.length < questionType.minAnswers) {
          newErrors[`question_${q.id}_answers`] = `At least ${questionType.minAnswers} answers required`;
        }

        if (q.type === 'image') {
          const validImages = q.images.filter(img => img !== null);
          if (validImages.length < questionType.minAnswers) {
            newErrors[`question_${q.id}_images`] = `At least ${questionType.minAnswers} images required`;
          }
        }
      }
    });

    if (!electionSlug || !electionSlug.trim()) {
      newErrors.election_slug = 'Election slug is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (!validateStep()) {
      toast.error('Please fix all errors before continuing');
      return;
    }
    onNext();
  };

  const getVotingInstructions = (questionType) => {
    if (!selectedVotingMethod) return '';
    
    const instructions = {
      plurality: {
        mcq: 'Voters will select ONE option',
        text: 'Voters will type their response',
        image: 'Voters will click ONE image',
        comparison: 'Voters will pick winners in each pair'
      },
      ranked_choice: {
        mcq: 'Voters will RANK ALL options (1st, 2nd, 3rd...)',
        text: 'Voters will type their response',
        image: 'Voters will RANK ALL images by preference',
        comparison: 'Voters will RANK ALL items'
      },
      approval: {
        mcq: 'Voters will select MULTIPLE options they approve',
        text: 'Voters will type their response',
        image: 'Voters will click MULTIPLE images they approve',
        comparison: 'Voters will approve MULTIPLE items'
      }
    };

    return instructions[selectedVotingMethod]?.[questionType] || '';
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border-2 border-indigo-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <span className="text-3xl">🗳️</span>
          Questions & Voting Configuration
        </h2>
        <p className="text-gray-600">
          Configure authentication, voting method, and create questions for your election
        </p>
      </div>

      {/* Primary Authentication Method */}
      <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <FaShieldAlt className="text-indigo-600" />
            Primary Authentication Method
          </h3>
          <p className="text-sm text-gray-600">
            Choose the default authentication method for your election.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {AUTH_METHODS.map((method) => (
            <div
              key={method.id}
              role="button"
              tabIndex={0}
              onClick={() => handleAuthMethodSelect(method.id)}
              onKeyDown={(e) => handleAuthMethodKeyPress(e, method.id)}
              className={`relative p-5 rounded-xl border-2 transition-all cursor-pointer focus:outline-none focus:ring-4 ${
                selectedAuthMethod === method.id
                  ? `border-${method.color}-500 bg-${method.color}-50 shadow-lg ring-4 ring-${method.color}-200`
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md focus:ring-gray-300'
              }`}
            >
              {/* Selected Checkmark */}
              {selectedAuthMethod === method.id && (
                <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1.5 shadow-lg">
                  <FaCheckCircle className="text-lg" />
                </div>
              )}

              {/* Header with Icon and Title */}
              <div className="flex items-start gap-3 mb-3">
                <div className={`${method.iconBg} ${method.iconColor} p-3 rounded-lg text-2xl flex-shrink-0`}>
                  {method.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h4 className="font-bold text-lg text-gray-900">
                      {method.name}
                    </h4>
                    {method.badge && (
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                        method.badgeColor === 'green' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {method.badge}
                      </span>
                    )}
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                      method.securityColor === 'green' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {method.security}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {method.description}
                  </p>
                </div>
              </div>

              {/* Features */}
              <div className="mt-4 pt-3 border-t border-gray-200">
                <p className="text-xs font-semibold text-gray-500 mb-2">Features:</p>
                <div className="flex flex-wrap gap-2">
                  {method.features.map((feature, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-md"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {errors.auth_method && (
          <p className="text-red-500 text-sm mt-3 flex items-center gap-2">
            <FaInfoCircle /> {errors.auth_method}
          </p>
        )}
      </div>

      {/* Voting Method Selection */}
      <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FaVoteYea className="text-blue-600" />
            Choose Voting Method *
          </h3>
          <FaInfoCircle className="text-gray-400 text-xl cursor-help" title="Select how voters will cast their votes" />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {VOTING_METHODS.map((method) => (
            <div
              key={method.id}
              role="button"
              tabIndex={0}
              onClick={() => handleVotingMethodSelect(method.id)}
              onKeyDown={(e) => handleVotingMethodKeyPress(e, method.id)}
              className={`p-6 rounded-xl border-3 transition-all transform hover:scale-105 text-left relative cursor-pointer focus:outline-none focus:ring-4 ${
                selectedVotingMethod === method.id
                  ? `border-${method.color}-500 bg-${method.color}-50 shadow-xl ring-4 ring-${method.color}-200`
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-lg focus:ring-blue-300'
              }`}
            >
              {selectedVotingMethod === method.id && (
                <div className="absolute -top-3 -right-3 bg-green-500 text-white rounded-full p-2">
                  <FaCheckCircle className="text-xl" />
                </div>
              )}
              
              <div className="text-5xl mb-4">{method.icon}</div>
              <h4 className={`font-bold text-lg mb-2 ${
                selectedVotingMethod === method.id ? `text-${method.color}-700` : 'text-gray-800'
              }`}>
                {method.name}
              </h4>
              <p className="text-sm text-gray-600 mb-3">{method.description}</p>
              <p className="text-xs text-gray-500 italic">{method.details}</p>
            </div>
          ))}
        </div>

        {/* Selected Method Benefits */}
        {selectedVotingMethod && (
          <div className="mt-6 p-5 bg-blue-50 border-2 border-blue-200 rounded-xl">
            <h4 className="font-bold text-blue-900 mb-3 text-lg">
              Benefits of {VOTING_METHODS.find(m => m.id === selectedVotingMethod)?.name}:
            </h4>
            <ul className="grid md:grid-cols-2 gap-2">
              {VOTING_METHODS.find(m => m.id === selectedVotingMethod)?.benefits.map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-blue-800">
                  <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {errors.voting_type && (
          <p className="text-red-500 text-sm mt-3 flex items-center gap-2">
            <FaInfoCircle /> {errors.voting_type}
          </p>
        )}
      </div>

      {/* Add Question Buttons */}
      {selectedVotingMethod && (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-md p-6 border-2 border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaPlus className="text-green-600" />
            Add Questions
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {QUESTION_TYPES.map((type) => (
              <div
                key={type.id}
                role="button"
                tabIndex={0}
                onClick={() => addQuestion(type.id)}
                onKeyDown={(e) => handleAddQuestionKeyPress(e, type.id)}
                className={`p-5 rounded-xl border-2 border-dashed border-${type.color}-300 bg-white hover:bg-${type.color}-50 hover:border-${type.color}-500 transition-all transform hover:scale-105 group cursor-pointer focus:outline-none focus:ring-4 focus:ring-${type.color}-300`}
              >
                <div className={`text-3xl text-${type.color}-600 mb-3 group-hover:scale-110 transition-transform`}>
                  {type.icon}
                </div>
                <h4 className="font-bold text-gray-800 mb-1">{type.name}</h4>
                <p className="text-xs text-gray-600">{type.description}</p>
              </div>
            ))}
          </div>

          {errors.questions && (
            <p className="text-red-500 text-sm mt-3 flex items-center gap-2">
              <FaInfoCircle /> {errors.questions}
            </p>
          )}
        </div>
      )}

      {/* Questions List */}
      {questions.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FaQuestionCircle className="text-indigo-600" />
            Your Questions ({questions.length})
          </h3>

          {questions.map((question, index) => {
            const questionType = QUESTION_TYPES.find(t => t.id === question.type);
            const votingInstructions = getVotingInstructions(question.type);
            
            return (
              <div key={question.id} className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100">
                {/* Question Header */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b-2 border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className={`text-2xl text-${questionType.color}-600`}>
                      {questionType.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-gray-800">
                        Question {index + 1}: {questionType.name}
                      </h4>
                      <p className="text-sm text-gray-500">{votingInstructions}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {index > 0 && (
                      <button
                        onClick={() => moveQuestion(index, 'up')}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                        title="Move up"
                        aria-label="Move question up"
                      >
                        <FaArrowUp />
                      </button>
                    )}
                    {index < questions.length - 1 && (
                      <button
                        onClick={() => moveQuestion(index, 'down')}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                        title="Move down"
                        aria-label="Move question down"
                      >
                        <FaArrowDown />
                      </button>
                    )}
                    <button
                      onClick={() => deleteQuestion(question.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
                      title="Delete question"
                      aria-label="Delete question"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                {/* Question Text */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Question Text *
                  </label>
                  <textarea
                    value={question.question_text}
                    onChange={(e) => updateQuestion(question.id, 'question_text', e.target.value)}
                    placeholder="Enter your question here..."
                    rows={3}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-${questionType.color}-500 focus:border-${questionType.color}-500 focus:outline-none resize-none text-base ${
                      errors[`question_${question.id}_text`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors[`question_${question.id}_text`] && (
                    <p className="text-red-500 text-sm mt-1">{errors[`question_${question.id}_text`]}</p>
                  )}
                </div>

                {/* Answers Section */}
                {questionType.requiresAnswers && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-bold text-gray-700">
                        Answer Options * (Min: {questionType.minAnswers}, Max: {questionType.maxAnswers})
                      </label>
                      {question.answers.length < questionType.maxAnswers && (
                        <button
                          onClick={() => addAnswer(question.id)}
                          className={`px-4 py-2 bg-${questionType.color}-600 text-white rounded-lg font-semibold hover:bg-${questionType.color}-700 transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-${questionType.color}-400`}
                        >
                          <FaPlus /> Add Option
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      {question.answers.map((answer, answerIndex) => (
                        <div key={answerIndex} className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-700">
                            {answerIndex + 1}
                          </div>
                          
                          {question.type === 'image' ? (
                            <div className="flex-1 grid grid-cols-2 gap-3">
                              <div>
                                <input
                                  type="text"
                                  value={answer}
                                  onChange={(e) => updateAnswer(question.id, answerIndex, e.target.value)}
                                  placeholder="Image label/caption"
                                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none text-base"
                                />
                              </div>
                              <div>
                                <label className="flex items-center justify-center w-full h-full border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-all focus-within:ring-2 focus-within:ring-purple-400">
                                  {question.images[answerIndex] ? (
                                    <div className="text-sm text-green-600 font-semibold">
                                      ✓ {question.images[answerIndex].name}
                                    </div>
                                  ) : (
                                    <div className="text-sm text-gray-500 flex items-center gap-2">
                                      <FaImage /> Upload Image
                                    </div>
                                  )}
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageUpload(question.id, answerIndex, e.target.files[0])}
                                    className="hidden"
                                  />
                                </label>
                              </div>
                            </div>
                          ) : (
                            <input
                              type="text"
                              value={answer}
                              onChange={(e) => updateAnswer(question.id, answerIndex, e.target.value)}
                              placeholder={`Option ${answerIndex + 1}`}
                              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-base"
                            />
                          )}
                          
                          {question.answers.length > questionType.minAnswers && (
                            <button
                              onClick={() => deleteAnswer(question.id, answerIndex)}
                              className="flex-shrink-0 p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
                              aria-label="Delete answer option"
                            >
                              <FaTrash />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {errors[`question_${question.id}_answers`] && (
                      <p className="text-red-500 text-sm mt-2">{errors[`question_${question.id}_answers`]}</p>
                    )}
                    {errors[`question_${question.id}_images`] && (
                      <p className="text-red-500 text-sm mt-2">{errors[`question_${question.id}_images`]}</p>
                    )}
                  </div>
                )}

                {/* Text Question Info */}
                {question.type === 'text' && (
                  <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      <FaInfoCircle className="inline mr-2" />
                      Voters can type responses between 1-5000 characters. No predefined answers needed.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Shareable Slug Section */}
      {selectedVotingMethod && questions.length > 0 && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg p-6 border-2 border-green-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FaLink className="text-green-600" />
              Shareable Election Link *
            </h3>
            <button
              onClick={() => setShowSlugGenerator(!showSlugGenerator)}
              className="text-sm text-blue-600 hover:text-blue-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-2 py-1"
            >
              {showSlugGenerator ? 'Hide Options' : 'Customize Link'}
            </button>
          </div>

          <div className="space-y-4">
            {/* Display URL */}
            <div className="flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-green-300">
              <FaLink className="text-green-600 text-xl flex-shrink-0" />
              <div className="flex-1 overflow-hidden">
                <p className="text-xs text-gray-500 mb-1">Your Election URL:</p>
                <p className="text-base font-mono text-gray-800 break-all">
                  https://prod-client-omega.vercel.app/vote/<span className="font-bold text-green-600">{electionSlug}</span>
                </p>
              </div>
              <button
                onClick={copySlugToClipboard}
                className="flex-shrink-0 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                <FaCopy /> Copy
              </button>
            </div>

            {/* Customize Options */}
            {showSlugGenerator && (
              <div className="p-4 bg-white rounded-xl border-2 border-gray-200">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Custom Slug *
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={electionSlug}
                    onChange={(e) => {
                      const sanitizedSlug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                      setElectionSlug(sanitizedSlug);
                      updateData({ election_slug: sanitizedSlug });
                    }}
                    placeholder="my-election-slug"
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none"
                  />
                  <button
                    onClick={regenerateSlug}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    Generate New
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Only lowercase letters, numbers, and hyphens allowed
                </p>
              </div>
            )}

            {/* Social Sharing */}
            {/* <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm font-semibold text-gray-700">Share on:</span>
              <button
                onClick={() => window.open(`https://twitter.com/intent/tweet?text=Vote in my election!&url=https://prod-client-omega.vercel.app/vote/${electionSlug}`, '_blank')}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <FaShare /> Twitter
              </button>
              <button
                onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=https://prod-client-omega.vercel.app/vote/${electionSlug}`, '_blank')}
                className="px-4 py-2 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <FaShare /> Facebook
              </button>
              <button
                onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=https://prod-client-omega.vercel.app/vote/${electionSlug}`, '_blank')}
                className="px-4 py-2 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-950 transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <FaShare /> LinkedIn
              </button>
            </div> */}

            <div className="flex items-center gap-3 flex-wrap">
  <span className="text-sm font-semibold text-gray-700">Share on:</span>

  <button
    onClick={() =>
      window.open(
        `https://twitter.com/intent/tweet?text=Vote in my election!&url=https://prod-client-omega.vercel.app/vote/${electionSlug}`,
        '_blank'
      )
    }
    className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
  >
    <FaShare /> Twitter
  </button>

  <button
    onClick={() =>
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=https://prod-client-omega.vercel.app/vote/${electionSlug}`,
        '_blank'
      )
    }
    className="px-4 py-2 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
  >
    <FaShare /> Facebook
  </button>

  <button
    onClick={() =>
      window.open(
        `https://www.linkedin.com/sharing/share-offsite/?url=https://prod-client-omega.vercel.app/vote/${electionSlug}`,
        '_blank'
      )
    }
    className="px-4 py-2 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-950 transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
  >
    <FaShare /> LinkedIn
  </button>

  <button
    onClick={() =>
      window.open(
        `https://api.whatsapp.com/send?text=Vote in my election!%20https://prod-client-omega.vercel.app/vote/${electionSlug}`,
        '_blank'
      )
    }
    className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-green-400"
  >
    <FaShare /> WhatsApp
  </button>

  <button
    onClick={() =>
      window.open(
        `https://t.me/share/url?url=https://prod-client-omega.vercel.app/vote/${electionSlug}&text=Vote in my election!`,
        '_blank'
      )
    }
    className="px-4 py-2 bg-sky-500 text-white rounded-lg font-semibold hover:bg-sky-600 transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
  >
    <FaShare /> Telegram
  </button>

  <button
    onClick={() =>
      window.open(
        `https://www.instagram.com/?url=https://prod-client-omega.vercel.app/vote/${electionSlug}`,
        '_blank'
      )
    }
    className="px-4 py-2 bg-pink-500 text-white rounded-lg font-semibold hover:bg-pink-600 transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
  >
    <FaShare /> Instagram
  </button>
</div>






          </div>

          {errors.election_slug && (
            <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
              <FaInfoCircle /> {errors.election_slug}
            </p>
          )}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t-2 border-gray-200">
        <button
          onClick={onBack}
          className="px-8 py-4 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all transform hover:scale-105 shadow-md text-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          ← Back
        </button>

        <button
          onClick={handleContinue}
          disabled={!selectedAuthMethod || !selectedVotingMethod || questions.length === 0}
          className={`px-10 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-xl flex items-center gap-3 focus:outline-none focus:ring-2 ${
            selectedAuthMethod && selectedVotingMethod && questions.length > 0
              ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white focus:ring-green-400'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Review & Publish
          <FaCheckCircle />
        </button>
      </div>
    </div>
  );
}
