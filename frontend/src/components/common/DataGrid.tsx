import React, { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import {
  AllCommunityModule,
  ColDef,
  ModuleRegistry,
  themeQuartz,
} from 'ag-grid-community';
import { cn } from '@/lib/utils';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

let modulesRegistered = false;
if (!modulesRegistered) {
  ModuleRegistry.registerModules([AllCommunityModule]);
  modulesRegistered = true;
}

const assureMeGridTheme = themeQuartz.withParams({
  accentColor: '#2563eb',
  borderRadius: 8,
  fontFamily: 'inherit',
  headerBackgroundColor: '#f8fafc',
  oddRowBackgroundColor: '#fafafa',
});

export interface DataGridProps<TData = unknown> {
  rowData: TData[];
  columnDefs: ColDef<TData>[];
  /** Merged into default column behaviour (sort, filter, resize). */
  defaultColDef?: ColDef<TData>;
  height?: number | string;
  quickFilterText?: string;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  context?: Record<string, unknown>;
  onRowClicked?: (row: TData) => void;
  pagination?: boolean;
  paginationPageSize?: number;
}

function DataGrid<TData>({
  rowData,
  columnDefs,
  defaultColDef,
  height = 420,
  quickFilterText,
  loading = false,
  emptyMessage = 'No rows to display',
  className,
  context,
  onRowClicked,
  pagination = true,
  paginationPageSize = 10,
}: DataGridProps<TData>) {
  const mergedDefaultColDef = useMemo<ColDef<TData>>(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      flex: 1,
      minWidth: 110,
      ...defaultColDef,
    }),
    [defaultColDef]
  );

  const showEmpty = !loading && rowData.length === 0;

  return (
    <div className={cn('w-full', className)}>
      {showEmpty ? (
        <div
          className="flex items-center justify-center rounded-lg border border-dashed border-neutral-200 bg-neutral-50 text-sm text-neutral-500"
          style={{ height: typeof height === 'number' ? height : 320 }}
        >
          {emptyMessage}
        </div>
      ) : (
        <div className="ag-theme-quartz w-full" style={{ height }}>
          <AgGridReact<TData>
            theme={assureMeGridTheme}
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={mergedDefaultColDef}
            quickFilterText={quickFilterText}
            context={context}
            loading={loading}
            animateRows
            rowSelection="single"
            suppressCellFocus
            pagination={pagination}
            paginationPageSize={paginationPageSize}
            paginationPageSizeSelector={[10, 20, 50]}
            onRowClicked={(e) => {
              if (e.data && onRowClicked) onRowClicked(e.data);
            }}
          />
        </div>
      )}
    </div>
  );
}

export default DataGrid;
