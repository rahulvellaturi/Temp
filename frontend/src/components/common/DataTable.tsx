import React from 'react';
import { ChevronDown, ChevronUp, Search, Filter, Download } from 'lucide-react';
import Button from './Button';
import { FormInput } from './Form';
import StatusBadge from './StatusBadge';
import { formatCurrency, formatDate, formatFileSize } from '@/lib/formatters';
import { getStatusColor } from '@/lib/statusUtils';

export interface Column<T> {
  key: keyof T | string;
  title: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, item: T, index: number) => React.ReactNode;
  format?: 'currency' | 'date' | 'fileSize' | 'status' | 'custom';
  statusType?: 'policy' | 'claim' | 'payment' | 'user';
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  sortable?: boolean;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  filterable?: boolean;
  filters?: Record<string, any>;
  onFilterChange?: (filters: Record<string, any>) => void;
  onRowClick?: (item: T, index: number) => void;
  rowClassName?: (item: T, index: number) => string;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  actions?: React.ReactNode;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange?: (itemsPerPage: number) => void;
  };
  exportable?: boolean;
  onExport?: () => void;
  className?: string;
}

function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  searchable = false,
  searchPlaceholder = 'Search...',
  searchValue = '',
  onSearchChange,
  sortable = false,
  sortKey,
  sortDirection,
  onSort,
  filterable = false,
  filters = {},
  onFilterChange,
  onRowClick,
  rowClassName,
  emptyMessage = 'No data available',
  emptyIcon,
  actions,
  pagination,
  exportable = false,
  onExport,
  className = ''
}: DataTableProps<T>) {
  const getValue = (item: T, key: string): any => {
    return key.includes('.') 
      ? key.split('.').reduce((obj, k) => obj?.[k], item)
      : item[key];
  };

  const formatValue = (value: any, column: Column<T>, item: T, index: number): React.ReactNode => {
    if (column.render) {
      return column.render(value, item, index);
    }

    if (value == null) return '-';

    switch (column.format) {
      case 'currency':
        return formatCurrency(value);
      case 'date':
        return formatDate(value);
      case 'fileSize':
        return formatFileSize(value);
      case 'status':
        return (
          <StatusBadge 
            status={value} 
            variant={getStatusColor(value, column.statusType) as any}
          />
        );
      default:
        return String(value);
    }
  };

  const handleSort = (columnKey: string) => {
    if (!sortable || !onSort) return;

    const newDirection = 
      sortKey === columnKey && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(columnKey, newDirection);
  };

  const getSortIcon = (columnKey: string) => {
    if (sortKey !== columnKey) return null;
    return sortDirection === 'asc' 
      ? <ChevronUp className="h-4 w-4" />
      : <ChevronDown className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-neutral-200 rounded mb-4"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-neutral-100 rounded mb-2"></div>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header Controls */}
      {(searchable || filterable || exportable || actions) && (
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            {searchable && (
              <div className="max-w-sm">
                <FormInput
                  placeholder={searchPlaceholder}
                  value={searchValue}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  leftIcon={<Search className="h-4 w-4" />}
                  clearable
                  onClear={() => onSearchChange?.('')}
                />
              </div>
            )}

            {filterable && (
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {exportable && (
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            )}
            {actions}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto border border-neutral-200 rounded-lg">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={`
                    px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider
                    ${column.align === 'center' ? 'text-center' : 
                      column.align === 'right' ? 'text-right' : 'text-left'}
                    ${column.sortable && sortable ? 'cursor-pointer hover:bg-neutral-100' : ''}
                  `}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(String(column.key))}
                >
                  <div className="flex items-center gap-1">
                    <span>{column.title}</span>
                    {column.sortable && getSortIcon(String(column.key))}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    {emptyIcon && (
                      <div className="mb-4 text-neutral-400">
                        {emptyIcon}
                      </div>
                    )}
                    <p className="text-neutral-500 text-sm">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr
                  key={item.id || index}
                  className={`
                    hover:bg-neutral-50 transition-colors
                    ${onRowClick ? 'cursor-pointer' : ''}
                    ${rowClassName ? rowClassName(item, index) : ''}
                  `}
                  onClick={() => onRowClick?.(item, index)}
                >
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className={`
                        px-4 py-3 whitespace-nowrap text-sm
                        ${column.align === 'center' ? 'text-center' : 
                          column.align === 'right' ? 'text-right' : 'text-left'}
                      `}
                    >
                      {formatValue(getValue(item, String(column.key)), column, item, index)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-neutral-700">
            Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
            {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
            {pagination.totalItems} results
          </div>

          <div className="flex items-center gap-2">
            {pagination.onItemsPerPageChange && (
              <select
                value={pagination.itemsPerPage}
                onChange={(e) => pagination.onItemsPerPageChange?.(Number(e.target.value))}
                className="text-sm border border-neutral-300 rounded px-2 py-1"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            )}

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.currentPage === 1}
                onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              >
                Previous
              </Button>

              {/* Page numbers */}
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const startPage = Math.max(1, pagination.currentPage - 2);
                const pageNumber = startPage + i;
                
                if (pageNumber > pagination.totalPages) return null;

                return (
                  <Button
                    key={pageNumber}
                    variant={pageNumber === pagination.currentPage ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => pagination.onPageChange(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                );
              })}

              <Button
                variant="outline"
                size="sm"
                disabled={pagination.currentPage === pagination.totalPages}
                onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;