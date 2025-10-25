import React, { useMemo } from 'react';

const ParticipationFeeDisplay = ({ plan, amount = 0, showDetails = true }) => {
  const calculations = useMemo(() => {
    if (!plan?.participation_fee_required) {
      return null;
    }

    const feePercentage = plan.participation_fee_percentage || 0;
    const fee = (amount * feePercentage) / 100;
    const total = amount + fee;

    return {
      baseAmount: amount,
      feePercentage,
      feeAmount: fee,
      totalAmount: total,
    };
  }, [plan, amount]);

  if (!plan?.participation_fee_required) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-green-900 text-sm">
          <span className="font-semibold">✓ No Participation Fee</span>
          <br />
          Your election voters can participate for free
        </p>
      </div>
    );
  }

  if (!showDetails || !calculations) {
    return null;
  }

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-3">
      <div>
        <p className="text-orange-900 font-semibold">Participation Fee Structure</p>
        <p className="text-orange-800 text-sm mt-1">
          You can optionally charge voters to participate in your elections.
        </p>
      </div>

      <div className="bg-white rounded p-3 space-y-2 text-sm">
        <div className="flex justify-between text-gray-700">
          <span>Base Amount:</span>
          <span className="font-semibold">${calculations.baseAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-orange-700">
          <span>Participation Fee ({calculations.feePercentage}%):</span>
          <span className="font-semibold">${calculations.feeAmount.toFixed(2)}</span>
        </div>
        <div className="border-t border-gray-200 pt-2 flex justify-between text-gray-900 font-bold">
          <span>Potential Total:</span>
          <span>${calculations.totalAmount.toFixed(2)}</span>
        </div>
      </div>

      <p className="text-orange-800 text-xs">
        Note: Actual participation fees will vary based on voter participation
      </p>
    </div>
  );
};

export default ParticipationFeeDisplay;