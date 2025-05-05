export function formatDateTime(date: Date): string {
  const isToday = new Date().toDateString() === new Date(date).toDateString();
  
  if (isToday) {
    return `Today at ${formatTime(date)}`;
  }
  
  const isYesterday = 
    new Date(new Date().setDate(new Date().getDate() - 1)).toDateString() === 
    new Date(date).toDateString();
  
  if (isYesterday) {
    return `Yesterday at ${formatTime(date)}`;
  }
  
  return `${formatDate(date)} at ${formatTime(date)}`;
}

export function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

export function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}

export function formatExpiryTime(expiresAt: Date): string {
  const now = new Date();
  const expires = new Date(expiresAt);
  
  if (expires <= now) {
    return "Expired";
  }
  
  const diffMs = expires.getTime() - now.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`;
  }
  
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  
  return `${hours}:${minutes.toString().padStart(2, '0')}`;
}

export function getExpiryPercentage(expiresAt: Date): number {
  const now = new Date();
  const expires = new Date(expiresAt);
  const createdOneHourAgo = new Date(expires);
  createdOneHourAgo.setHours(createdOneHourAgo.getHours() - 1);
  
  if (expires <= now) {
    return 0;
  }
  
  const totalDuration = expires.getTime() - createdOneHourAgo.getTime();
  const elapsed = now.getTime() - createdOneHourAgo.getTime();
  const remaining = totalDuration - elapsed;
  
  return Math.max(0, Math.min(100, (remaining / totalDuration) * 100));
}

export function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  if (diffMinutes < 1) {
    return "just now";
  }
  
  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
  }
  
  const diffHours = Math.floor(diffMinutes / 60);
  
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  }
  
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  }
  
  return formatDate(date);
}
