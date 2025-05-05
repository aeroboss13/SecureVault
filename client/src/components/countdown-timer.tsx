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
  
  useEffect(() => {
    // Update timer every second
    const timer = setInterval(() => {
      const now = new Date();
      
      if (now >= expiresAt) {
        setTimeLeft("Expired");
        setPercentage(0);
        clearInterval(timer);
        return;
      }
      
      setTimeLeft(formatExpiryTime(expiresAt));
      setPercentage(getExpiryPercentage(expiresAt));
    }, 1000);
    
    return () => clearInterval(timer);
  }, [expiresAt]);
  
  const isExpiringSoon = percentage < 50;
  
  return (
    <div>
      <div className="flex items-center">
        <Clock className="h-5 w-5 text-white mr-1" />
        <span className="text-sm text-white font-medium">Expires in: {timeLeft}</span>
      </div>
      <div className="w-full h-1 mt-3 bg-white bg-opacity-20 rounded-full overflow-hidden">
        <div
          className={cn(
            "timer-progress h-full bg-white",
            isExpiringSoon && "bg-red-300" 
          )}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}
