import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

import Navbar from "@/components/navbar";
import HistoryTable from "@/components/history-table";

export default function History() {
  const { user } = useAuth();
  
  // Default empty array for type safety
  const defaultLogs: any[] = [];
  
  // Fetch activity logs
  const { data: logsData, isLoading: logsLoading } = useQuery<typeof defaultLogs>({
    queryKey: ["/api/logs"],
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: false
  });
  
  // Use the data with default
  const logs = logsData || defaultLogs;
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow fade-in py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-heading font-bold text-neutral-900">Password History</h1>
          <p className="mt-1 text-sm text-neutral-600">View a complete history of password sharing and access</p>
        </div>
        
        {/* Full History Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 border-b border-neutral-200 sm:px-6">
            <h3 className="text-lg leading-6 font-heading font-medium text-neutral-900">
              Activity Log
            </h3>
            <p className="mt-1 text-sm text-neutral-500">
              Complete history of password sharing, viewing, and other activities.
            </p>
          </div>
          
          {logsLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          ) : (
            <HistoryTable logs={logs} />
          )}
        </div>
      </main>
      
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-6 px-4 overflow-hidden sm:px-6 lg:px-8">
          <p className="text-center text-sm text-neutral-400">
            &copy; {new Date().getFullYear()} Freshpass. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
