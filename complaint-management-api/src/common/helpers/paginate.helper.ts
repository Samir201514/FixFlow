export function paginate<T>(
  items: T[],
  total: number,
  page: number,
  limit: number,
) {
  return {
    data: items,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

