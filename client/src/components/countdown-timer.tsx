import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { formatExpiryTime, getExpiryPercentage } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

interface CountdownTimerProps {
  expiresAt: Date;
}

export default function CountdownTimer({ expiresAt }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(formatExpiryTime(expiresAt));
  const [percentage, setPercentage] = useState(getExpiryPercentage(expiresAt));
  const [isExpired, setIsExpired] = useState(new Date() >= expiresAt);
  
  useEffect(() => {
    // Update timer every second
    const timer = setInterval(() => {
      const now = new Date();
      
      if (now >= expiresAt) {
        setTimeLeft("Expired");
        setPercentage(0);
        setIsExpired(true);
        clearInterval(timer);
        return;
      }
      
      setTimeLeft(formatExpiryTime(expiresAt));
      setPercentage(getExpiryPercentage(expiresAt));
    }, 1000);
    
    return () => clearInterval(timer);
  }, [expiresAt]);
  
  const isExpiringSoon = percentage < 30;
  const isWarning = percentage < 50 && percentage >= 30;
  
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Clock className={cn(
            "h-5 w-5 mr-1",
            isExpired ? "text-red-600" : isExpiringSoon ? "text-red-600" : isWarning ? "text-yellow-600" : "text-gray-900"
          )} />
          <span className={cn(
            "text-sm font-medium",
            isExpired ? "text-red-600" : isExpiringSoon ? "text-red-600" : isWarning ? "text-yellow-600" : "text-gray-900"
          )}>
            {isExpired ? "Link has expired" : `Expires in: ${timeLeft}`}
          </span>
        </div>
        
        {!isExpired && (
          <div className="text-xs text-white bg-black bg-opacity-40 rounded-full px-2 py-0.5">
            {Math.floor(percentage)}%
          </div>
        )}
      </div>
      
      <div className="w-full h-2 mt-2 bg-white bg-opacity-20 rounded-full overflow-hidden">
        <div
          className={cn(
            "timer-progress h-full transition-all duration-1000 ease-linear",
            isExpired ? "bg-red-500" : isExpiringSoon ? "bg-red-400" : isWarning ? "bg-yellow-400" : "bg-green-400"
          )}
          style={{ width: isExpired ? "100%" : `${percentage}%` }}
        ></div>
      </div>
      
      {isExpired && (
        <p className="text-xs text-red-300 mt-1">
          This link is no longer accessible.
        </p>
      )}
      
      {isExpiringSoon && !isExpired && (
        <p className="text-xs text-red-300 mt-1">
          Hurry! This link will expire soon.
        </p>
      )}
    </div>
  );
}
