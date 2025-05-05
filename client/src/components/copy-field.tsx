import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Copy, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CopyFieldProps {
  value: string;
  type: "text" | "password";
}

export default function CopyField({ value, type }: CopyFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [tooltipText, setTooltipText] = useState("Copy");
  const { toast } = useToast();
  
  const handleCopy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setTooltipText("Copied!");
      
      toast({
        title: "Copied to clipboard",
        description: "The value has been copied to your clipboard.",
      });
      
      setTimeout(() => {
        setTooltipText("Copy");
      }, 2000);
    });
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const inputType = type === "password" 
    ? (showPassword ? "text" : "password") 
    : "text";
  
  return (
    <div className="relative rounded-md shadow-sm">
      <Input 
        type={inputType} 
        value={value} 
        readOnly 
        className="bg-neutral-50 pr-20 block w-full rounded-md border-neutral-300 shadow-sm cursor-text" 
      />
      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
        {type === "password" && (
          <button 
            type="button" 
            className="text-neutral-400 hover:text-neutral-500 cursor-pointer mr-3"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        )}
        <button 
          type="button" 
          className="copy-btn text-neutral-400 hover:text-neutral-500 cursor-pointer"
          onClick={handleCopy}
        >
          <Copy className="h-5 w-5" />
          <span className="copy-tooltip right-10 -top-2 px-2 py-1 text-xs text-white bg-neutral-800 rounded shadow-lg">
            {tooltipText}
          </span>
        </button>
      </div>
    </div>
  );
}
