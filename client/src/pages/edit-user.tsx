import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";
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
import { ArrowLeft, Save } from "lucide-react";
import Header from "@/components/layout/header";

const editUserSchema = insertUserSchema.extend({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

type EditFormData = z.infer<typeof editUserSchema> & {
  firstName: string;
  lastName: string;
};

export default function EditUser() {
  const [location, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Extract user ID from URL
  const pathParts = location.split('/');
  const userId = pathParts[2];

  const { data: user, isLoading, error } = useQuery<any>({
    queryKey: ['/api/users', userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }
      return response.json();
    },
    enabled: !!userId,
  });

  const form = useForm<EditFormData>({
    resolver: zodResolver(editUserSchema),
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

  const { watch, setValue, reset } = form;

  // Update form when user data loads
  if (user && !form.formState.isDirty) {
    const nameParts = (user.name || '').split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    reset({
      firstName,
      lastName,
      name: user.name || '',
      username: user.username || '',
      email: user.email || '',
      phone: user.phone || "",
      street: user.street || "",
      city: user.city || '',
      zipcode: user.zipcode || "",
      state: user.state || "",
    });
  }

  // Update full name when first/last name changes
  const firstName = watch("firstName");
  const lastName = watch("lastName");
  if (firstName || lastName) {
    const fullName = `${firstName} ${lastName}`.trim();
    if (fullName !== watch("name")) {
      setValue("name", fullName);
    }
  }

  const updateUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const response = await apiRequest("PUT", `/api/users/${userId}`, userData);
      if (!response.ok) {
        throw new Error(`Failed to update user: ${response.statusText}`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId] });
      toast({
        title: "Success!",
        description: "User updated successfully.",
      });
      setLocation("/dashboard");
    },
    onError: (error) => {
      console.error("User update error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user.",
        variant: "destructive",
      });
    },
  });

  const handleBack = () => {
    setLocation("/dashboard");
  };

  const handleSubmit = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      const values = form.getValues();
      
      const userData = {
        name: values.name,
        username: values.username,
        email: values.email,
        phone: values.phone || null,
        street: values.street || null,
        city: values.city,
        zipcode: values.zipcode || null,
        state: values.state || null,
      };

      await updateUserMutation.mutateAsync(userData);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header title="Edit User" />
        <main className="p-6">
          <div className="glass-card backdrop-blur-sm rounded-2xl border border-white/30 p-8 text-center shadow-beautiful">
            <div className="inline-flex items-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              <span className="text-gray-700 font-medium">Loading user data...</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen">
        <Header title="Edit User" />
        <main className="p-6">
          <div className="glass-card backdrop-blur-sm rounded-2xl border border-red-200/50 p-8 text-center shadow-beautiful">
            <h3 className="text-xl font-bold text-gray-900 mb-3">User not found</h3>
            <p className="text-gray-600 font-medium mb-4">
              The requested user could not be found or loaded.
            </p>
            <Button onClick={handleBack} className="bg-primary hover:bg-blue-600">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header title="Edit User" />
      <main className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>

          <div className="glass-card backdrop-blur-sm rounded-2xl border border-white/30 p-8 shadow-beautiful">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit User</h1>

            <form className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
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
                    <Label htmlFor="lastName">Last Name *</Label>
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

                <div className="mt-4">
                  <Label htmlFor="email">Email Address *</Label>
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

                <div className="mt-4">
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

              {/* Address Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="street">Street Address</Label>
                    <Input
                      id="street"
                      {...form.register("street")}
                      placeholder="Enter street address"
                      className="mt-2"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
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
                      <Label htmlFor="zipcode">ZIP Code</Label>
                      <Input
                        id="zipcode"
                        {...form.register("zipcode")}
                        placeholder="Enter ZIP code"
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="state">State/Province</Label>
                    <Select
                      value={watch("state") || ""}
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

              {/* Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={isSubmitting}
                  className="rounded-xl font-medium"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 rounded-xl font-medium shadow-md"
                >
                  {isSubmitting ? (
                    "Saving..."
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}