import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";
import { generateSpecialFormatPassword } from "@/lib/password-generator";

interface PasswordGeneratorFormProps {
  onGenerate: (password: string) => void;
}

export default function PasswordGeneratorForm({ onGenerate }: PasswordGeneratorFormProps) {
  const handleGenerate = () => {
    const password = generateSpecialFormatPassword();
    onGenerate(password);
  };
  
  return (
    <div className="space-y-4">
      <div className="text-sm text-neutral-600 bg-neutral-50 p-3 rounded-lg border">
        <strong>Формат пароля:</strong> 3 строчные буквы + 4 цифры + 3 прописные буквы + спецсимвол
        <br />
        <span className="text-xs text-neutral-500">Пример: abc1234DEF!</span>
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
