import { PasswordGeneratorOptions } from '@shared/schema';

const LOWERCASE_CHARS = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBER_CHARS = '0123456789';
const SYMBOL_CHARS = '!@#$%^&*()-_=+[]{};:,.<>?';

export function generatePassword(options: PasswordGeneratorOptions): string {
  const { length, uppercase, lowercase, numbers, symbols } = options;
  
  // Ensure at least one option is selected
  if (!uppercase && !lowercase && !numbers && !symbols) {
    throw new Error('At least one character type must be selected');
  }
  
  let charset = '';
  if (uppercase) charset += UPPERCASE_CHARS;
  if (lowercase) charset += LOWERCASE_CHARS;
  if (numbers) charset += NUMBER_CHARS;
  if (symbols) charset += SYMBOL_CHARS;
  
  // Generate initial password
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  
  // Ensure the password meets the selected requirements
  let meetsRequirements = true;
  if (uppercase && !/[A-Z]/.test(password)) meetsRequirements = false;
  if (lowercase && !/[a-z]/.test(password)) meetsRequirements = false;
  if (numbers && !/[0-9]/.test(password)) meetsRequirements = false;
  if (symbols && !/[!@#$%^&*\(\)-_=+\[\]{};:,.<>?]/.test(password)) meetsRequirements = false;
  
  // If the generated password doesn't meet requirements, generate again
  return meetsRequirements ? password : generatePassword(options);
}

export function checkPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  if (!password) {
    return { score: 0, label: 'Пароль не указан', color: 'bg-neutral-200' };
  }
  
  let score = 0;
  
  // Length check
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  
  // Character variety
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  
  // Calculate the final score (0-5)
  const finalScore = Math.min(5, Math.floor(score / 2));
  
  // Define strength labels and colors
  const strengthLabels = [
    'Очень слабый',
    'Слабый',
    'Средний',
    'Хороший',
    'Сильный',
    'Очень сильный'
  ];
  
  const strengthColors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-yellow-400',
    'bg-green-500',
    'bg-green-600'
  ];
  
  return {
    score: finalScore,
    label: strengthLabels[finalScore],
    color: strengthColors[finalScore]
  };
}
