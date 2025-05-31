import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ArrowLeft, Mail, Phone, MapPin, Globe, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/header";
import { type ExternalUser } from "@shared/schema";

export default function ViewUser() {
  const [location, setLocation] = useLocation();
  
  // Extract user ID and type from URL
  const pathParts = location.split('/');
  const userId = pathParts[2];
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const userType = urlParams.get('type') || 'external';
  
  const { data: user, isLoading, error } = useQuery<ExternalUser>({
    queryKey: userType === 'local' ? ['/api/users', userId] : ['/api/external-users'],
    select: (data: any) => {
      if (userType === 'local') {
        return data;
      } else {
        // For external users, find the specific user from the array
        return Array.isArray(data) ? data.find((u: any) => u.id.toString() === userId) : data;
      }
    },
    enabled: !!userId,
  });

  const handleBack = () => {
    setLocation("/dashboard");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header title="User Details" />
        <main className="p-6">
          <div className="glass-card backdrop-blur-sm rounded-2xl border border-white/30 p-8 text-center shadow-beautiful">
            <div className="inline-flex items-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              <span className="text-gray-700 font-medium">Loading user details...</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen">
        <Header title="User Details" />
        <main className="p-6">
          <div className="glass-card backdrop-blur-sm rounded-2xl border border-red-200/50 p-8 text-center shadow-beautiful">
            <h3 className="text-xl font-bold text-gray-900 mb-3">User not found</h3>
            <p className="text-gray-600 font-medium mb-4">
              The requested user could not be found.
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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "from-purple-500 to-pink-500",
      "from-blue-500 to-cyan-500",
      "from-green-500 to-emerald-500",
      "from-orange-500 to-red-500",
      "from-pink-500 to-rose-500",
      "from-indigo-500 to-purple-500",
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  const initials = getInitials(user.name);
  const avatarColor = getAvatarColor(user.name);

  return (
    <div className="min-h-screen">
      <Header title="User Details" />
      <main className="p-6">
        <div className="max-w-4xl mx-auto">
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
            {/* Header Section */}
            <div className="flex items-center space-x-6 mb-8">
              <div
                className={`w-20 h-20 bg-gradient-to-br ${avatarColor} rounded-2xl flex items-center justify-center text-white font-bold shadow-lg`}
              >
                <span className="text-2xl">{initials}</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-lg text-purple-600 font-medium">@{user.username}</p>
                {userType === 'local' && (
                  <span className="inline-block px-3 py-1 text-sm bg-green-100 text-green-700 rounded-full mt-2">
                    Local User
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Contact Information */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h3>
                
                <div className="flex items-center space-x-4 p-4 bg-gray-50/50 rounded-xl">
                  <Mail className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-gray-50/50 rounded-xl">
                  <Phone className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium text-gray-900">{user.phone || 'Not provided'}</p>
                  </div>
                </div>

                {user.website && (
                  <div className="flex items-center space-x-4 p-4 bg-gray-50/50 rounded-xl">
                    <Globe className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-600">Website</p>
                      <p className="font-medium text-blue-600">{user.website}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Address & Company */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Additional Information</h3>
                
                <div className="flex items-start space-x-4 p-4 bg-gray-50/50 rounded-xl">
                  <MapPin className="w-5 h-5 text-blue-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <div className="font-medium text-gray-900">
                      {userType === 'local' ? (
                        <div>
                          <p>{(user as any).street || 'Not provided'}</p>
                          <p>{(user as any).city}</p>
                          <p>{(user as any).zipcode || 'Not provided'}</p>
                        </div>
                      ) : (
                        <div>
                          <p>{user.address?.street}</p>
                          <p>{user.address?.city}</p>
                          <p>{user.address?.zipcode}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {user.company?.name && (
                  <div className="flex items-center space-x-4 p-4 bg-gray-50/50 rounded-xl">
                    <Building className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="text-sm text-gray-600">Company</p>
                      <p className="font-medium text-gray-900">{user.company.name}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
              {userType === 'local' && (
                <Button
                  onClick={() => setLocation(`/edit-user/${user.id}`)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 rounded-xl font-medium shadow-md"
                >
                  Edit User
                </Button>
              )}
              <Button
                variant="outline"
                onClick={handleBack}
                className="rounded-xl font-medium"
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}