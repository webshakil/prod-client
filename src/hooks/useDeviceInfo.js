import { useEffect, useState } from 'react';
import {UAParser} from 'ua-parser-js';

export const useDeviceInfo = () => {
  const [deviceInfo, setDeviceInfo] = useState({
    deviceType: 'desktop',
    os: 'Unknown',
    browser: 'Unknown',
    userAgent: '',
  });

  useEffect(() => {
    const parser = new UAParser();
    const result = parser.getResult();

    setDeviceInfo({
      deviceType: result.device.type || 'desktop',
      os: result.os.name || 'Unknown',
      osVersion: result.os.version || 'Unknown',
      browser: result.browser.name || 'Unknown',
      browserVersion: result.browser.version || 'Unknown',
      userAgent: navigator.userAgent,
    });
  }, []);

  return deviceInfo;
};

export default useDeviceInfo;