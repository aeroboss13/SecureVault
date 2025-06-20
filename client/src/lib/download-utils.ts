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