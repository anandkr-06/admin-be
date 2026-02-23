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