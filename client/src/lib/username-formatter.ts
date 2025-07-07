// Утилита для форматирования имен пользователей
export function formatUsername(username: string, serviceName: string): string {
  if (!username.trim()) return username;
  
  const cleanUsername = username.trim();
  
  switch (serviceName) {
    case "ad\\терминал":
      // Добавляем префикс crm\ если его нет
      if (!cleanUsername.startsWith("crm\\")) {
        // Убираем существующие префиксы
        const withoutPrefix = cleanUsername.replace(/^(crm\\|ad\\)/, "");
        return `crm\\${withoutPrefix}`;
      }
      return cleanUsername;
      
    case "crm":
      // Добавляем суффикс @freshauto.ru если его нет
      if (!cleanUsername.includes("@")) {
        // Убираем существующие суффиксы
        const withoutSuffix = cleanUsername.replace(/@.*$/, "");
        return `${withoutSuffix}@freshauto.ru`;
      }
      return cleanUsername;
      
    default:
      // Для остальных сервисов убираем специальное форматирование
      return cleanUsername.replace(/^(crm\\|ad\\)/, "").replace(/@.*$/, "");
  }
}