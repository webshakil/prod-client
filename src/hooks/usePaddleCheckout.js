// frontend/src/hooks/usePaddleCheckout.js
import { useEffect, useState } from 'react';
import { initializePaddle } from '@paddle/paddle-js';

const PADDLE_ENVIRONMENT = import.meta.env.VITE_PADDLE_ENVIRONMENT || 'sandbox';
const PADDLE_CLIENT_TOKEN = import.meta.env.VITE_PADDLE_CLIENT_TOKEN;

export const usePaddleCheckout = () => {
  const [paddle, setPaddle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initPaddle = async () => {
      try {
        console.log('🏓 Initializing Paddle SDK...');
        console.log('   Environment:', PADDLE_ENVIRONMENT);
        
        if (!PADDLE_CLIENT_TOKEN) {
          throw new Error('Paddle client token not configured');
        }

        const paddleInstance = await initializePaddle({
          environment: PADDLE_ENVIRONMENT, // 'sandbox' or 'production'
          token: PADDLE_CLIENT_TOKEN,
        });

        setPaddle(paddleInstance);
        console.log('✅ Paddle SDK initialized');
      } catch (err) {
        console.error('❌ Failed to initialize Paddle:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    initPaddle();
  }, []);

  const openCheckout = ({ priceId, userId, planId, userEmail, onSuccess, onError }) => {
    if (!paddle) {
      console.error('❌ Paddle not initialized');
      onError?.('Paddle checkout not ready');
      return;
    }

    console.log('🚀 Opening Paddle checkout...');
    console.log('   Price ID:', priceId);
    console.log('   User ID:', userId);
    console.log('   Plan ID:', planId);
    console.log('   Email:', userEmail);

    const returnUrl = window.location.origin;

    paddle.Checkout.open({
      items: [
        {
          priceId: priceId,
          quantity: 1,
        },
      ],
      customer: {
        email: userEmail,
      },
      customData: {
        userId: userId.toString(),
        planId: planId.toString(),
      },
      settings: {
        successUrl: `${returnUrl}/payment/callback?gateway=paddle&plan_id=${planId}`,
        displayMode: 'overlay', // Opens in modal
        theme: 'light',
        locale: 'en',
      },
      eventCallback: (event) => {
        console.log('🎯 Paddle event:', event);
        
        if (event.name === 'checkout.completed') {
          console.log('✅ Checkout completed!');
          console.log('   Transaction ID:', event.data.transaction_id);
          onSuccess?.(event.data);
        }
        
        if (event.name === 'checkout.error') {
          console.error('❌ Checkout error:', event.data);
          onError?.(event.data);
        }
        
        if (event.name === 'checkout.closed') {
          console.log('🚪 Checkout closed');
        }
      },
    });
  };

  return {
    paddle,
    isLoading,
    error,
    openCheckout,
  };
};