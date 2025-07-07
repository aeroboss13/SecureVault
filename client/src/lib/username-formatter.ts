// Утилита для форматирования имен пользователей
export function formatUsername(username: string, serviceName: string): string {
  console.log('formatUsername called:', { username, serviceName });
  
  if (!username.trim()) return username;
  
  const cleanUsername = username.trim();
  
  if (serviceName === "AD/терминал") {
    // Добавляем префикс crm\ если его нет
    if (!cleanUsername.startsWith("crm\\")) {
      // Убираем существующие префиксы
      const withoutPrefix = cleanUsername.replace(/^(crm\\|ad\\)/, "");
      const result = `crm\\${withoutPrefix}`;
      console.log('Formatted for AD/терминал:', result);
      return result;
    }
    return cleanUsername;
  } else if (serviceName === "CRM") {
    // Всегда добавляем @freshauto.ru в конец
    // Убираем любые существующие суффиксы
    const withoutSuffix = cleanUsername.replace(/@.*$/, "");
    if (withoutSuffix.trim()) {
      const result = `${withoutSuffix}@freshauto.ru`;
      console.log('Formatted for CRM:', result);
      return result;
    }
    return cleanUsername;
  } else {
    // Для остальных сервисов убираем специальное форматирование
    return cleanUsername.replace(/^(crm\\|ad\\)/, "").replace(/@.*$/, "");
  }
}