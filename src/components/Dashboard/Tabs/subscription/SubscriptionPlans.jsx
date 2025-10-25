import React from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { Check, Loader } from 'lucide-react';
import { useGetAllPlansQuery } from '../../../../redux/api/subscription/subscriptionApi';
import { setSelectedPlan, setCheckoutStep } from '../../../../redux/slices/subscriptionSlice';

const SubscriptionPlans = ({ loading }) => {
  const dispatch = useDispatch();
  /*eslint-disable*/
  const { isAuthenticated, country } = useSelector((state) => state.auth);
  const { userSubscription } = useSelector((state) => state.subscription);
  
  const { data: plansData, isLoading, isError } = useGetAllPlansQuery();
  const plans = plansData?.plans || plansData?.data || plansData || [];

  /*eslint-disable*/
  const handlePlanSelect = (plan) => {
    if (!isAuthenticated) {
      // Handle not authenticated - could show login modal
      return;
    }

    // Set selected plan in Redux
    dispatch(setSelectedPlan(plan));
    
    // Move to gateway selection step
    dispatch(setCheckoutStep('gateway-selection'));
  };

  const formatPrice = (price, planType) => {
    if (planType === 'enterprise') return 'Custom';
    if (price === 0 || price === '0') return '$0';
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

  const isCurrentPlan = (planId) => {
    return userSubscription?.plan_id === planId;
  };

  const getFeatures = (plan) => {
    const features = [];
    
    // Max Elections
    if (plan.max_elections === null || plan.max_elections === -1 || plan.max_elections === 0) {
      features.push('Unlimited elections');
    } else {
      features.push(`Up to ${plan.max_elections} elections per ${plan.billing_cycle || 'month'}`);
    }
    
    // Max Voters
    if (plan.max_voters_per_election === null || plan.max_voters_per_election === -1 || plan.max_voters_per_election === 0) {
      features.push('Unlimited voters per election');
    } else {
      features.push(`Up to ${plan.max_voters_per_election.toLocaleString()} voters per election`);
    }

    // Processing Fee
    if (plan.processing_fee_enabled) {
      const feeText = plan.processing_fee_type === 'fixed' 
        ? `$${parseFloat(plan.processing_fee_fixed_amount || 0).toFixed(2)} processing fee`
        : `${plan.processing_fee_percentage || 0}% processing fee`;
      features.push(feeText + (plan.processing_fee_mandatory ? ' (mandatory)' : ' (optional)'));
    } else {
      features.push('No processing fees');
    }

    // What's included from database
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

  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  if (isError || !Array.isArray(plans) || plans.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No subscription plans available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Plan</h2>
        <p className="text-gray-600">Select the perfect plan for your organization</p>
      </div>

      {/* Plans Grid */}
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
            const current = isCurrentPlan(plan.id);
            const features = getFeatures(plan);
            
            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl ${
                  current
                    ? 'border-4 border-green-500 bg-green-50'
                    : popular
                    ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-2xl scale-105'
                    : 'bg-white border-2 border-gray-200 hover:border-indigo-300'
                } p-8 transition-all duration-300 hover:shadow-xl ${popular || current ? '' : 'hover:scale-105'}`}
              >
                {/* Current Plan Badge */}
                {current && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-green-500 text-white text-sm font-bold rounded-full shadow-lg">
                    Current Plan
                  </div>
                )}

                {/* Most Popular Badge */}
                {popular && !current && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-yellow-400 text-gray-900 text-sm font-bold rounded-full shadow-lg">
                    Most Popular
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-8">
                  <h3 className={`text-2xl font-bold mb-2 capitalize ${
                    current ? 'text-gray-900' : popular ? 'text-white' : 'text-gray-900'
                  }`}>
                    {plan.plan_name}
                  </h3>
                  <div className="mb-4">
                    <span className={`text-5xl font-bold ${
                      current ? 'text-gray-900' : popular ? 'text-white' : 'text-gray-900'
                    }`}>
                      {formatPrice(plan.price, plan.plan_type)}
                    </span>
                    {formatPrice(plan.price, plan.plan_type) !== 'Custom' && (
                      <span className={`text-lg ${
                        current ? 'text-gray-600' : popular ? 'text-indigo-100' : 'text-gray-500'
                      }`}>
                        /{getPeriod(plan.duration_days, plan.plan_type)}
                      </span>
                    )}
                  </div>
                  {plan.description && (
                    <p className={`text-sm ${
                      current ? 'text-gray-700' : popular ? 'text-indigo-100' : 'text-gray-600'
                    }`}>
                      {plan.description}
                    </p>
                  )}
                </div>

                {/* Features List */}
                <ul className="space-y-3 mb-8 min-h-[280px]">
                  {features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check
                        className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                          current ? 'text-green-600' : popular ? 'text-white' : 'text-indigo-600'
                        }`}
                      />
                      <span className={`text-sm leading-relaxed ${
                        current ? 'text-gray-700' : popular ? 'text-white' : 'text-gray-700'
                      }`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Action Button */}
                <button
                  onClick={() => handlePlanSelect(plan)}
                  disabled={current}
                  className={`w-full py-3 font-semibold rounded-lg transition-all ${
                    current
                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      : popular
                      ? 'bg-white text-indigo-600 hover:bg-gray-50 border-2 border-white'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {current 
                    ? 'Current Plan' 
                    : plan.plan_type === 'enterprise' 
                    ? 'Contact Sales' 
                    : 'Select Plan'
                  }
                </button>
              </div>
            );
          })}
      </div>

      {/* Current Subscription Info */}
      {userSubscription && (
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Your current subscription: <span className="font-semibold capitalize">{userSubscription.plan_name}</span>
            {userSubscription.end_date && (
              <> • Valid until {new Date(userSubscription.end_date).toLocaleDateString()}</>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPlans;
