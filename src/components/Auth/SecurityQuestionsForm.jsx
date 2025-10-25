import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  useGetSecurityQuestionsQuery,
  useSetSecurityQuestionsMutation,
} from '../../redux/api/auth/securityQuestionsApi';
import { setSecurityQuestionsAnswered, setSuccess, setError, setSessionFlags } from '../../redux/slices/authSlice';
import ErrorAlert from '../Common/ErrorAlert';
import SuccessAlert from '../Common/SuccessAlert';
import Loading from '../Common/Loading';
import { useAuth } from '../../redux/hooks';

export default function SecurityQuestionsForm({ sessionId, onNext }) {
  const dispatch = useDispatch();
  const auth = useAuth();
  const [answers, setAnswers] = useState({});

  const { data, isLoading: isLoadingQuestions } = useGetSecurityQuestionsQuery();
  const [setSecurityQuestions, { isLoading: isSaving }] = useSetSecurityQuestionsMutation();

  const questions = data?.data?.questions || [];

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (questions.length === 0) {
    dispatch(setError('No questions available'));
    return;
  }

  const unanswered = questions.filter(q => !answers[q.id]);
  if (unanswered.length > 0) {
    dispatch(setError(`Please answer all ${questions.length} questions`));
    return;
  }

  const answersList = questions.map(q => ({
    questionId: q.id,
    answer: answers[q.id],
  }));

  try {
    console.log('📤 Submitting security questions:', {
      sessionId,
      answersCount: answersList.length,
      answers: answersList,
    });

    const result = await setSecurityQuestions({ 
      sessionId, 
      answers: answersList 
    }).unwrap();

    console.log('✅ Full API response:', result);
    console.log('Response data:', result.data);
    console.log('Response sessionFlags:', result.sessionFlags);

    // Try both response structures
    const sessionFlags = result.sessionFlags || result.data?.sessionFlags;
    
    if (sessionFlags) {
      console.log('Updating session flags:', sessionFlags);
      dispatch(setSessionFlags(sessionFlags));
    } else {
      console.warn('No sessionFlags in response');
    }

    dispatch(setSecurityQuestionsAnswered());
    dispatch(setSuccess('Security questions saved successfully'));
    
    console.log('✅ Calling onNext()');
    onNext();
  } catch (error) {
    console.error('❌ Full error object:', error);
    console.error('Error data:', error.data);
    console.error('Error message:', error.message);
    
    const errorMessage = error.data?.message || error.message || 'Failed to set security questions';
    console.error('Final error message:', errorMessage);
    dispatch(setError(errorMessage));
  }
};

// const handleSubmit = async (e) => {
//   e.preventDefault();

//   const answersList = questions.map(q => ({
//     questionId: q.id,
//     answer: answers[q.id],
//   }));

//   try {
//     const result = await setSecurityQuestions({ 
//       sessionId, 
//       answers: answersList 
//     }).unwrap();

//     // Update Redux with returned session flags
//     dispatch(setSessionFlags(result.sessionFlags));
//     dispatch(setSecurityQuestionsAnswered());
//     dispatch(setSuccess('Security questions saved successfully'));
//     onNext();
//   } catch (error) {
//     const errorMessage = error.data?.message || 'Failed to set security questions';
//     dispatch(setError(errorMessage));
//   }
// };

  if (isLoadingQuestions) {
    return <Loading />;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-2 text-center">Security Questions</h2>
      <p className="text-center text-gray-600 mb-6">
        Answer security questions to protect your account
      </p>

      {auth.error && <ErrorAlert message={auth.error} />}
      {auth.successMessage && <SuccessAlert message={auth.successMessage} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        {questions.map((question) => (
          <div key={question.id}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {question.question_text}
            </label>
            <input
              type="text"
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              placeholder="Your answer"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Category: {question.category}
            </p>
          </div>
        ))}

        <button
          type="submit"
          disabled={isSaving}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isSaving ? <Loading /> : 'Complete Setup'}
        </button>
      </form>
    </div>
  );
}







// import React, { useState } from 'react';
// import { useDispatch } from 'react-redux';
// import {
//   useGetSecurityQuestionsQuery,
//   useSetSecurityQuestionsMutation,
// } from '../../redux/api/auth/securityQuestionsApi';
// import { setSecurityQuestionsAnswered, setSuccess, setError } from '../../redux/slices/authSlice';
// import ErrorAlert from '../Common/ErrorAlert';
// import SuccessAlert from '../Common/SuccessAlert';
// import Loading from '../Common/Loading';
// import { useAuth } from '../../redux/hooks';

// export default function SecurityQuestionsForm({ sessionId, onNext }) {
//   const dispatch = useDispatch();
//   const auth = useAuth();
//   const [answers, setAnswers] = useState({});

//   const { data, isLoading: isLoadingQuestions } = useGetSecurityQuestionsQuery();
//   const [setSecurityQuestions, { isLoading: isSaving }] = useSetSecurityQuestionsMutation();

//   const questions = data?.data?.questions || [];

//   const handleAnswerChange = (questionId, value) => {
//     setAnswers(prev => ({ ...prev, [questionId]: value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const answersList = questions.map(q => ({
//       questionId: q.id,
//       answer: answers[q.id],
//     }));

//     try {
//       await setSecurityQuestions({ sessionId, answers: answersList }).unwrap();
//       dispatch(setSecurityQuestionsAnswered());
//       dispatch(setSuccess('Security questions set successfully'));
//       onNext();
//     } catch (error) {
//       const errorMessage = error.data?.message || 'Failed to set security questions';
//       dispatch(setError(errorMessage));
//     }
//   };

//   if (isLoadingQuestions) {
//     return <Loading />;
//   }

//   return (
//     <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
//       <h2 className="text-2xl font-bold mb-2 text-center">Security Questions</h2>
//       <p className="text-center text-gray-600 mb-6">
//         Answer security questions to protect your account
//       </p>

//       {auth.error && <ErrorAlert message={auth.error} />}
//       {auth.successMessage && <SuccessAlert message={auth.successMessage} />}

//       <form onSubmit={handleSubmit} className="space-y-6">
//         {questions.map((question) => (
//           <div key={question.id}>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               {question.question_text}
//             </label>
//             <input
//               type="text"
//               value={answers[question.id] || ''}
//               onChange={(e) => handleAnswerChange(question.id, e.target.value)}
//               placeholder="Your answer"
//               required
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//             <p className="text-xs text-gray-500 mt-1">
//               Category: {question.category}
//             </p>
//           </div>
//         ))}

//         <button
//           type="submit"
//           disabled={isSaving}
//           className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
//         >
//           {isSaving ? <Loading /> : 'Complete Setup'}
//         </button>
//       </form>
//     </div>
//   );
// }
