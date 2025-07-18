import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

import Navbar from "@/components/navbar";
import StatsCards from "@/components/stats-cards";
import CreatePasswordForm from "@/components/create-password-form";
import ActiveSharesTable from "@/components/active-shares-table";
import HistoryTable from "@/components/history-table";

import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { user } = useAuth();
  const [showHistoryAll, setShowHistoryAll] = useState(false);
  
  // Define default empty objects for type safety
  const defaultStats = {
    activeShares: 0,
    sharedToday: 0,
    expiringShares: 0,
    viewedShares: 0
  };
  
  const defaultShares: { share: any; entry: any }[] = [];
  const defaultLogs: any[] = [];
  
  // Fetch stats data
  const { data: statsData, isLoading: statsLoading } = useQuery<typeof defaultStats>({
    queryKey: ["/api/stats"],
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false
  });
  
  // Fetch active shares data
  const { data: sharesData, isLoading: sharesLoading } = useQuery<typeof defaultShares>({
    queryKey: ["/api/shares"],
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: false
  });
  
  // Fetch activity logs
  const { data: logsData, isLoading: logsLoading } = useQuery<typeof defaultLogs>({
    queryKey: ["/api/logs"],
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false
  });
  
  // Use the data with defaults
  const stats = statsData || defaultStats;
  const shares = sharesData || defaultShares;
  const logs = logsData || defaultLogs;
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <main className="flex-grow fade-in py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-heading font-bold text-neutral-900 dark:text-white">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-gray-300">Manage password sharing and track user access</p>
        </div>
        
        {/* Stats Cards */}
        {statsLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        ) : (
          <StatsCards stats={stats} />
        )}
        
        {/* Create New Password Section */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg leading-6 font-heading font-semibold text-neutral-900 dark:text-white mb-4">
              Create New Password Entry
            </h2>
            <CreatePasswordForm />
          </div>
        </div>
        
        {/* Active Password Shares */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-8">
          <div className="px-4 py-5 border-b border-neutral-200 dark:border-gray-600 sm:px-6">
            <h3 className="text-lg leading-6 font-heading font-medium text-neutral-900 dark:text-white">
              Active Password Shares
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-gray-300">
              One-time links that have been generated and are still active.
            </p>
          </div>
          
          {sharesLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          ) : (
            <ActiveSharesTable shares={shares} />
          )}
        </div>
        
        {/* Recent Activity / History */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-4 py-5 border-b border-neutral-200 dark:border-gray-600 sm:px-6">
            <h3 className="text-lg leading-6 font-heading font-medium text-neutral-900 dark:text-white">
              Recent Activity
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-gray-300">
              Password sharing history and access logs.
            </p>
          </div>
          
          {logsLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          ) : (
            <HistoryTable logs={showHistoryAll ? logs : logs?.slice(0, 5)} />
          )}
          
          <div className="px-4 py-3 bg-neutral-50 dark:bg-gray-700 text-right sm:px-6">
            <Button
              variant="outline"
              onClick={() => setShowHistoryAll(!showHistoryAll)}
            >
              {showHistoryAll ? "Show Less" : "View All History"}
            </Button>
          </div>
        </div>
      </main>
      
      <footer className="bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto py-6 px-4 overflow-hidden sm:px-6 lg:px-8">
          <p className="text-center text-sm text-neutral-400 dark:text-gray-300">
            &copy; {new Date().getFullYear()} Freshpass. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
