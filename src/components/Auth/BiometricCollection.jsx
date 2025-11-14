import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useCollectBiometricMutation } from '../../redux/api/auth/biometricApi';
import { setBiometricData, setSuccess, setError, setSessionFlags } from '../../redux/slices/authSlice';
import ErrorAlert from '../Common/ErrorAlert';
import SuccessAlert from '../Common/SuccessAlert';
import Loading from '../Common/Loading';
import { useAuth } from '../../redux/hooks';
import { useDeviceInfo } from '../../hooks/useDeviceInfo';

export default function BiometricCollection({ sessionId, onNext }) {
  const dispatch = useDispatch();
  const auth = useAuth();
  const deviceInfo = useDeviceInfo();
  const [biometricType, setBiometricType] = useState('fingerprint');
  const [biometricData, setBiometricDataLocal] = useState(null); // ✅ Track actual state
  const [backupCodes, setBackupCodes] = useState([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  const [collectBiometric, { isLoading }] = useCollectBiometricMutation();

  const handleCollect = async () => {
    try {
      console.log('📤 Collecting biometric...', { biometricType, sessionId });

      const mockBiometricData = {
        template: `mock_${biometricType}_${Date.now()}`,
        qualityScore: 95,
      };

      const result = await collectBiometric({
        sessionId,
        biometricType,
        biometricData: mockBiometricData, // ✅ Send mock data
        deviceInfo,
      }).unwrap();

      console.log('✅ Biometric collected, result:', result);

      // ✅ Set biometricData to trigger UI change
      setBiometricDataLocal(mockBiometricData);
      
      // Update Redux with returned session flags
      if (result.sessionFlags) {
        dispatch(setSessionFlags(result.sessionFlags));
        console.log('✅ Session flags updated:', result.sessionFlags);
      }

      setBackupCodes(result.backupCodes || []);
      setShowBackupCodes(true);
      
      dispatch(setBiometricData({ biometricType, deviceInfo }));
      dispatch(setSuccess('Biometric collected successfully'));
    } catch (error) {
      const errorMessage = error.data?.message || 'Failed to collect biometric';
      console.error('❌ Error collecting biometric:', errorMessage);
      dispatch(setError(errorMessage));
    }
  };

  const handleDownloadBackupCodes = () => {
    const content = backupCodes.join('\n');
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', 'vottery-backup-codes.txt');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-2 text-center">Add Biometric</h2>
      <p className="text-center text-gray-600 mb-6">
        Secure your account with biometric authentication
      </p>

      {auth.error && <ErrorAlert message={auth.error} />}
      {auth.successMessage && <SuccessAlert message={auth.successMessage} />}

      {!biometricData && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Biometric Type
            </label>
            <select
              value={biometricType}
              onChange={(e) => setBiometricType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="fingerprint">Fingerprint</option>
              <option value="face_id">Face ID</option>
              <option value="iris">Iris</option>
            </select>
          </div>

          <div className="bg-gray-100 p-6 rounded-lg text-center">
            <div className="text-4xl mb-4">
              {biometricType === 'fingerprint' && '👆'}
              {biometricType === 'face_id' && '😊'}
              {biometricType === 'iris' && '👁️'}
            </div>
            <p className="text-gray-600 mb-4">
              {biometricType === 'fingerprint' && 'Place your finger on the scanner'}
              {biometricType === 'face_id' && 'Position your face in the frame'}
              {biometricType === 'iris' && 'Position your eye in the frame'}
            </p>
          </div>

          <button
            onClick={handleCollect}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isLoading ? <Loading /> : 'Collect Biometric'}
          </button>

          <button
            type="button"
            onClick={onNext}
            className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300"
          >
            Skip for now
          </button>
        </div>
      )}

      {biometricData && !showBackupCodes && (
        <div className="space-y-4 text-center">
          <div className="text-4xl mb-4">✅</div>
          <p className="text-green-600 font-semibold">Biometric collected successfully!</p>
          <p className="text-gray-600">Save your backup codes in a safe place</p>
          <button
            onClick={() => setShowBackupCodes(true)}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700"
          >
            View Backup Codes
          </button>
        </div>
      )}

      {showBackupCodes && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Save these codes in a secure location. You can use any code to regain access if biometric fails.
          </p>
          <div className="bg-gray-100 p-4 rounded-lg max-h-40 overflow-y-auto font-mono text-sm">
            {backupCodes.map((code, index) => (
              <div key={index} className="text-gray-800">
                {index + 1}. {code}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDownloadBackupCodes}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700"
            >
              Download
            </button>
            <button
              onClick={onNext}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
