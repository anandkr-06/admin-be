import { BadRequestException } from "@nestjs/common";

// common/utils/admin-query.util.ts
export function buildAdminQuery<T>(
    dto: Record<string, any>,
    searchableFields: string[] = [],
  ) {
    const filter: Record<string, any> = {};
  
    // 🔍 Text search
    if (dto.search && searchableFields.length) {
      filter.$or = searchableFields.map((field) => ({
        [field]: { $regex: dto.search, $options: 'i' },
      }));
    }
  
    // 📅 Date range (createdAt)
    if (dto.startDate || dto.endDate) {
      filter.createdAt = {};
      if (dto.startDate) filter.createdAt.$gte = new Date(dto.startDate);
      if (dto.endDate) filter.createdAt.$lte = new Date(dto.endDate);
    }
  
    // ⚙️ Dynamic filters
    for (const [key, value] of Object.entries(dto)) {
      if (
        value !== undefined &&
        ![
          'page',
          'limit',
          'sortBy',
          'sortOrder',
          'search',
          'startDate',
          'endDate',
        ].includes(key)
      ) {
        filter[key] = value;
      }
    }
  
     // ✅ Boolean filters
  if (dto.isActive !== undefined) {
    filter.isActive = dto.isActive === 'true';
  }
  
    return filter;
  }


  export function normalizeTime(time: unknown): string {
  if (time instanceof Date) {
    return time.toISOString().slice(11, 16);
  }

  if (typeof time === 'string') {

    // already 24-hour format
    if (/^\d{2}:\d{2}$/.test(time)) {
      return time;
    }

    const parts = time.split(' ');

    const timePart = parts[0];
    const modifier = parts[1];

    if (!timePart) {
      throw new Error(`Invalid time format: ${time}`);
    }

    const [hourStr, minute] = timePart.split(':');

    let hour = Number(hourStr);

    if (modifier === 'PM' && hour !== 12) hour += 12;
    if (modifier === 'AM' && hour === 12) hour = 0;

    return `${hour.toString().padStart(2, '0')}:${minute}`;
  }

  throw new Error(`Invalid time value: ${JSON.stringify(time)}`);
}

export function calculateSlotDurationInHours(
  startTime: string,
  endTime: string,
): number {
  if (!startTime || !endTime) {
    throw new BadRequestException('Slot time missing');
  }

  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  if (endMinutes <= startMinutes) {
    throw new BadRequestException(
      'Invalid to calculate slot hours!',
    );
  }

  const diffMinutes = endMinutes - startMinutes;

  return diffMinutes / 60;
}

export function timeToMinutes(time: string): number {
  if (!time || typeof time !== 'string') {
    throw new BadRequestException(`Invalid time value: ${time}`);
  }

  const normalized = time.trim();

  // 24-hour format: "09:00" or "09:00:00"
  const twentyFourHr = normalized.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (twentyFourHr) {
    const hour = Number(twentyFourHr[1]);
    const minute = Number(twentyFourHr[2]);

    if (hour > 23 || minute > 59) {
      throw new BadRequestException(`Invalid 24h time: ${time}`);
    }

    return hour * 60 + minute;
  }

  // 12-hour format: "09:00 AM"
  const twelveHr = normalized.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
  
  if (twelveHr) {
    let hour = Number(twelveHr[1]);
    const minute = Number(twelveHr[2]);
    if(!twelveHr[3]){
      throw new BadRequestException(`Getting time format error.`)
    }
    const meridian = twelveHr[3].toUpperCase();

    if (hour > 12 || minute > 59) {
      throw new BadRequestException(`Invalid 12h time: ${time}`);
    }

    if (meridian === 'PM' && hour !== 12) hour += 12;
    if (meridian === 'AM' && hour === 12) hour = 0;

    return hour * 60 + minute;
  }

  throw new BadRequestException(`Invalid time format: ${time}`);
}


type Transaction = {
  amount: number;
  discountPercent: number;
};

export function getDiscountSummary(transactions: Transaction[]) {
  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

  const totalDiscount = transactions.reduce(
    (sum, t) => sum + (t.amount * t.discountPercent) / 100,
    0
  );

  return {
    totalAmount,
    totalDiscount,
    effectiveDiscount: totalAmount
      ? (totalDiscount / totalAmount) * 100
      : 0,
  };
}

// const transactions: Transaction[] = [
//   { amount: 100, discountPercent: 5 },
//   { amount: 200, discountPercent: 10 },
//   { amount: 50, discountPercent: 0 },
// ];
// console.log(getDiscountSummary(transactions));