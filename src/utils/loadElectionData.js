import { 
  setMyElections, 
  setPublicElections,
  setSelectedElectionDetails,
  setCurrentElection,
  setLoading,
  setError 
} from '../redux/slices/electionSlice';

import { getAllElections, getElection } from '../redux/api/election/electionApi';

/**
 * Load user's elections with COMPLETE data into Redux
 * This stores ALL fields: regional_pricing, questions, lottery_config, etc.
 */
export const loadElectionData = async (dispatch) => {
  try {
    console.log('📊 [loadElectionData] Loading elections with complete data...');
    dispatch(setLoading(true));
    
    // Fetch ALL elections with complete data
    const response = await getAllElections(1, 100, 'all');
    
    console.log('📊 [loadElectionData] Raw API Response:', response);
    
    // Handle different response formats
    const allElections = response.data?.elections || response.elections || [];
    
    console.log('✅ [loadElectionData] Elections loaded:', {
      count: allElections.length,
      firstElection: allElections[0] ? {
        id: allElections[0].id,
        title: allElections[0].title,
        hasRegionalPricing: !!allElections[0].regional_pricing,
        regionalPricingCount: allElections[0].regional_pricing?.length || 0,
        hasQuestions: !!allElections[0].questions,
        questionsCount: allElections[0].questions?.length || 0,
        hasLottery: !!allElections[0].lottery_config,
        allFields: Object.keys(allElections[0])
      } : null
    });
    
    // Dispatch COMPLETE election objects to Redux
    dispatch(setMyElections(allElections));
    
    console.log('✅ [loadElectionData] Dispatched to Redux');
    
    return allElections;
  } catch (error) {
    console.error('❌ [loadElectionData] Failed:', error);
    dispatch(setError(error.message || 'Failed to load elections'));
    return [];
  } finally {
    dispatch(setLoading(false));
  }
};

/**
 * Load public elections with complete data
 */
export const loadPublicElections = async (dispatch) => {
  try {
    console.log('🌍 [loadPublicElections] Loading public elections...');
    dispatch(setLoading(true));
    
    const response = await getAllElections(1, 100, 'public');
    const publicElections = response.data?.elections || response.elections || [];
    
    console.log('✅ [loadPublicElections] Loaded:', publicElections.length);
    dispatch(setPublicElections(publicElections));
    
    return publicElections;
  } catch (error) {
    console.error('❌ [loadPublicElections] Failed:', error);
    dispatch(setError(error.message || 'Failed to load public elections'));
    return [];
  } finally {
    dispatch(setLoading(false));
  }
};

/**
 * Load specific election with COMPLETE data
 * Stores in both selectedElectionDetails AND currentElection
 */
export const loadSpecificElection = async (electionId, dispatch) => {
  try {
    console.log(`📋 [loadSpecificElection] Loading election ${electionId}...`);
    dispatch(setLoading(true));
    
    // Fetch complete election details
    const electionResponse = await getElection(electionId);
    
    // Handle different response formats
    const electionData = electionResponse.data?.election || 
                        electionResponse.data || 
                        electionResponse.election || 
                        electionResponse;
    
    console.log('✅ [loadSpecificElection] Election loaded:', {
      id: electionData.id,
      title: electionData.title,
      hasRegionalPricing: !!electionData.regional_pricing,
      regionalPricingCount: electionData.regional_pricing?.length || 0,
      hasQuestions: !!electionData.questions,
      questionsCount: electionData.questions?.length || 0,
      hasLottery: !!electionData.lottery_config,
      allFields: Object.keys(electionData)
    });
    
    // Store in selectedElectionDetails (for viewing)
    dispatch(setSelectedElectionDetails(electionData));
    
    // ALSO store in currentElection (for editing/viewing)
    dispatch(setCurrentElection({
      ...electionData,
      currentStep: 4,
      completedSteps: [1, 2, 3, 4],
    }));
    
    return electionData;
  } catch (error) {
    console.error('❌ [loadSpecificElection] Failed:', error);
    dispatch(setError(error.message || 'Failed to load election'));
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};

/**
 * Refresh elections after create/update/delete
 */
export const refreshElectionData = async (dispatch) => {
  console.log('🔄 [refreshElectionData] Refreshing...');
  await loadElectionData(dispatch);
  console.log('✅ [refreshElectionData] Refreshed');
};