import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
/*eslint-disable*/
import { setUserCheckData, setError, setSuccess } from '../../redux/slices/authSlice';
import Loading from '../Common/Loading';
import ErrorAlert from '../Common/ErrorAlert';

/**
 * SngineCallbackHandler
 * 
 * This component handles the redirect from Sngine after token verification.
 * 
 * Flow:
 * 1. User clicks "Vote Now" on Sngine
 * 2. Sngine POSTs token to backend /api/v1/sngine/callback
 * 3. Backend verifies token, creates session, saves user data
 * 4. Backend redirects to: /auth/sngine/callback?data=base64EncodedData
 * 5. This component decodes data and continues auth flow
 */
export default function SngineCallbackHandler() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const [error, setLocalError] = useState(null);
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Get base64 encoded data from URL
        const encodedData = searchParams.get('data');
        const errorParam = searchParams.get('error');

        // Handle error from backend
        if (errorParam) {
          console.error('[SNGINE-CALLBACK] Error from backend:', errorParam);
          const errorMessages = {
            'no_token': t('sngineCallback.errors.noToken', 'No authentication token provided'),
            'invalid_token': t('sngineCallback.errors.invalidToken', 'Invalid authentication token'),
            'invalid_signature': t('sngineCallback.errors.invalidSignature', 'Token verification failed'),
            'token_expired': t('sngineCallback.errors.tokenExpired', 'Your session has expired'),
            'USER_NOT_FOUND': t('sngineCallback.errors.userNotFound', 'User not found. Please register on Sngine first.'),
            'USER_BANNED': t('sngineCallback.errors.userBanned', 'Your account has been banned'),
            'processing_error': t('sngineCallback.errors.processingError', 'Failed to process authentication'),
          };
          setLocalError(errorMessages[errorParam] || t('sngineCallback.errors.unknown', 'An unknown error occurred'));
          setProcessing(false);
          return;
        }

        // Check if data exists
        if (!encodedData) {
          console.error('[SNGINE-CALLBACK] No data parameter in URL');
          setLocalError(t('sngineCallback.errors.noData', 'No authentication data received'));
          setProcessing(false);
          return;
        }

        console.log('[SNGINE-CALLBACK] Processing callback data...');

        // Decode base64 data
        let authData;
        try {
          const decodedString = atob(encodedData);
          authData = JSON.parse(decodedString);
          console.log('[SNGINE-CALLBACK] Decoded auth data:', {
            sessionId: authData.sessionId,
            userId: authData.userId,
            email: authData.email,
            isFirstTime: authData.isFirstTime,
            authMethod: authData.authMethod,
          });
        } catch (decodeError) {
          console.error('[SNGINE-CALLBACK] Failed to decode data:', decodeError);
          setLocalError(t('sngineCallback.errors.decodeError', 'Failed to decode authentication data'));
          setProcessing(false);
          return;
        }

        // Validate required fields
        if (!authData.success) {
          console.error('[SNGINE-CALLBACK] Auth not successful:', authData.error);
          setLocalError(authData.message || t('sngineCallback.errors.authFailed', 'Authentication failed'));
          setProcessing(false);
          return;
        }

        if (!authData.sessionId || !authData.userId) {
          console.error('[SNGINE-CALLBACK] Missing required fields:', { 
            sessionId: authData.sessionId, 
            userId: authData.userId 
          });
          setLocalError(t('sngineCallback.errors.missingData', 'Missing required authentication data'));
          setProcessing(false);
          return;
        }

        // Store prefill data in sessionStorage for UserDetailsForm
        if (authData.prefillData) {
          console.log('[SNGINE-CALLBACK] Storing prefill data:', authData.prefillData);
          sessionStorage.setItem('sngine_prefill_data', JSON.stringify(authData.prefillData));
        }

        // Store auth method
        sessionStorage.setItem('auth_method', authData.authMethod || 'sngine_token');

        // Dispatch to Redux - same format as checkUserController response
        const reduxPayload = {
          userId: authData.userId,
          email: authData.email,
          phone: authData.phone,
          username: authData.username,
          firstName: authData.firstName,
          lastName: authData.lastName,
          isFirstTime: authData.isFirstTime,
          sessionId: authData.sessionId,
        };

        console.log('[SNGINE-CALLBACK] Dispatching to Redux:', reduxPayload);
        dispatch(setUserCheckData(reduxPayload));
        dispatch(setSuccess(t('sngineCallback.success', 'Verified successfully from Sngine')));

        console.log('[SNGINE-CALLBACK] ✅ Auth data set, navigating to auth flow...');
        
        // Navigate to auth page - the AuthLayout will handle the rest
        // Small delay to ensure Redux state is updated
        setTimeout(() => {
          navigate('/auth', { replace: true });
        }, 100);

      } catch (error) {
        console.error('[SNGINE-CALLBACK] Unexpected error:', error);
        setLocalError(error.message || t('sngineCallback.errors.unexpected', 'An unexpected error occurred'));
        setProcessing(false);
      }
    };

    processCallback();
  }, [searchParams, dispatch, navigate, t]);

  // Show loading while processing
  if (processing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <Loading />
          <h2 className="text-xl font-semibold text-gray-700 mt-4">
            {t('sngineCallback.processing', 'Processing your authentication...')}
          </h2>
          <p className="text-gray-500 mt-2">
            {t('sngineCallback.pleaseWait', 'Please wait while we verify your credentials.')}
          </p>
        </div>
      </div>
    );
  }

  // Show error if something went wrong
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              {t('sngineCallback.errorTitle', 'Authentication Failed')}
            </h2>
          </div>
          
          <ErrorAlert message={error} />
          
          <div className="mt-6 space-y-3">
            <button
              onClick={() => navigate('/auth')}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700"
            >
              {t('sngineCallback.tryManual', 'Try Manual Verification')}
            </button>
            <a
              href={import.meta.env.REACT_APP_SNGINE_URL || 'https://vottery.com'}
              className="block w-full text-center bg-gray-100 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-200"
            >
              {t('sngineCallback.backToSngine', 'Back to Sngine')}
            </a>
          </div>
        </div>
      </div>
    );
  }

  return null;
}