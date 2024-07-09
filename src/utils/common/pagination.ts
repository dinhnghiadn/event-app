const DEFAULT_PAGE_ITEM = 10;
export function getPagination(limit: number | undefined, page: number | undefined, all = false) {
    if (!all) {
        const take = (limit && +limit) || DEFAULT_PAGE_ITEM;
        let skip = 0;
        if (page && page > 1) skip = page * take - take;
        return {
            take,
            skip,
        };
    } else {
        return {
            take: undefined,
            skip: undefined,
        };
    }
}