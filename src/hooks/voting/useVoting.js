// src/hooks/voting/useVoting.js
// ✨ Main voting hook
import { useDispatch, useSelector } from 'react-redux';
import { 
  setAnswer, 
  setAllAnswers, 
  clearAnswer, 
  clearAllAnswers,
  setVoteSubmitted,
  setSubmitting,
  setError,
  clearError,
  setValidationErrors,
  clearValidationErrors,
} from '../../redux/slices/votingNewSlice';
import { useCastVoteMutation } from '../../redux/api/voting/votingApi';

export const useVoting = (electionId) => {
  const dispatch = useDispatch();
  const votingState = useSelector(state => state.votingNew);
  
  const [castVote, { isLoading: submitting }] = useCastVoteMutation();

  const setAnswerForQuestion = (questionId, answer) => {
    dispatch(setAnswer({ questionId, answer }));
    dispatch(clearValidationErrors());
  };

  const validateAnswers = () => {
    const errors = [];
    const { currentBallot, answers } = votingState;

    if (!currentBallot?.questions) {
      return { valid: false, errors: [{ message: 'No ballot loaded' }] };
    }

    currentBallot.questions.forEach(question => {
      if (question.is_required && !answers[question.id]) {
        errors.push({
          questionId: question.id,
          message: `This question is required`,
        });
      }

      // Validate based on voting type
      if (votingState.votingType === 'ranked_choice' && answers[question.id]) {
        const ranking = answers[question.id];
        if (!Array.isArray(ranking) || ranking.length === 0) {
          errors.push({
            questionId: question.id,
            message: 'Please rank at least one option',
          });
        }
      }

      if (votingState.votingType === 'approval' && answers[question.id]) {
        const selections = answers[question.id];
        if (!Array.isArray(selections) || selections.length === 0) {
          errors.push({
            questionId: question.id,
            message: 'Please select at least one option',
          });
        }
      }
    });

    dispatch(setValidationErrors(errors));
    return { valid: errors.length === 0, errors };
  };

  const submitVote = async () => {
    try {
      dispatch(setSubmitting(true));
      dispatch(clearError());

      // Validate
      const validation = validateAnswers();
      if (!validation.valid) {
        dispatch(setSubmitting(false));
        return { success: false, errors: validation.errors };
      }

      // Submit vote
      const result = await castVote({
        electionId,
        answers: votingState.answers,
      }).unwrap();

      // Update state
      dispatch(setVoteSubmitted({
        votingId: result.votingId,
        voteHash: result.voteHash,
        receiptId: result.receiptId,
        verificationCode: result.verificationCode,
      }));

      // Dispatch custom event for lottery
      window.dispatchEvent(new CustomEvent('vote-cast', {
        detail: { electionId },
      }));

      return { success: true, data: result };
    } catch (error) {
      console.error('Vote submission error:', error);
      dispatch(setError(error.data?.error || 'Failed to submit vote'));
      dispatch(setSubmitting(false));
      return { success: false, error: error.data?.error || 'Failed to submit vote' };
    }
  };

  return {
    ...votingState,
    setAnswer: setAnswerForQuestion,
    setAllAnswers: (answers) => dispatch(setAllAnswers(answers)),
    clearAnswer: (questionId) => dispatch(clearAnswer(questionId)),
    clearAllAnswers: () => dispatch(clearAllAnswers()),
    validateAnswers,
    submitVote,
    submitting,
  };
};