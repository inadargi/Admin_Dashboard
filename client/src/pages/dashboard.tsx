import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { type ExternalUser } from "@shared/schema";
import Header from "@/components/layout/header";
import SearchFilter from "@/components/search-filter";
import UserCard from "@/components/user-card";
import { Button } from "@/components/ui/button";
import { Plus, AlertCircle, RefreshCw } from "lucide-react";
import { useLocation } from "wouter";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: externalUsers = [],
    isLoading: isLoadingExternal,
    error: externalError,
    refetch: refetchExternal,
  } = useQuery<ExternalUser[]>({
    queryKey: ["/api/external-users"],
    retry: 3,
    retryDelay: 1000,
  });

  const {
    data: localUsers = [],
    isLoading: isLoadingLocal,
    error: localError,
    refetch: refetchLocal,
  } = useQuery<any[]>({
    queryKey: ["/api/users"],
    retry: 3,
    retryDelay: 1000,
  });

  const isLoading = isLoadingExternal || isLoadingLocal;
  const error = externalError || localError;

  // Combine and transform users for consistent display
  const allUsers = [
    ...externalUsers,
    ...localUsers.map((user) => ({
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone || "",
      address: {
        street: user.street || "",
        city: user.city,
        zipcode: user.zipcode || "",
      },
      website: "",
      company: { name: "" },
      isLocal: true, // Flag to identify local users
    }))
  ];

  const filteredUsers = allUsers.filter((user) => {
    const query = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(query) ||
      user.address.city.toLowerCase().includes(query)
    );
  });

  const handleAddUser = () => {
    setLocation("/add-user");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header title="User Management" />
        <main className="p-6">
          <div className="glass-card backdrop-blur-sm rounded-2xl border border-white/30 p-8 text-center shadow-beautiful">
            <div className="inline-flex items-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              <span className="text-gray-700 font-medium">Loading users...</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <Header title="User Management" />
        <main className="p-6">
          <div className="bg-white rounded-xl border border-red-200 p-8 text-center">
            <div className="text-red-500 mb-4">
              <AlertCircle className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Failed to load users
            </h3>
            <p className="text-gray-600 mb-4">
              {error instanceof Error 
                ? error.message 
                : "Unable to fetch user data from the server."}
            </p>
            <Button onClick={() => { refetchExternal(); refetchLocal(); }} className="bg-primary hover:bg-blue-600">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header title="User Management" />
      <main className="p-6">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Users</h2>
              <p className="text-gray-600 font-medium">
                {allUsers.length} total users • {localUsers.length} local • {externalUsers.length} external
              </p>
            </div>
            <Button 
              onClick={handleAddUser}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 rounded-xl font-medium shadow-lg hover-lift"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        <SearchFilter 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {filteredUsers.length === 0 ? (
          <div className="glass-card backdrop-blur-sm rounded-2xl border border-white/30 p-8 text-center shadow-beautiful">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              No users found
            </h3>
            <p className="text-gray-600 font-medium">
              {searchQuery 
                ? `No users match "${searchQuery}". Try adjusting your search.`
                : "No users available to display."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredUsers.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
