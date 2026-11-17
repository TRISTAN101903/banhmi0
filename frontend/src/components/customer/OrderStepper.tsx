import React from 'react';
import { CheckCircle2, Clock, Flame, PackageCheck, Bike, Check, XCircle } from 'lucide-react';
import { OrderStatus } from '../../types/index.js';

interface OrderStepperProps {
  status: OrderStatus;
  fulfillmentType: 'DELIVERY' | 'PICKUP';
}

export const OrderStepper: React.FC<OrderStepperProps> = ({ status, fulfillmentType }) => {
  if (status === 'CANCELLED') {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700">
        <XCircle className="w-6 h-6 text-red-500 shrink-0" />
        <div>
          <p className="font-bold text-sm">Đơn hàng đã được hủy</p>
          <p className="text-xs text-red-600">Đơn hàng này không còn được xử lý tiếp.</p>
        </div>
      </div>
    );
  }

  // Define steps
  const steps = [
    { key: 'PENDING', label: 'Chờ xác nhận', icon: Clock },
    { key: 'CONFIRMED', label: 'Đã xác nhận', icon: CheckCircle2 },
    { key: 'PREPARING', label: 'Đang chuẩn bị', icon: Flame },
    fulfillmentType === 'DELIVERY'
      ? { key: 'OUT_FOR_DELIVERY', label: 'Đang giao hàng', icon: Bike }
      : { key: 'READY_FOR_PICKUP', label: 'Sẵn sàng lấy', icon: PackageCheck },
    { key: 'COMPLETED', label: 'Hoàn thành', icon: Check },
  ];

  const getStepIndex = (st: OrderStatus): number => {
    switch (st) {
      case 'PENDING': return 0;
      case 'CONFIRMED': return 1;
      case 'PREPARING': return 2;
      case 'READY_FOR_PICKUP':
      case 'OUT_FOR_DELIVERY': return 3;
      case 'COMPLETED': return 4;
      default: return 0;
    }
  };

  const currentIndex = getStepIndex(status);

  return (
    <div className="w-full py-4">
      <div className="relative flex items-center justify-between">
        {/* Progress connecting line */}
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-gray-200 -z-0">
          <div
            className="h-full bg-brand-green transition-all duration-500"
            style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isDone = idx <= currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={step.key} className="flex flex-col items-center relative z-10">
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all ${
                  isCurrent
                    ? 'bg-brand-red text-white ring-4 ring-brand-red/20 scale-110 shadow-warm'
                    : isDone
                    ? 'bg-brand-green text-white shadow-sm'
                    : 'bg-white border-2 border-gray-300 text-gray-400'
                }`}
              >
                <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span
                className={`text-[11px] sm:text-xs font-semibold mt-2 text-center max-w-[70px] sm:max-w-[90px] ${
                  isCurrent ? 'text-brand-red font-bold' : isDone ? 'text-brand-brown' : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
