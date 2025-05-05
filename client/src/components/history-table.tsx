import { formatDateTime, getTimeRemaining } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import { 
  Calendar, 
  Eye, 
  Trash2, 
  AlertCircle,
  CheckCircle
} from "lucide-react";

interface ActivityLog {
  id: number;
  adminId: number;
  action: string;
  serviceName: string | null;
  recipientEmail: string | null;
  createdAt: string;
  status: string | null;
  viewedAt: string | null;
  expiresAt: string | null;
}

interface HistoryTableProps {
  logs?: ActivityLog[];
}

export default function HistoryTable({ logs = [] }: HistoryTableProps) {
  if (logs.length === 0) {
    return (
      <div className="text-center py-10 text-neutral-500">
        No activity logs found.
      </div>
    );
  }
  
  // Function to get icon and style based on action
  const getActionInfo = (action: string) => {
    switch (action) {
      case "Created Password":
        return {
          icon: <Calendar className="h-5 w-5" />,
          bgColor: "bg-blue-100",
          textColor: "text-blue-600",
        };
      case "Created Share":
        return {
          icon: <Calendar className="h-5 w-5" />,
          bgColor: "bg-green-100",
          textColor: "text-green-600",
        };
      case "Password Viewed":
        return {
          icon: <Eye className="h-5 w-5" />,
          bgColor: "bg-green-100",
          textColor: "text-green-600",
        };
      case "Revoked Share":
        return {
          icon: <Trash2 className="h-5 w-5" />,
          bgColor: "bg-red-100",
          textColor: "text-red-600",
        };
      case "Link Expired":
        return {
          icon: <AlertCircle className="h-5 w-5" />,
          bgColor: "bg-red-100",
          textColor: "text-red-600",
        };
      default:
        return {
          icon: <CheckCircle className="h-5 w-5" />,
          bgColor: "bg-neutral-100",
          textColor: "text-neutral-600",
        };
    }
  };
  
  // Function to get status badge style
  const getStatusStyle = (status: string | null) => {
    if (!status) return "bg-neutral-100 text-neutral-800";
    
    switch (status.toLowerCase()) {
      case "active":
        return "bg-blue-100 text-blue-800";
      case "success":
        return "bg-blue-100 text-blue-800";
      case "viewed":
        return "bg-green-100 text-green-800";
      case "complete":
        return "bg-green-100 text-green-800";
      case "expired":
        return "bg-red-100 text-red-800";
      case "revoked":
        return "bg-red-100 text-red-800";
      default:
        return "bg-neutral-100 text-neutral-800";
    }
  };
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-neutral-200">
        <thead className="bg-neutral-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Action
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Service
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Recipient
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Date
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Viewed At
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Expires In
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-neutral-200">
          {logs.map((log) => {
            const { icon, bgColor, textColor } = getActionInfo(log.action);
            const showExpiry = log.action === "Password Viewed" || log.action === "Created Share";
            
            return (
              <tr key={log.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className={cn("flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full", bgColor, textColor)}>
                      {icon}
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-neutral-900">
                        {log.action}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                  {log.serviceName || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                  {log.recipientEmail || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                  {formatDateTime(new Date(log.createdAt))}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                  {log.viewedAt ? formatDateTime(new Date(log.viewedAt)) : "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                  {showExpiry ? 
                    <span className={log.expiresAt && new Date(log.expiresAt) > new Date() ? 
                      "text-green-600 font-medium" : "text-red-600 font-medium"}>
                      {getTimeRemaining(log.expiresAt)}
                    </span> : 
                    "-"
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {log.status && (
                    <span className={cn(
                      "px-2.5 py-0.5 inline-flex text-xs leading-5 font-medium rounded-full",
                      getStatusStyle(log.status)
                    )}>
                      {log.status}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
