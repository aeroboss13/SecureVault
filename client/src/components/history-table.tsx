import { formatDateTime, getTimeRemaining } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { 
  Calendar, 
  Eye, 
  Trash2, 
  AlertCircle,
  CheckCircle,
  Clock
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
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute to refresh expiry timers
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  if (logs.length === 0) {
    return (
      <div className="text-center py-10 text-neutral-500">
        No activity logs found.
      </div>
    );
  }
  
  // Перевод действий на русский язык
  const translateAction = (action: string): string => {
    switch (action) {
      case "Created Password":
        return "Создан пароль";
      case "Created Share":
        return "Создана ссылка";
      case "Password Viewed":
        return "Пароль просмотрен";
      case "Revoked Share":
        return "Доступ отозван";
      case "Link Expired":
        return "Срок действия истек";
      default:
        return action;
    }
  };

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
  
  // Перевод статусов на русский язык
  const translateStatus = (status: string | null): string => {
    if (!status) return "";
    
    switch (status.toLowerCase()) {
      case "active":
        return "Активен";
      case "success":
        return "Успешно";
      case "viewed":
        return "Просмотрен";
      case "complete":
        return "Завершен";
      case "expired":
        return "Истек";
      case "revoked":
        return "Отозван";
      default:
        return status;
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
              Действие
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Сервис
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Имя пользователя
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Дата
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Просмотрен
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Истекает через
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Статус
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-neutral-200">
          {logs.map((log) => {
            const { icon, bgColor, textColor } = getActionInfo(log.action);
            const showExpiry = log.action === "Password Viewed";
            
            return (
              <tr key={log.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className={cn("flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full", bgColor, textColor)}>
                      {icon}
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-neutral-900">
                        {translateAction(log.action)}
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
                  {log.action === "Password Viewed" && log.viewedAt ? 
                    formatDateTime(new Date(log.viewedAt)) : 
                    formatDateTime(new Date(log.createdAt))
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                  {log.viewedAt ? formatDateTime(new Date(log.viewedAt)) : "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                  {(log.action === "Created Share" || log.action === "Password Viewed") && log.expiresAt ? 
                    <div className="flex flex-col">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1.5 text-neutral-400" />
                        <span className={new Date(log.expiresAt) > currentTime ? 
                          "text-green-600 font-medium" : "text-red-600 font-medium"}>
                          {new Date(log.expiresAt) > currentTime ? 
                            getTimeRemaining(log.expiresAt) : 
                            "Истекла"
                          }
                        </span>
                      </div>
                      <div className="text-xs text-neutral-400 mt-1">
                        {log.action === "Created Share" ? 
                          (log.viewedAt ? "После просмотра (1 час)" : "До первого доступа (2 недели)") :
                          "После просмотра (1 час)"
                        }
                      </div>
                    </div> : 
                    "-"
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {log.status && (
                    <span className={cn(
                      "px-2.5 py-0.5 inline-flex text-xs leading-5 font-medium rounded-full",
                      getStatusStyle(log.status)
                    )}>
                      {translateStatus(log.status)}
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
