import { checkPasswordStrength } from "@/lib/password-generator";
import { cn } from "@/lib/utils";

interface PasswordStrengthMeterProps {
  password: string;
  className?: string;
}

export default function PasswordStrengthMeter({ 
  password, 
  className 
}: PasswordStrengthMeterProps) {
  const { score, label, color } = checkPasswordStrength(password);
  
  return (
    <div className={cn("w-full", className)}>
      <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
        <div 
          className={cn("password-strength-meter h-full", color)} 
          style={{ width: `${Math.max(5, (score / 5) * 100)}%` }} 
        />
      </div>
      <p className="mt-1 text-xs text-neutral-500">{label}</p>
    </div>
  );
}
