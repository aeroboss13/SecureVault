import { PasswordGeneratorOptions } from '@shared/schema';

const LOWERCASE_CHARS = 'abcdefghjklmnopqrstuvwxyz';
const UPPERCASE_CHARS = 'ABCDEFGHJKLMNOPQRSTUVWXYZ';
const NUMBER_CHARS = '0123456789';
const SYMBOL_CHARS = '!@#$%&*';

/**
 * Генерирует пароль специального формата для всех сервисов:
 * 3 строчные буквы + 4 цифры + 3 прописные буквы + спецсимвол
 */
export function generateSpecialFormatPassword(): string {
  // Выбираем случайные символы из каждой категории
  let lowercase = '';
  let numbers = '';
  let uppercase = '';
  
  // 3 строчные буквы
  for (let i = 0; i < 3; i++) {
    const randomIndex = Math.floor(Math.random() * LOWERCASE_CHARS.length);
    lowercase += LOWERCASE_CHARS[randomIndex];
  }
  
  // 4 цифры
  for (let i = 0; i < 4; i++) {
    const randomIndex = Math.floor(Math.random() * NUMBER_CHARS.length);
    numbers += NUMBER_CHARS[randomIndex];
  }
  
  // 3 прописные буквы
  for (let i = 0; i < 3; i++) {
    const randomIndex = Math.floor(Math.random() * UPPERCASE_CHARS.length);
    uppercase += UPPERCASE_CHARS[randomIndex];
  }
  
  // 1 спецсимвол
  const symbolIndex = Math.floor(Math.random() * SYMBOL_CHARS.length);
  const symbol = SYMBOL_CHARS[symbolIndex];
  
  // Собираем пароль в нужном порядке: 3 строчные + 4 цифры + 3 прописные + спецсимвол
  return lowercase + numbers + uppercase + symbol;
}

export function generatePassword(options: PasswordGeneratorOptions): string {
  const { length, includeUppercase, includeLowercase, includeNumbers, includeSymbols } = options;
  
  // Ensure at least one option is selected
  if (!includeUppercase && !includeLowercase && !includeNumbers && !includeSymbols) {
    throw new Error('At least one character type must be selected');
  }
  
  let charset = '';
  if (includeUppercase) charset += UPPERCASE_CHARS;
  if (includeLowercase) charset += LOWERCASE_CHARS;
  if (includeNumbers) charset += NUMBER_CHARS;
  if (includeSymbols) charset += SYMBOL_CHARS;
  
  // Generate initial password
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  
  // Ensure the password meets the selected requirements
  let meetsRequirements = true;
  if (includeUppercase && !/[A-Z]/.test(password)) meetsRequirements = false;
  if (includeLowercase && !/[a-z]/.test(password)) meetsRequirements = false;
  if (includeNumbers && !/[0-9]/.test(password)) meetsRequirements = false;
  if (includeSymbols && !/[!@#$%^&*\(\)-_=+\[\]{};:,.<>?]/.test(password)) meetsRequirements = false;
  
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
