import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Wand2 } from "lucide-react";
import { PasswordGeneratorOptions } from "@shared/schema";
import { generatePassword } from "@/lib/password-generator";

interface PasswordGeneratorFormProps {
  onGenerate: (password: string) => void;
}

export default function PasswordGeneratorForm({ onGenerate }: PasswordGeneratorFormProps) {
  const [options, setOptions] = useState<PasswordGeneratorOptions>({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });
  
  const handleLengthChange = (value: number[]) => {
    setOptions((prev) => ({ ...prev, length: value[0] }));
  };
  
  const handleOptionChange = (option: keyof Omit<PasswordGeneratorOptions, "length">, checked: boolean) => {
    setOptions((prev) => ({ ...prev, [option]: checked }));
  };
  
  const handleGenerate = () => {
    try {
      const password = generatePassword(options);
      onGenerate(password);
    } catch (error) {
      // At least one option must be selected
      console.error(error);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-neutral-700">Длина пароля: {options.length}</Label>
      </div>
      <Slider
        value={[options.length]}
        min={8}
        max={32}
        step={1}
        onValueChange={handleLengthChange}
        className="w-full"
      />
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="uppercase"
            checked={options.uppercase}
            onCheckedChange={(checked) => handleOptionChange("uppercase", checked)}
          />
          <Label htmlFor="uppercase" className="text-sm">A-Z</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="lowercase"
            checked={options.lowercase}
            onCheckedChange={(checked) => handleOptionChange("lowercase", checked)}
          />
          <Label htmlFor="lowercase" className="text-sm">a-z</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="numbers"
            checked={options.numbers}
            onCheckedChange={(checked) => handleOptionChange("numbers", checked)}
          />
          <Label htmlFor="numbers" className="text-sm">0-9</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="symbols"
            checked={options.symbols}
            onCheckedChange={(checked) => handleOptionChange("symbols", checked)}
          />
          <Label htmlFor="symbols" className="text-sm">!@#$</Label>
        </div>
      </div>
      
      <Button
        type="button"
        variant="outline"
        className="w-full md:w-auto flex items-center justify-center"
        onClick={handleGenerate}
      >
        <Wand2 className="h-4 w-4 mr-2" />
        Сгенерировать пароль
      </Button>
    </div>
  );
}
