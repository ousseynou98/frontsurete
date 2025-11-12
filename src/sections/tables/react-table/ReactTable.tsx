'use client';

import React from 'react';
import {
 useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef
} from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Paper, Typography, Box, Divider, Stack, Button } from '@mui/material';
import { CSVExport, DebouncedInput, SelectColumnSorting, TablePagination } from 'components/third-party/react-table';
import MainCard from 'components/MainCard';
import { Add } from '@wandersonalwes/iconsax-react';

export interface ReactTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  title?: string;
  addButton?: {
    label: string;
    href: string;
  };
}

export default function ReactTable<T>({ data, columns, title, addButton }: ReactTableProps<T>) {
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [sorting, setSorting] = React.useState([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
      sorting
    },
    onGlobalFilterChange: setGlobalFilter,
    // onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  });

  const headers = columns.map((col: any) => ({
    label: col.header,
    key: col.accessorKey
  }));

  return (
    <MainCard content={false}>
      
      {/* ✅ Search + Sorting + Actions */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{
          gap: 2,
          p: 3,
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between'
        }}
      >
        <DebouncedInput
          value={globalFilter}
          onFilterChange={(value) => setGlobalFilter(String(value))}
          placeholder={`Search ${data.length} records...`}
          sx={{ width: { xs: 1, sm: 'auto' } }}
        />

        <Stack direction="row" sx={{ gap: 2 }}>
          {/* <SelectColumnSorting
            getState={() => table.getState()}
            getAllColumns={() => table.getAllColumns()}
            setSorting={setSorting}
          /> */}


          {addButton && (
            <Button
              variant="contained"
              startIcon={<Add />}
              size="large"
              href={addButton.href}
            >
              {addButton.label}
            </Button>
          )}

        </Stack>
      </Stack>

      <TableContainer component={Paper}>
        {title && (
          <Typography variant="h6" sx={{ p: 2 }}>
            {title}
          </Typography>
        )}

        {/* ✅ Table Content */}
        <Table>
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableCell key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>

          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ✅ Pagination */}
      <Divider />
      <Box sx={{ p: 2 }}>
        <TablePagination
          setPageSize={table.setPageSize}
          setPageIndex={table.setPageIndex}
          getState={table.getState}
          getPageCount={table.getPageCount}
        />
      </Box>
    </MainCard>
  );
}
