import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDateTime, formatExpiryTime, getExpiryPercentage, getTimeRemaining } from "@/lib/date-utils";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Copy, Trash2, ExternalLink, AtSign, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PasswordShare {
  id: number;
  entryId: number;
  adminId: number;
  recipientEmail: string;
  shareToken: string;
  expiresAt: string;
  createdAt: string;
  viewed: boolean;
  viewedAt: string | null;
  active: boolean;
}

interface PasswordEntry {
  id: number;
  adminId: number;
  serviceName: string;
  serviceUrl: string | null;
  username: string;
  password: string;
  createdAt: string;
}

interface ActiveSharesTableProps {
  shares: {
    share: PasswordShare;
    entry: PasswordEntry;
  }[];
}

export default function ActiveSharesTable({ shares = [] }: ActiveSharesTableProps) {
  const { toast } = useToast();
  
  // Filter active shares and sort by most recent first
  const activeShares = shares && shares.length > 0
    ? shares
        .filter(s => s && s.share && s.share.active && new Date(s.share.expiresAt) > new Date())
        .sort((a, b) => new Date(b.share.createdAt).getTime() - new Date(a.share.createdAt).getTime())
    : [];
  
  // Mutation to revoke a share
  const revokeShareMutation = useMutation({
    mutationFn: async (shareId: number) => {
      return apiRequest("DELETE", `/api/shares/${shareId}`);
    },
    onSuccess: () => {
      // Invalidate query cache to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/shares"] });
      queryClient.invalidateQueries({ queryKey: ["/api/logs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      
      toast({
        title: "Share revoked",
        description: "The shared password link has been revoked.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to revoke: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Handle link copy to clipboard
  const handleCopyLink = (shareToken: string) => {
    const url = `${window.location.origin}/view/${shareToken}`;
    navigator.clipboard.writeText(url);
    
    toast({
      title: "Link copied",
      description: "Share link copied to clipboard.",
    });
  };
  
  // Handle share revocation
  const handleRevokeShare = (shareId: number) => {
    if (confirm("Are you sure you want to revoke this shared password? This action cannot be undone.")) {
      revokeShareMutation.mutate(shareId);
    }
  };
  
  if (activeShares.length === 0) {
    return (
      <div className="text-center py-10 text-neutral-500">
        No active password shares found.
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-neutral-200">
        <thead className="bg-neutral-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Service
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Recipient
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Created
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Viewed
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Expires In
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-neutral-200">
          {activeShares.map(({ share, entry }) => {
            // Show timer if link has expiration
            const hasExpiration = share.expiresAt;
            const isViewed = share.viewed;
            const expiryTimeText = hasExpiration ? formatExpiryTime(new Date(share.expiresAt)) : "";
            const expiryPercentage = hasExpiration ? getExpiryPercentage(new Date(share.expiresAt)) : 0;
            // Different warning logic for viewed vs unviewed links
            const isExpiringSoon = hasExpiration && (
              isViewed 
                ? expiryPercentage <= 50  // For 1-hour timer, warn when 30min left
                : expiryPercentage <= 10  // For 2-week timer, warn when ~1 day left
            );
            const timeRemaining = hasExpiration ? getTimeRemaining(share.expiresAt) : "";
            const expiresInClass = isExpiringSoon ? "text-red-600 font-medium" : "text-green-600 font-medium";
            
            return (
              <tr key={share.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-md bg-primary-100 text-primary-700">
                      {entry.serviceUrl ? (
                        <Globe className="h-6 w-6" />
                      ) : (
                        <AtSign className="h-6 w-6" />
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-neutral-900">
                        {entry.serviceName}
                      </div>
                      <div className="text-sm text-neutral-500">
                        {entry.username}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-neutral-900">{share.recipientEmail}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-neutral-500">{formatDateTime(new Date(share.createdAt))}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-neutral-500">
                    {share.viewedAt ? formatDateTime(new Date(share.viewedAt)) : "Not viewed yet"}
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    {share.viewed 
                      ? "Active for 1 hour after viewing" 
                      : "Valid for 2 weeks from creation"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {hasExpiration ? (
                    <div className="flex items-center">
                      <svg className={cn(
                        "h-5 w-5 mr-1.5",
                        isExpiringSoon ? "text-red-500" : "text-green-500"
                      )} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className={cn("text-sm", expiresInClass)}>
                        {timeRemaining}
                      </span>
                    </div>
                  ) : (
                    <div className="text-sm text-neutral-500">
                      {share.viewed ? "Expired after viewing" : "Initial access period expired"}
                    </div>
                  )}
                  {hasExpiration && (
                    <div className="w-full h-1.5 mt-1 bg-neutral-200 rounded-full overflow-hidden">
                      <div className={cn(
                        "timer-progress h-full",
                        isExpiringSoon ? "bg-red-500" : "bg-green-500"
                      )} style={{ width: `${expiryPercentage}%` }}></div>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={cn(
                    "px-2.5 py-0.5 inline-flex text-xs leading-5 font-medium rounded-full",
                    share.viewed
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  )}>
                    {share.viewed ? "Viewed" : "Not viewed"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary-600 hover:text-primary-900 flex items-center h-8"
                      onClick={() => handleCopyLink(share.shareToken)}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy Link
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-900 flex items-center h-8"
                      onClick={() => handleRevokeShare(share.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Revoke
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
