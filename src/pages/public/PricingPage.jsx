import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Check, Loader } from 'lucide-react';
import Navbar from '../../components/Layout/Navbar';
import Footer from '../../components/Layout/Footer';
import Button from '../../components/Common/Button';
import { useGetAllPlansQuery } from '../../redux/api/subscription/subscriptionApi';

const PricingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  const { data: plansData, isLoading, isError, error } = useGetAllPlansQuery();
  const plans = plansData?.plans || plansData?.data || plansData || [];

  /*eslint-disable*/
  const handlePlanSelect = (plan) => {
    if (isAuthenticated) {
      // Navigate to checkout page with plan data
      navigate('/payment/checkout', { 
        state: { 
          selectedPlan: plan,
          planType: plan.plan_type 
        } 
      });
    } else {
      // Navigate to auth, then redirect back to pricing
      navigate('/auth', { state: { from: '/pricing', selectedPlan: plan } });
    }
  };

  const formatPrice = (price, planType) => {
    if (planType === 'enterprise') return 'Custom';
    if (price === 0) return '$0';
    return `$${parseFloat(price).toFixed(0)}`;
  };

  const getPeriod = (durationDays, planType) => {
    if (planType === 'enterprise') return 'contact us';
    if (durationDays === 0) return 'forever';
    if (durationDays === 30) return 'per month';
    if (durationDays === 365) return 'per year';
    return `per ${durationDays} days`;
  };

  const isPopularPlan = (planType) => {
    return planType === 'pro' || planType === 'professional';
  };

  const getFeatures = (plan) => {
    const features = [];
    
    if (plan.max_elections === null || plan.max_elections === -1 || plan.max_elections === 0) {
      features.push('Unlimited elections');
    } else {
      features.push(`Up to ${plan.max_elections} elections per ${plan.billing_cycle || 'month'}`);
    }
    
    if (plan.max_voters_per_election === null || plan.max_voters_per_election === -1 || plan.max_voters_per_election === 0) {
      features.push('Unlimited voters per election');
    } else {
      features.push(`Up to ${plan.max_voters_per_election.toLocaleString()} voters per election`);
    }

    if (plan.processing_fee_enabled) {
      const feeText = plan.processing_fee_type === 'fixed' 
        ? `$${parseFloat(plan.processing_fee_fixed_amount || 0).toFixed(2)} processing fee`
        : `${plan.processing_fee_percentage || 0}% processing fee`;
      features.push(feeText + (plan.processing_fee_mandatory ? ' (mandatory)' : ' (optional)'));
    } else {
      features.push('No processing fees');
    }

    if (plan.what_included) {
      try {
        const included = typeof plan.what_included === 'string' 
          ? JSON.parse(plan.what_included) 
          : plan.what_included;
        if (Array.isArray(included)) {
          features.push(...included);
        }
      } catch (e) {
        if (typeof plan.what_included === 'string') {
          features.push(...plan.what_included.split(',').map(f => f.trim()).filter(f => f));
        }
      }
    }

    return features;
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
            Simple, Transparent{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Pricing
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the perfect plan for your organization. All plans include our core security features.
          </p>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="flex flex-col justify-center items-center py-20">
              <Loader className="animate-spin text-indigo-600 mb-4" size={48} />
              <p className="text-gray-600">Loading pricing plans...</p>
            </div>
          ) : isError ? (
            <div className="text-center py-20">
              <div className="text-red-600 text-lg mb-4">Failed to load pricing plans</div>
              <p className="text-gray-600 mb-2">{error?.data?.message || error?.message || 'Please try again later'}</p>
              <p className="text-sm text-gray-500 mb-6">Error: {JSON.stringify(error)}</p>
              <Button variant="primary" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          ) : !Array.isArray(plans) || plans.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-gray-600 text-lg mb-2">No plans available at the moment</div>
              <p className="text-sm text-gray-500 mb-4">Data received: {JSON.stringify(plansData)}</p>
              <p className="text-gray-500 mt-2">Please check back soon!</p>
            </div>
          ) : (
            <div className={`grid grid-cols-1 ${
              plans.length === 2 
                ? 'md:grid-cols-2 max-w-4xl mx-auto' 
                : plans.length >= 3 
                ? 'md:grid-cols-3' 
                : 'md:grid-cols-1 max-w-md mx-auto'
            } gap-8`}>
              {plans
                .filter(plan => plan.is_active !== false)
                .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
                .map((plan) => {
                  const popular = isPopularPlan(plan.plan_type);
                  const features = getFeatures(plan);
                  
                  return (
                    <div
                      key={plan.id}
                      className={`relative rounded-2xl ${
                        popular
                          ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-2xl scale-105'
                          : 'bg-white border-2 border-gray-200 hover:border-indigo-300'
                      } p-8 transition-all duration-300 hover:shadow-xl ${popular ? '' : 'hover:scale-105'}`}
                    >
                      {popular && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-yellow-400 text-gray-900 text-sm font-bold rounded-full shadow-lg">
                          Most Popular
                        </div>
                      )}

                      <div className="text-center mb-8">
                        <h3 className={`text-2xl font-bold mb-2 capitalize ${popular ? 'text-white' : 'text-gray-900'}`}>
                          {plan.plan_name}
                        </h3>
                        <div className="mb-4">
                          <span className={`text-5xl font-bold ${popular ? 'text-white' : 'text-gray-900'}`}>
                            {formatPrice(plan.price, plan.plan_type)}
                          </span>
                          {formatPrice(plan.price, plan.plan_type) !== 'Custom' && (
                            <span className={`text-lg ${popular ? 'text-indigo-100' : 'text-gray-500'}`}>
                              /{getPeriod(plan.duration_days, plan.plan_type)}
                            </span>
                          )}
                        </div>
                        {plan.description && (
                          <p className={`text-sm ${popular ? 'text-indigo-100' : 'text-gray-600'}`}>
                            {plan.description}
                          </p>
                        )}
                      </div>

                      <ul className="space-y-3 mb-8 min-h-[280px]">
                        {features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <Check
                              className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                                popular ? 'text-white' : 'text-indigo-600'
                              }`}
                            />
                            <span className={`text-sm leading-relaxed ${popular ? 'text-white' : 'text-gray-700'}`}>
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>

                      <Button
                        variant={popular ? 'outline' : 'primary'}
                        onClick={() => handlePlanSelect(plan)}
                        className={`w-full py-3 font-semibold ${
                          popular
                            ? 'bg-white text-indigo-600 hover:bg-gray-50 border-2 border-white'
                            : ''
                        }`}
                      >
                        {plan.plan_type === 'enterprise' ? 'Contact Sales' : 'Get Started'}
                      </Button>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I change plans later?
              </h3>
              <p className="text-gray-600">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept all major credit cards (Visa, Mastercard, American Express) and support regional payment methods through Stripe and Paddle.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Is there a free trial?
              </h3>
              <p className="text-gray-600">
                Yes! Pro plans come with a 14-day free trial. No credit card required to start.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Do you offer refunds?
              </h3>
              <p className="text-gray-600">
                Yes, we offer a 30-day money-back guarantee on all paid plans. If you're not satisfied, we'll refund you in full.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What are processing fees?
              </h3>
              <p className="text-gray-600">
                Processing fees may apply depending on your plan. These fees help cover payment processing costs and can be either fixed amounts or percentages. Some plans include no processing fees.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PricingPage;
// import React from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useSelector } from 'react-redux';
// import { Check, Loader } from 'lucide-react';
// import Navbar from '../../components/Layout/Navbar';
// import Footer from '../../components/Layout/Footer';
// import Button from '../../components/Common/Button';
// import { useGetAllPlansQuery } from '../../redux/api/subscription/subscriptionApi';

// const PricingPage = () => {
//   const navigate = useNavigate();
//   const { isAuthenticated } = useSelector((state) => state.auth);
  
//   const { data: plansData, isLoading, isError, error } = useGetAllPlansQuery();
//   const plans = plansData?.plans || plansData?.data || plansData || [];

//   /*eslint-disable*/
//   const handlePlanSelect = (planType) => {
//     if (isAuthenticated) {
//       navigate('/dashboard', { state: { openSubscription: true, selectedPlan: planType } });
//     } else {
//       navigate('/auth');
//     }
//   };

//   const formatPrice = (price, planType) => {
//     if (planType === 'enterprise') return 'Custom';
//     if (price === 0) return '$0';
//     return `$${parseFloat(price).toFixed(0)}`;
//   };

//   const getPeriod = (durationDays, planType) => {
//     if (planType === 'enterprise') return 'contact us';
//     if (durationDays === 0) return 'forever';
//     if (durationDays === 30) return 'per month';
//     if (durationDays === 365) return 'per year';
//     return `per ${durationDays} days`;
//   };

//   const isPopularPlan = (planType) => {
//     return planType === 'pro' || planType === 'professional';
//   };

//   const getFeatures = (plan) => {
//     const features = [];
    
//     if (plan.max_elections === null || plan.max_elections === -1 || plan.max_elections === 0) {
//       features.push('Unlimited elections');
//     } else {
//       features.push(`Up to ${plan.max_elections} elections per ${plan.billing_cycle || 'month'}`);
//     }
    
//     if (plan.max_voters_per_election === null || plan.max_voters_per_election === -1 || plan.max_voters_per_election === 0) {
//       features.push('Unlimited voters per election');
//     } else {
//       features.push(`Up to ${plan.max_voters_per_election.toLocaleString()} voters per election`);
//     }

//     if (plan.processing_fee_enabled) {
//       const feeText = plan.processing_fee_type === 'fixed' 
//         ? `$${parseFloat(plan.processing_fee_fixed_amount || 0).toFixed(2)} processing fee`
//         : `${plan.processing_fee_percentage || 0}% processing fee`;
//       features.push(feeText + (plan.processing_fee_mandatory ? ' (mandatory)' : ' (optional)'));
//     } else {
//       features.push('No processing fees');
//     }

//     if (plan.what_included) {
//       try {
//         const included = typeof plan.what_included === 'string' 
//           ? JSON.parse(plan.what_included) 
//           : plan.what_included;
//         if (Array.isArray(included)) {
//           features.push(...included);
//         }
//       } catch (e) {
//         if (typeof plan.what_included === 'string') {
//           features.push(...plan.what_included.split(',').map(f => f.trim()).filter(f => f));
//         }
//       }
//     }

//     return features;
//   };

//   return (
//     <div className="min-h-screen bg-white">
//       <Navbar />

//       <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
//         <div className="max-w-7xl mx-auto text-center">
//           <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
//             Simple, Transparent{' '}
//             <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
//               Pricing
//             </span>
//           </h1>
//           <p className="text-xl text-gray-600 max-w-3xl mx-auto">
//             Choose the perfect plan for your organization. All plans include our core security features.
//           </p>
//         </div>
//       </section>

//       <section className="py-20 px-4 sm:px-6 lg:px-8">
//         <div className="max-w-7xl mx-auto">
//           {isLoading ? (
//             <div className="flex flex-col justify-center items-center py-20">
//               <Loader className="animate-spin text-indigo-600 mb-4" size={48} />
//               <p className="text-gray-600">Loading pricing plans...</p>
//             </div>
//           ) : isError ? (
//             <div className="text-center py-20">
//               <div className="text-red-600 text-lg mb-4">Failed to load pricing plans</div>
//               <p className="text-gray-600 mb-2">{error?.data?.message || error?.message || 'Please try again later'}</p>
//               <p className="text-sm text-gray-500 mb-6">Error: {JSON.stringify(error)}</p>
//               <Button variant="primary" onClick={() => window.location.reload()}>
//                 Retry
//               </Button>
//             </div>
//           ) : !Array.isArray(plans) || plans.length === 0 ? (
//             <div className="text-center py-20">
//               <div className="text-gray-600 text-lg mb-2">No plans available at the moment</div>
//               <p className="text-sm text-gray-500 mb-4">Data received: {JSON.stringify(plansData)}</p>
//               <p className="text-gray-500 mt-2">Please check back soon!</p>
//             </div>
//           ) : (
//             <div className={`grid grid-cols-1 ${
//               plans.length === 2 
//                 ? 'md:grid-cols-2 max-w-4xl mx-auto' 
//                 : plans.length >= 3 
//                 ? 'md:grid-cols-3' 
//                 : 'md:grid-cols-1 max-w-md mx-auto'
//             } gap-8`}>
//               {plans
//                 .filter(plan => plan.is_active !== false)
//                 .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
//                 .map((plan) => {
//                   const popular = isPopularPlan(plan.plan_type);
//                   const features = getFeatures(plan);
                  
//                   return (
//                     <div
//                       key={plan.id}
//                       className={`relative rounded-2xl ${
//                         popular
//                           ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-2xl scale-105'
//                           : 'bg-white border-2 border-gray-200 hover:border-indigo-300'
//                       } p-8 transition-all duration-300 hover:shadow-xl ${popular ? '' : 'hover:scale-105'}`}
//                     >
//                       {popular && (
//                         <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-yellow-400 text-gray-900 text-sm font-bold rounded-full shadow-lg">
//                           Most Popular
//                         </div>
//                       )}

//                       <div className="text-center mb-8">
//                         <h3 className={`text-2xl font-bold mb-2 capitalize ${popular ? 'text-white' : 'text-gray-900'}`}>
//                           {plan.plan_name}
//                         </h3>
//                         <div className="mb-4">
//                           <span className={`text-5xl font-bold ${popular ? 'text-white' : 'text-gray-900'}`}>
//                             {formatPrice(plan.price, plan.plan_type)}
//                           </span>
//                           {formatPrice(plan.price, plan.plan_type) !== 'Custom' && (
//                             <span className={`text-lg ${popular ? 'text-indigo-100' : 'text-gray-500'}`}>
//                               /{getPeriod(plan.duration_days, plan.plan_type)}
//                             </span>
//                           )}
//                         </div>
//                         {plan.description && (
//                           <p className={`text-sm ${popular ? 'text-indigo-100' : 'text-gray-600'}`}>
//                             {plan.description}
//                           </p>
//                         )}
//                       </div>

//                       <ul className="space-y-3 mb-8 min-h-[280px]">
//                         {features.map((feature, i) => (
//                           <li key={i} className="flex items-start gap-3">
//                             <Check
//                               className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
//                                 popular ? 'text-white' : 'text-indigo-600'
//                               }`}
//                             />
//                             <span className={`text-sm leading-relaxed ${popular ? 'text-white' : 'text-gray-700'}`}>
//                               {feature}
//                             </span>
//                           </li>
//                         ))}
//                       </ul>

//                       <Button
//                         variant={popular ? 'outline' : 'primary'}
//                         onClick={() => handlePlanSelect(plan.plan_type)}
//                         className={`w-full py-3 font-semibold ${
//                           popular
//                             ? 'bg-white text-indigo-600 hover:bg-gray-50 border-2 border-white'
//                             : ''
//                         }`}
//                       >
//                         {plan.plan_type === 'enterprise' ? 'Contact Sales' : 'Get Started'}
//                       </Button>
//                     </div>
//                   );
//                 })}
//             </div>
//           )}
//         </div>
//       </section>

//       <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
//         <div className="max-w-4xl mx-auto">
//           <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
//             Frequently Asked Questions
//           </h2>

//           <div className="space-y-6">
//             <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
//               <h3 className="text-lg font-semibold text-gray-900 mb-2">
//                 Can I change plans later?
//               </h3>
//               <p className="text-gray-600">
//                 Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
//               </p>
//             </div>

//             <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
//               <h3 className="text-lg font-semibold text-gray-900 mb-2">
//                 What payment methods do you accept?
//               </h3>
//               <p className="text-gray-600">
//                 We accept all major credit cards (Visa, Mastercard, American Express) and support regional payment methods through Stripe and Paddle.
//               </p>
//             </div>

//             <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
//               <h3 className="text-lg font-semibold text-gray-900 mb-2">
//                 Is there a free trial?
//               </h3>
//               <p className="text-gray-600">
//                 Yes! Pro plans come with a 14-day free trial. No credit card required to start.
//               </p>
//             </div>

//             <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
//               <h3 className="text-lg font-semibold text-gray-900 mb-2">
//                 Do you offer refunds?
//               </h3>
//               <p className="text-gray-600">
//                 Yes, we offer a 30-day money-back guarantee on all paid plans. If you're not satisfied, we'll refund you in full.
//               </p>
//             </div>

//             <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
//               <h3 className="text-lg font-semibold text-gray-900 mb-2">
//                 What are processing fees?
//               </h3>
//               <p className="text-gray-600">
//                 Processing fees may apply depending on your plan. These fees help cover payment processing costs and can be either fixed amounts or percentages. Some plans include no processing fees.
//               </p>
//             </div>
//           </div>
//         </div>
//       </section>

//       <Footer />
//     </div>
//   );
// };

// export default PricingPage;
// import React, { useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useSelector } from 'react-redux';
// import { Check, Loader } from 'lucide-react';
// import Navbar from '../../components/Layout/Navbar';
// import Footer from '../../components/Layout/Footer';
// import Button from '../../components/Common/Button';
// import { useGetAllPlansQuery } from '../../redux/api/subscription/subscriptionApi';

// const PricingPage = () => {
//   const navigate = useNavigate();
//   const { isAuthenticated } = useSelector((state) => state.auth);
  
//   // Fetch plans from API using YOUR existing hook
//   const { data: plansData, isLoading, isError, error } = useGetAllPlansQuery();
  
//   // Debug logging
//   useEffect(() => {
//     console.log('📊 Plans Data:', plansData);
//     console.log('⏳ Loading:', isLoading);
//     console.log('❌ Error:', isError, error);
//   }, [plansData, isLoading, isError, error]);
  
//   const plans = plansData?.plans || plansData?.data || plansData || [];

//   /*eslint-disable*/
//   const handlePlanSelect = (planType) => {
//     if (isAuthenticated) {
//       navigate('/dashboard', { state: { openSubscription: true, selectedPlan: planType } });
//     } else {
//       navigate('/auth');
//     }
//   };

//   // Helper function to format price
//   const formatPrice = (price, planType) => {
//     if (planType === 'enterprise') return 'Custom';
//     if (price === 0) return '$0';
//     return `$${parseFloat(price).toFixed(0)}`;
//   };

//   // Helper function to get period text
//   const getPeriod = (durationDays, planType) => {
//     if (planType === 'enterprise') return 'contact us';
//     if (durationDays === 0) return 'forever';
//     if (durationDays === 30) return 'per month';
//     if (durationDays === 365) return 'per year';
//     return `per ${durationDays} days`;
//   };

//   // Helper function to determine if plan is popular
//   const isPopularPlan = (planType) => {
//     return planType === 'pro' || planType === 'professional';
//   };

//   // Helper function to parse features from database
//   const getFeatures = (plan) => {
//     const features = [];
    
//     // Max Elections
//     if (plan.max_elections === null || plan.max_elections === -1 || plan.max_elections === 0) {
//       features.push('Unlimited elections');
//     } else {
//       features.push(`Up to ${plan.max_elections} elections per ${plan.billing_cycle || 'month'}`);
//     }
    
//     // Max Voters
//     if (plan.max_voters_per_election === null || plan.max_voters_per_election === -1 || plan.max_voters_per_election === 0) {
//       features.push('Unlimited voters per election');
//     } else {
//       features.push(`Up to ${plan.max_voters_per_election.toLocaleString()} voters per election`);
//     }

//     // Processing Fee
//     if (plan.processing_fee_enabled) {
//       const feeText = plan.processing_fee_type === 'fixed' 
//         ? `$${parseFloat(plan.processing_fee_fixed_amount || 0).toFixed(2)} processing fee`
//         : `${plan.processing_fee_percentage || 0}% processing fee`;
//       features.push(feeText + (plan.processing_fee_mandatory ? ' (mandatory)' : ' (optional)'));
//     } else {
//       features.push('No processing fees');
//     }

//     // Parse what_included field
//     if (plan.what_included) {
//       try {
//         const included = typeof plan.what_included === 'string' 
//           ? JSON.parse(plan.what_included) 
//           : plan.what_included;
//         if (Array.isArray(included)) {
//           features.push(...included);
//         }
//       } catch (e) {
//         // If not JSON, treat as comma-separated string
//         if (typeof plan.what_included === 'string') {
//           features.push(...plan.what_included.split(',').map(f => f.trim()).filter(f => f));
//         }
//       }
//     }

//     return features;
//   };

//   return (
//     <div className="min-h-screen bg-white">
//       <Navbar />

//       {/* Hero Section */}
//       <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
//         <div className="max-w-7xl mx-auto text-center">
//           <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
//             Simple, Transparent{' '}
//             <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
//               Pricing
//             </span>
//           </h1>
//           <p className="text-xl text-gray-600 max-w-3xl mx-auto">
//             Choose the perfect plan for your organization. All plans include our core security features.
//           </p>
//         </div>
//       </section>

//       {/* Pricing Cards */}
//       <section className="py-20 px-4 sm:px-6 lg:px-8">
//         <div className="max-w-7xl mx-auto">
//           {isLoading ? (
//             <div className="flex flex-col justify-center items-center py-20">
//               <Loader className="animate-spin text-indigo-600 mb-4" size={48} />
//               <p className="text-gray-600">Loading pricing plans...</p>
//             </div>
//           ) : isError ? (
//             <div className="text-center py-20">
//               <div className="text-red-600 text-lg mb-4">Failed to load pricing plans</div>
//               <p className="text-gray-600 mb-2">{error?.data?.message || error?.message || 'Please try again later'}</p>
//               <p className="text-sm text-gray-500 mb-6">Error: {JSON.stringify(error)}</p>
//               <Button variant="primary" onClick={() => window.location.reload()}>
//                 Retry
//               </Button>
//             </div>
//           ) : !Array.isArray(plans) || plans.length === 0 ? (
//             <div className="text-center py-20">
//               <div className="text-gray-600 text-lg mb-2">No plans available at the moment</div>
//               <p className="text-sm text-gray-500 mb-4">Data received: {JSON.stringify(plansData)}</p>
//               <p className="text-gray-500 mt-2">Please check back soon!</p>
//             </div>
//           ) : (
//             <div className={`grid grid-cols-1 ${
//               plans.length === 2 
//                 ? 'md:grid-cols-2 max-w-4xl mx-auto' 
//                 : plans.length >= 3 
//                 ? 'md:grid-cols-3' 
//                 : 'md:grid-cols-1 max-w-md mx-auto'
//             } gap-8`}>
//               {plans
//                 .filter(plan => plan.is_active !== false)
//                 .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
//                 .map((plan) => {
//                   const popular = isPopularPlan(plan.plan_type);
//                   const features = getFeatures(plan);
                  
//                   return (
//                     <div
//                       key={plan.id}
//                       className={`relative rounded-2xl ${
//                         popular
//                           ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-2xl scale-105'
//                           : 'bg-white border-2 border-gray-200 hover:border-indigo-300'
//                       } p-8 transition-all duration-300 hover:shadow-xl ${popular ? '' : 'hover:scale-105'}`}
//                     >
//                       {popular && (
//                         <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-yellow-400 text-gray-900 text-sm font-bold rounded-full shadow-lg">
//                           Most Popular
//                         </div>
//                       )}

//                       <div className="text-center mb-8">
//                         <h3 className={`text-2xl font-bold mb-2 capitalize ${popular ? 'text-white' : 'text-gray-900'}`}>
//                           {plan.plan_name}
//                         </h3>
//                         <div className="mb-4">
//                           <span className={`text-5xl font-bold ${popular ? 'text-white' : 'text-gray-900'}`}>
//                             {formatPrice(plan.price, plan.plan_type)}
//                           </span>
//                           {formatPrice(plan.price, plan.plan_type) !== 'Custom' && (
//                             <span className={`text-lg ${popular ? 'text-indigo-100' : 'text-gray-500'}`}>
//                               /{getPeriod(plan.duration_days, plan.plan_type)}
//                             </span>
//                           )}
//                         </div>
//                         {plan.description && (
//                           <p className={`text-sm ${popular ? 'text-indigo-100' : 'text-gray-600'}`}>
//                             {plan.description}
//                           </p>
//                         )}
//                       </div>

//                       <ul className="space-y-3 mb-8 min-h-[280px]">
//                         {features.map((feature, i) => (
//                           <li key={i} className="flex items-start gap-3">
//                             <Check
//                               className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
//                                 popular ? 'text-white' : 'text-indigo-600'
//                               }`}
//                             />
//                             <span className={`text-sm leading-relaxed ${popular ? 'text-white' : 'text-gray-700'}`}>
//                               {feature}
//                             </span>
//                           </li>
//                         ))}
//                       </ul>

//                       <Button
//                         variant={popular ? 'outline' : 'primary'}
//                         onClick={() => handlePlanSelect(plan.plan_type)}
//                         className={`w-full py-3 font-semibold ${
//                           popular
//                             ? 'bg-white text-indigo-600 hover:bg-gray-50 border-2 border-white'
//                             : ''
//                         }`}
//                       >
//                         {plan.plan_type === 'enterprise' ? 'Contact Sales' : 'Get Started'}
//                       </Button>
//                     </div>
//                   );
//                 })}
//             </div>
//           )}
//         </div>
//       </section>

//       {/* FAQ Section */}
//       <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
//         <div className="max-w-4xl mx-auto">
//           <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
//             Frequently Asked Questions
//           </h2>

//           <div className="space-y-6">
//             <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
//               <h3 className="text-lg font-semibold text-gray-900 mb-2">
//                 Can I change plans later?
//               </h3>
//               <p className="text-gray-600">
//                 Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
//               </p>
//             </div>

//             <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
//               <h3 className="text-lg font-semibold text-gray-900 mb-2">
//                 What payment methods do you accept?
//               </h3>
//               <p className="text-gray-600">
//                 We accept all major credit cards (Visa, Mastercard, American Express) and support regional payment methods through Stripe and Paddle.
//               </p>
//             </div>

//             <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
//               <h3 className="text-lg font-semibold text-gray-900 mb-2">
//                 Is there a free trial?
//               </h3>
//               <p className="text-gray-600">
//                 Yes! Pro plans come with a 14-day free trial. No credit card required to start.
//               </p>
//             </div>

//             <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
//               <h3 className="text-lg font-semibold text-gray-900 mb-2">
//                 Do you offer refunds?
//               </h3>
//               <p className="text-gray-600">
//                 Yes, we offer a 30-day money-back guarantee on all paid plans. If you're not satisfied, we'll refund you in full.
//               </p>
//             </div>

//             <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
//               <h3 className="text-lg font-semibold text-gray-900 mb-2">
//                 What are processing fees?
//               </h3>
//               <p className="text-gray-600">
//                 Processing fees may apply depending on your plan. These fees help cover payment processing costs and can be either fixed amounts or percentages. Some plans include no processing fees.
//               </p>
//             </div>
//           </div>
//         </div>
//       </section>

//       <Footer />
//     </div>
//   );
// };

// export default PricingPage;