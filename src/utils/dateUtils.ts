// Simple date utilities without external dependencies

export const formatDate = (date: Date, formatStr: string = 'MMM dd, yyyy'): string => {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const dayOfWeek = date.getDay();

  const pad = (num: number): string => num.toString().padStart(2, '0');

  switch (formatStr) {
    case 'MMM dd, yyyy':
      return `${months[month]} ${pad(day)}, ${year}`;
    case 'yyyy-MM-dd':
      return `${year}-${pad(month + 1)}-${pad(day)}`;
    case 'HH:mm':
      return `${pad(hours)}:${pad(minutes)}`;
    case 'MMM dd, HH:mm':
      return `${months[month]} ${pad(day)}, ${pad(hours)}:${pad(minutes)}`;
    case 'MM/dd':
      return `${pad(month + 1)}/${pad(day)}`;
    case 'EEEE':
      return days[dayOfWeek];
    default:
      return `${months[month]} ${pad(day)}, ${year}`;
  }
};

export const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
};

export const startOfWeek = (date: Date, options: { weekStartsOn: number } = { weekStartsOn: 1 }): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day - options.weekStartsOn;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const endOfWeek = (date: Date, options: { weekStartsOn: number } = { weekStartsOn: 1 }): Date => {
  const d = startOfWeek(date, options);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
};

export const startOfMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
};

export const endOfMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
};

export const differenceInDays = (laterDate: Date, earlierDate: Date): number => {
  const timeDiff = laterDate.getTime() - earlierDate.getTime();
  return Math.floor(timeDiff / (1000 * 60 * 60 * 24));
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const subDays = (date: Date, days: number): Date => {
  return addDays(date, -days);
};
