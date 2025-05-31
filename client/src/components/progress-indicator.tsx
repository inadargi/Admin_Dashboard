import { cn } from "@/lib/utils";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const steps = [
  { id: 1, name: "Basic Info" },
  { id: 2, name: "Address" },
  { id: 3, name: "Review" },
];

export default function ProgressIndicator({
  currentStep,
  totalSteps,
}: ProgressIndicatorProps) {
  const progressWidth = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-900">Progress</span>
        <span className="text-sm text-gray-600">
          Step {currentStep} of {totalSteps}
        </span>
      </div>
      
      <div className="flex items-center">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex items-center space-x-2">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                  step.id <= currentStep
                    ? "bg-primary text-white"
                    : "bg-gray-200 text-gray-600"
                )}
              >
                {step.id}
              </div>
              <span
                className={cn(
                  "text-sm font-medium",
                  step.id <= currentStep ? "text-primary" : "text-gray-600"
                )}
              >
                {step.name}
              </span>
            </div>
            
            {index < steps.length - 1 && (
              <div className="flex-1 mx-4 h-0.5 bg-gray-200 relative">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{
                    width: step.id < currentStep ? "100%" : step.id === currentStep ? `${progressWidth - (index * (100 / (totalSteps - 1)))}%` : "0%",
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
