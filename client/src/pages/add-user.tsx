import { useState } from "react";
import { useLocation } from "wouter";
import Header from "@/components/layout/header";
import MultiStepForm from "@/components/multi-step-form";
import ProgressIndicator from "@/components/progress-indicator";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function AddUser() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const handleBack = () => {
    setLocation("/dashboard");
  };

  return (
    <div className="min-h-screen">
      <Header title="Add New User" />
      <main className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Add New User</h1>
                <p className="text-sm text-gray-600">Create a new user account</p>
              </div>
            </div>

            <ProgressIndicator
              currentStep={currentStep}
              totalSteps={totalSteps}
            />
          </div>

          <MultiStepForm
            currentStep={currentStep}
            totalSteps={totalSteps}
            onStepChange={setCurrentStep}
            onSuccess={() => setLocation("/dashboard")}
          />
        </div>
      </main>
    </div>
  );
}
