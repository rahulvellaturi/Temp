"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseQueryFilters = exports.buildWhereClause = exports.buildSearchFilter = exports.getPaginationParams = void 0;
const getPaginationParams = (req) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;
    return {
        skip,
        take: limit,
        page
    };
};
exports.getPaginationParams = getPaginationParams;
const buildSearchFilter = (search, fields) => {
    if (!search)
        return {};
    return {
        OR: fields.map(field => ({
            [field]: {
                contains: search,
                mode: 'insensitive'
            }
        }))
    };
};
exports.buildSearchFilter = buildSearchFilter;
const buildWhereClause = (filters) => {
    const whereClause = {};
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            whereClause[key] = value;
        }
    });
    return whereClause;
};
exports.buildWhereClause = buildWhereClause;
const parseQueryFilters = (req, allowedFilters) => {
    const filters = {};
    allowedFilters.forEach(filter => {
        if (req.query[filter]) {
            filters[filter] = req.query[filter];
        }
    });
    return filters;
};
exports.parseQueryFilters = parseQueryFilters;
//# sourceMappingURL=queryHelpers.js.map