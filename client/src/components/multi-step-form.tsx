import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { insertUserSchema, type InsertUser } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Check, Info } from "lucide-react";

const formSchema = insertUserSchema.extend({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

type FormData = z.infer<typeof formSchema> & {
  firstName: string;
  lastName: string;
};

interface MultiStepFormProps {
  currentStep: number;
  totalSteps: number;
  onStepChange: (step: number) => void;
  onSuccess: () => void;
}

export default function MultiStepForm({
  currentStep,
  totalSteps,
  onStepChange,
  onSuccess,
}: MultiStepFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      name: "",
      username: "",
      email: "",
      phone: "",
      street: "",
      city: "",
      zipcode: "",
      state: "",
    },
  });

  const { watch, setValue, trigger, getValues } = form;
  const watchedValues = watch();

  // Update full name when first/last name changes
  const firstName = watch("firstName");
  const lastName = watch("lastName");
  if (firstName || lastName) {
    const fullName = `${firstName} ${lastName}`.trim();
    if (fullName !== watchedValues.name) {
      setValue("name", fullName);
    }
  }

  const createUserMutation = useMutation({
    mutationFn: async (userData: InsertUser) => {
      const response = await apiRequest("POST", "/api/users", userData);
      if (!response.ok) {
        throw new Error(`Failed to create user: ${response.statusText}`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/external-users"] });
      toast({
        title: "Success!",
        description: "User created successfully.",
      });
      onSuccess();
    },
    onError: (error) => {
      console.error("User creation error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create user.",
        variant: "destructive",
      });
    },
  });

  const validateCurrentStep = async () => {
    let fieldsToValidate: (keyof FormData)[] = [];

    switch (currentStep) {
      case 1:
        fieldsToValidate = ["firstName", "lastName", "email", "phone"];
        break;
      case 2:
        fieldsToValidate = ["street", "city", "zipcode"];
        break;
      case 3:
        fieldsToValidate = [];
        break;
    }

    if (fieldsToValidate.length > 0) {
      return await trigger(fieldsToValidate);
    }
    return true;
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid && currentStep < totalSteps) {
      onStepChange(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      onStepChange(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      const values = getValues();
      
      // Generate username from name if not provided
      if (!values.username) {
        const username = values.name
          .toLowerCase()
          .replace(/\s+/g, "")
          .slice(0, 20);
        setValue("username", username);
      }

      const userData: InsertUser = {
        name: values.name,
        username: values.username || values.name.toLowerCase().replace(/\s+/g, ""),
        email: values.email,
        phone: values.phone || "",
        street: values.street || "",
        city: values.city,
        zipcode: values.zipcode || "",
        state: values.state || "",
      };

      await createUserMutation.mutateAsync(userData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Step 1: Basic Info */}
      {currentStep === 1 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Basic Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="firstName">
                First Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="firstName"
                {...form.register("firstName")}
                placeholder="Enter first name"
                className="mt-2"
              />
              {form.formState.errors.firstName && (
                <p className="mt-1 text-sm text-red-500">
                  {form.formState.errors.firstName.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="lastName">
                Last Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lastName"
                {...form.register("lastName")}
                placeholder="Enter last name"
                className="mt-2"
              />
              {form.formState.errors.lastName && (
                <p className="mt-1 text-sm text-red-500">
                  {form.formState.errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <Label htmlFor="email">
              Email Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              {...form.register("email")}
              placeholder="Enter email address"
              className="mt-2"
            />
            {form.formState.errors.email && (
              <p className="mt-1 text-sm text-red-500">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="mt-6">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              {...form.register("phone")}
              placeholder="Enter phone number"
              className="mt-2"
            />
          </div>
        </div>
      )}

      {/* Step 2: Address */}
      {currentStep === 2 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Address Information
          </h3>

          <div className="space-y-6">
            <div>
              <Label htmlFor="street">
                Street Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="street"
                {...form.register("street")}
                placeholder="Enter street address"
                className="mt-2"
              />
              {form.formState.errors.street && (
                <p className="mt-1 text-sm text-red-500">
                  {form.formState.errors.street.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="city">
                  City <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="city"
                  {...form.register("city")}
                  placeholder="Enter city"
                  className="mt-2"
                />
                {form.formState.errors.city && (
                  <p className="mt-1 text-sm text-red-500">
                    {form.formState.errors.city.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="zipcode">
                  ZIP Code <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="zipcode"
                  {...form.register("zipcode")}
                  placeholder="Enter ZIP code"
                  className="mt-2"
                />
                {form.formState.errors.zipcode && (
                  <p className="mt-1 text-sm text-red-500">
                    {form.formState.errors.zipcode.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="state">State/Province</Label>
              <Select
                value={watchedValues.state || ""}
                onValueChange={(value) => setValue("state", value)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select a state" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CA">California</SelectItem>
                  <SelectItem value="NY">New York</SelectItem>
                  <SelectItem value="TX">Texas</SelectItem>
                  <SelectItem value="FL">Florida</SelectItem>
                  <SelectItem value="IL">Illinois</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {currentStep === 3 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Review & Confirm
          </h3>

          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Basic Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <span className="ml-2 font-medium">
                    {watchedValues.firstName} {watchedValues.lastName}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Email:</span>
                  <span className="ml-2 font-medium">{watchedValues.email}</span>
                </div>
                <div>
                  <span className="text-gray-600">Phone:</span>
                  <span className="ml-2 font-medium">
                    {watchedValues.phone || "Not provided"}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Address Information</h4>
              <div className="text-sm">
                <div className="mb-2">
                  <span className="text-gray-600">Street:</span>
                  <span className="ml-2 font-medium">{watchedValues.street}</span>
                </div>
                <div className="mb-2">
                  <span className="text-gray-600">City:</span>
                  <span className="ml-2 font-medium">{watchedValues.city}</span>
                </div>
                <div className="mb-2">
                  <span className="text-gray-600">ZIP:</span>
                  <span className="ml-2 font-medium">{watchedValues.zipcode}</span>
                </div>
                <div>
                  <span className="text-gray-600">State:</span>
                  <span className="ml-2 font-medium">
                    {watchedValues.state || "Not provided"}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <Info className="text-blue-500 mt-0.5 mr-3 w-4 h-4 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">
                    Ready to Create User
                  </h4>
                  <p className="text-sm text-blue-700">
                    Please review the information above and click "Create User" to proceed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Navigation */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex justify-between">
          {currentStep > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={isSubmitting}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}

          <div className="flex space-x-4 ml-auto">
            <Button variant="outline" type="button">
              Save Draft
            </Button>

            {currentStep < totalSteps ? (
              <Button type="button" onClick={handleNext} className="bg-primary hover:bg-blue-600">
                Next Step
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  "Creating..."
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Create User
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
