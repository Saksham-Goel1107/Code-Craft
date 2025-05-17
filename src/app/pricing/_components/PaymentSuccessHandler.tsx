'use client';

import { useEffect, useState, useRef } from 'react';

import { useUser } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAction } from 'convex/react';
import { api } from '../../../../convex/_generated/api';

export default function PaymentSuccessHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUser();
  const [isVerifying, setIsVerifying] = useState(false);
  const verifyPayment = useAction(api.users.verifyAndUpgradeFromAction);
  // Use useRef to make the set persist across renders
  const processedSessionsRef = useRef(new Set());

  useEffect(() => {
    
    async function handlePaymentSuccess() {
      const success = searchParams.get('success');
      const sessionId = searchParams.get('session_id');
        if (success === 'true' && sessionId && user && !isVerifying) {
        // Skip if we've already processed this session in this browser session
        if (processedSessionsRef.current.has(sessionId)) {
          console.log(`Session ${sessionId} already processed in this browser session`);
          // Clean up URL parameters
          if (window.history.replaceState) {
            window.history.replaceState({}, document.title, '/pricing');
          }
          return;
        }
        
        setIsVerifying(true);
        processedSessionsRef.current.add(sessionId);
        console.log(`Processing successful payment redirect with sessionId: ${sessionId}`);
        
        try {
          const result = await verifyPayment({
            userId: user.id,
            sessionId
          });
          
          console.log('Payment verification result:', result);
          
          if (result.alreadyProcessed) {
            console.log('Payment was already processed previously');
          } else {
            toast.success('Successfully upgraded to Pro! Please reload the page to see the Effect');
          }
          
          // Redirect to refresh the page without query params
          router.push('/pricing');
        } catch (error) {
          console.error('Error verifying payment:', error);
          toast.error('Error verifying payment. Please contact support.');
        } finally {
          setIsVerifying(false);
        }
      }
    }
    
    handlePaymentSuccess();
  }, [searchParams, user, router, isVerifying,verifyPayment]);

  // This component doesn't render anything, it just handles the payment success redirect
  return null;
}

