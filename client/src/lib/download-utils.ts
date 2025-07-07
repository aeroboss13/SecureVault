// Utility functions for downloading data as text files

export interface DownloadService {
  serviceName: string;
  serviceUrl?: string | null;
  username: string;
  password: string;
}

export function downloadAsTextFile(
  services: DownloadService[], 
  comment?: string,
  filename: string = 'access-data.txt'
) {
  let content = 'ДАННЫЕ ДЛЯ ВХОДА\n';
  content += '='.repeat(50) + '\n\n';
  
  if (comment) {
    content += 'КОММЕНТАРИЙ АДМИНИСТРАТОРА:\n';
    content += comment + '\n\n';
    content += '='.repeat(50) + '\n\n';
  }
  
  services.forEach((service, index) => {
    content += `СЕРВИС ${index + 1}: ${service.serviceName}\n`;
    content += '-'.repeat(30) + '\n';
    
    if (service.serviceUrl) {
      content += `URL: ${service.serviceUrl}\n`;
    }
    
    content += `Имя пользователя: ${service.username}\n`;
    content += `Пароль: ${service.password}\n\n`;
  });
  
  content += '='.repeat(50) + '\n';
  content += 'ВАЖНО: Сохраните эти данные в безопасном месте и удалите файл после использования.\n';
  content += `Дата создания: ${new Date().toLocaleString('ru-RU')}\n`;
  
  // Create and download file
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function parseBackupFile(fileContent: string): DownloadService[] {
  try {
    // Try to parse as JSON backup file first
    const jsonData = JSON.parse(fileContent);
    if (jsonData.entries && Array.isArray(jsonData.entries)) {
      return jsonData.entries.map((entry: any) => ({
        serviceName: entry.serviceName,
        serviceUrl: entry.serviceUrl,
        username: entry.username,
        password: entry.password,
      }));
    }
  } catch (e) {
    // If JSON parsing fails, try to parse as text file
    const services: DownloadService[] = [];
    const lines = fileContent.split('\n');
    
    let currentService: Partial<DownloadService> = {};
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Skip empty lines and separators
      if (!trimmed || trimmed.startsWith('=') || trimmed.startsWith('-') || 
          trimmed.includes('ДАННЫЕ ДЛЯ ВХОДА') || trimmed.includes('КОММЕНТАРИЙ') ||
          trimmed.includes('ВАЖНО') || trimmed.includes('Дата создания')) {
        continue;
      }
      
      // Check for service name
      if (trimmed.startsWith('СЕРВИС ') && trimmed.includes(':')) {
        // Save previous service if complete
        if (currentService.serviceName && currentService.username && currentService.password) {
          services.push(currentService as DownloadService);
        }
        
        // Start new service
        currentService = {
          serviceName: trimmed.split(':')[1].trim()
        };
      } else if (trimmed.startsWith('URL:')) {
        currentService.serviceUrl = trimmed.substring(4).trim();
      } else if (trimmed.startsWith('Имя пользователя:')) {
        currentService.username = trimmed.substring(17).trim();
      } else if (trimmed.startsWith('Пароль:')) {
        currentService.password = trimmed.substring(7).trim();
      }
    }
    
    // Add last service if complete
    if (currentService.serviceName && currentService.username && currentService.password) {
      services.push(currentService as DownloadService);
    }
    
    return services;
  }
  
  return [];
}