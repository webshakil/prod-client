// src/utils/loadElectionData.js
import { 
  setMyElections,
  setPublicElections,
  setDrafts,
  setCurrentElection,
  setLoading,
  setError
} from '../redux/slices/electionSlice';

// Import your existing API functions
import { 
  getMyElections, 
  getPublicElections, 
  getMyDrafts,
  getElection 
} from '../redux/api/election/electionApi';

// Main loader function - loads all election data globally
export const loadElectionData = async (dispatch) => {
  try {
    console.log('🔄 Loading election data globally...');
    dispatch(setLoading(true));

    // 1. Load my elections
    try {
      const myElectionsResponse = await getMyElections(1, 100, 'all'); // Load first 100 elections, all statuses
      
      if (myElectionsResponse.success && myElectionsResponse.data) {
        const elections = myElectionsResponse.data.elections || myElectionsResponse.data;
        dispatch(setMyElections(Array.isArray(elections) ? elections : []));
        console.log('✅ My elections loaded:', elections.length);
      } else {
        dispatch(setMyElections([]));
      }
    } catch (error) {
      console.log('⚠️ Could not load my elections:', error.message);
      dispatch(setMyElections([]));
    }

    // 2. Load public elections
    try {
      const publicElectionsResponse = await getPublicElections(1, 50); // Load first 50 public elections
      
      if (publicElectionsResponse.success && publicElectionsResponse.data) {
        const elections = publicElectionsResponse.data.elections || publicElectionsResponse.data;
        dispatch(setPublicElections(Array.isArray(elections) ? elections : []));
        console.log('✅ Public elections loaded:', elections.length);
      } else {
        dispatch(setPublicElections([]));
      }
    } catch (error) {
      console.log('⚠️ Could not load public elections:', error.message);
      dispatch(setPublicElections([]));
    }

    // 3. Load drafts
    try {
      const draftsResponse = await getMyDrafts();
      
      if (draftsResponse.success && draftsResponse.data) {
        const drafts = draftsResponse.data.drafts || draftsResponse.data;
        dispatch(setDrafts(Array.isArray(drafts) ? drafts : []));
        console.log('✅ Drafts loaded:', drafts.length);
      } else {
        dispatch(setDrafts([]));
      }
    } catch (error) {
      console.log('⚠️ Could not load drafts:', error.message);
      dispatch(setDrafts([]));
    }

    dispatch(setLoading(false));
    console.log('✅ Election data loaded successfully');
    return true;
  } catch (error) {
    console.error('❌ Error loading election data globally:', error);
    dispatch(setError(error.message));
    dispatch(setLoading(false));
    return false;
  }
};

// Load single election by ID and set as currentElection
export const loadSingleElection = async (dispatch, electionId) => {
  try {
    console.log('🔄 Loading single election:', electionId);
    dispatch(setLoading(true));

    const response = await getElection(electionId);
    
    if (response.success && response.data) {
      const electionData = response.data;

      // Map the election data to the redux structure for currentElection
      const currentElectionData = {
        // Basic IDs
        id: electionData.id,
        draftId: electionData.draft_id || null,
        
        // Step 1 Data - Basic Info
        step1Data: {
          title: electionData.title || '',
          description: electionData.description || '',
          topic_image: electionData.topic_image_url || null,
          topic_video: electionData.topic_video_url || null,
          topic_video_url: electionData.topic_video_url || '',
          logo: electionData.logo_url || null,
          start_date: electionData.start_date || '',
          start_time: electionData.start_time || '',
          end_date: electionData.end_date || '',
          end_time: electionData.end_time || '',
          timezone: electionData.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
          creator_type: electionData.creator_type || 'individual',
        },
        
        // Step 2 Data - Configuration
        step2Data: {
          category_id: electionData.category_id || null,
          voting_type: electionData.voting_type || 'plurality',
          permission_type: electionData.permission_type || 'public',
          allowed_countries: electionData.allowed_countries || [],
          is_free: electionData.is_free !== undefined ? electionData.is_free : true,
          pricing_type: electionData.pricing_type || 'free',
          general_participation_fee: electionData.general_participation_fee || 0,
          regional_fees: electionData.regional_pricing || {},
          biometric_required: electionData.biometric_required || false,
          authentication_methods: electionData.authentication_methods || ['passkey'],
          show_live_results: electionData.show_live_results !== undefined ? electionData.show_live_results : false,
          vote_editing_allowed: electionData.vote_editing_allowed !== undefined ? electionData.vote_editing_allowed : false,
          
          // Lottery
          lottery_enabled: electionData.lottery_config?.is_lotterized || false,
          lottery_config: electionData.lottery_config || {
            prize_funding_source: 'creator_funded',
            reward_type: 'monetary',
            reward_amount: 0,
            total_prize_pool: 0,
            winner_count: 1,
            prize_pool_total: 0,
            prize_description: '',
            estimated_value: 0,
            projected_revenue: 0,
            revenue_share_percentage: 0,
          },
        },
        
        // Step 3 Data - Questions
        step3Data: {
          questions: electionData.questions || [],
          election_slug: electionData.slug || '',
        },
        
        // Progress tracking
        completedSteps: [1, 2, 3, 4],
        currentStep: 4,
        
        // Additional metadata
        status: electionData.status || 'draft',
        creator_id: electionData.creator_id,
        organization_id: electionData.organization_id || null,
        shareable_url: electionData.shareable_url || '',
        processing_fee_percentage: electionData.processing_fee_percentage || 0,
        view_count: electionData.view_count || 0,
        vote_count: electionData.vote_count || 0,
        created_at: electionData.created_at,
        updated_at: electionData.updated_at,
        published_at: electionData.published_at || null,
      };

      dispatch(setCurrentElection(currentElectionData));
      dispatch(setLoading(false));
      
      console.log('✅ Single election loaded into currentElection:', electionData.title);
      return currentElectionData;
    } else {
      dispatch(setLoading(false));
      console.log('⚠️ No election data found');
      return null;
    }
  } catch (error) {
    console.error('❌ Error loading single election:', error);
    dispatch(setError(error.message));
    dispatch(setLoading(false));
    return null;
  }
};

// Optional: Load only user's elections (lightweight version)
export const loadMyElectionsOnly = async (dispatch) => {
  try {
    console.log('🔄 Loading my elections only...');
    
    const myElectionsResponse = await getMyElections(1, 100, 'all');
    
    if (myElectionsResponse.success && myElectionsResponse.data) {
      const elections = myElectionsResponse.data.elections || myElectionsResponse.data;
      dispatch(setMyElections(Array.isArray(elections) ? elections : []));
      console.log('✅ My elections loaded:', elections.length);
      return elections;
    } else {
      dispatch(setMyElections([]));
      return [];
    }
  } catch (error) {
    console.error('❌ Error loading my elections:', error);
    dispatch(setMyElections([]));
    return [];
  }
};

// Optional: Load only public elections (lightweight version)
export const loadPublicElectionsOnly = async (dispatch) => {
  try {
    console.log('🔄 Loading public elections only...');
    
    const publicElectionsResponse = await getPublicElections(1, 50);
    
    if (publicElectionsResponse.success && publicElectionsResponse.data) {
      const elections = publicElectionsResponse.data.elections || publicElectionsResponse.data;
      dispatch(setPublicElections(Array.isArray(elections) ? elections : []));
      console.log('✅ Public elections loaded:', elections.length);
      return elections;
    } else {
      dispatch(setPublicElections([]));
      return [];
    }
  } catch (error) {
    console.error('❌ Error loading public elections:', error);
    dispatch(setPublicElections([]));
    return [];
  }
};

// Optional: Load only drafts (lightweight version)
export const loadDraftsOnly = async (dispatch) => {
  try {
    console.log('🔄 Loading drafts only...');
    
    const draftsResponse = await getMyDrafts();
    
    if (draftsResponse.success && draftsResponse.data) {
      const drafts = draftsResponse.data.drafts || draftsResponse.data;
      dispatch(setDrafts(Array.isArray(drafts) ? drafts : []));
      console.log('✅ Drafts loaded:', drafts.length);
      return drafts;
    } else {
      dispatch(setDrafts([]));
      return [];
    }
  } catch (error) {
    console.error('❌ Error loading drafts:', error);
    dispatch(setDrafts([]));
    return [];
  }
};