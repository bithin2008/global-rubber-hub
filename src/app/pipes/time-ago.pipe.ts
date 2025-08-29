import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeAgo',
  standalone: true
})
export class TimeAgoPipe implements PipeTransform {
  transform(value: string | Date): string {
    if (!value) return '';

    const now = new Date();
    const date = value instanceof Date ? value : new Date(value);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    // If more than 24 hours, show the date
    if (days > 0) {
      return this.formatDate(date);
    }

    // If more than 60 minutes, show hours
    if (hours > 0) {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }

    // Show minutes
    if (minutes > 0) {
      return `${minutes} mins ago`;
    }

    // If less than a minute
    return 'just now';
  }

  private formatDate(date: Date): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const currentYear = new Date().getFullYear();
    
    // Format time
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // Convert 0 to 12
    const timeStr = `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;

    // If it's the current year, don't show the year
    if (year === currentYear) {
      return `${day} ${month}, ${timeStr}`;
    }

    return `${day} ${month} ${year}, ${timeStr}`;
  }
}
