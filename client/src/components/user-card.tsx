import { type ExternalUser } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Edit2, Eye } from "lucide-react";
import { useLocation } from "wouter";

interface UserCardProps {
  user: ExternalUser & { isLocal?: boolean };
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

export default function UserCard({ user }: UserCardProps) {
  const [, setLocation] = useLocation();
  const initials = getInitials(user.name);
  const avatarColor = getAvatarColor(user.name);

  const handleEdit = () => {
    if (user.isLocal) {
      setLocation(`/edit-user/${user.id}`);
    } else {
      alert("External users cannot be edited. This user is from the JSONPlaceholder API.");
    }
  };

  const handleView = () => {
    setLocation(`/view-user/${user.id}?type=${user.isLocal ? 'local' : 'external'}`);
  };

  return (
    <div className="glass-card backdrop-blur-sm rounded-2xl border border-white/30 dark:border-gray-700/30 p-6 hover-lift shadow-beautiful">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div
            className={`w-14 h-14 bg-gradient-to-br ${avatarColor} rounded-2xl flex items-center justify-center text-white font-bold shadow-lg`}
          >
            <span className="text-lg">{initials}</span>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">{user.name}</h3>
            <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">@{user.username}</p>
            {user.isLocal && (
              <span className="inline-block px-2 py-1 text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full mt-1">
                Local User
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center text-sm text-gray-700 dark:text-gray-300 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl p-3">
          <Mail className="w-4 h-4 mr-3 flex-shrink-0 text-purple-500" />
          <span className="truncate font-medium">{user.email}</span>
        </div>
        <div className="flex items-center text-sm text-gray-700 dark:text-gray-300 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl p-3">
          <Phone className="w-4 h-4 mr-3 flex-shrink-0 text-green-500" />
          <span className="font-medium">{user.phone}</span>
        </div>
        <div className="flex items-center text-sm text-gray-700 dark:text-gray-300 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl p-3">
          <MapPin className="w-4 h-4 mr-3 flex-shrink-0 text-blue-500" />
          <span className="font-medium">{user.address.city}</span>
        </div>
      </div>

      <div className="mt-6 flex space-x-3">
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleView}
          className="flex-1 bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl font-medium"
        >
          <Eye className="w-4 h-4 mr-2" />
          View
        </Button>
      </div>
    </div>
  );
}
