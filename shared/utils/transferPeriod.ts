const LONDON_TIME_ZONE = 'Europe/London';

const londonDateParts = (date: Date) => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: LONDON_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  return Object.fromEntries(parts.map(part => [part.type, part.value])) as {
    year: string;
    month: string;
    day: string;
  };
};

export const getLondonDateKey = (date: Date): string => {
  const parts = londonDateParts(date);
  return `${parts.year}-${parts.month}-${parts.day}`;
};

export const getCurrentTransferPeriod = (date = new Date()) => {
  const parts = londonDateParts(date);
  const afterJanuary = Number(parts.month) < 8;
  const januaryYear = Number(parts.year) + (afterJanuary ? 0 : 1);

  return {
    afterJanuary,
    januaryFirstKey: `${januaryYear}-01-01`,
  };
};

export type TransferPeriodCounts = {
  beforeJanuary: number;
  afterJanuary: number;
};

export const getTransferAvailability = (
  counts: TransferPeriodCounts = { beforeJanuary: 0, afterJanuary: 0 },
  date = new Date(),
) => {
  const { afterJanuary } = getCurrentTransferPeriod(date);
  const totalUsed = counts.beforeJanuary + counts.afterJanuary;

  if (totalUsed >= 4) {
    return {
      disabled: true,
      message: 'All four transfers have been used. No more transfers are available this season.',
    };
  }

  if (!afterJanuary && counts.beforeJanuary >= 2) {
    return {
      disabled: true,
      message: 'The two transfers before 1 January have been used. Two more transfers become available from 1 January.',
    };
  }

  return {
    disabled: false,
    message: '',
  };
};
