import dayjs from 'dayjs';

export const dateService = {
    format: (date: string | Date, pattern: string = 'DD/MM/YYYY') => dayjs(date).format(pattern),
    getCurrentMonth: () => dayjs().format('MM/YYYY'),
};