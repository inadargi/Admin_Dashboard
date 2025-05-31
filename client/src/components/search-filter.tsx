import { Search, X, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function SearchFilter({
  searchQuery,
  onSearchChange,
}: SearchFilterProps) {
  const handleClear = () => {
    onSearchChange("");
  };

  return (
    <div className="mb-8 glass-card backdrop-blur-sm rounded-2xl border border-white/30 p-6 shadow-beautiful">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search by name or city..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-12 h-12 rounded-xl border-white/30 bg-white/80 backdrop-blur-sm focus:ring-purple-500 focus:border-purple-500 font-medium"
          />
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            className="bg-white/80 border-white/30 hover:bg-red-50 hover:border-red-200 hover:text-red-600 rounded-xl font-medium transition-all duration-300"
          >
            <X className="w-4 h-4 mr-2" />
            Clear
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:from-purple-600 hover:to-pink-600 rounded-xl font-medium shadow-md"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
