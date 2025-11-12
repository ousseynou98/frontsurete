'use client';

import React, { useState, useEffect, Fragment } from 'react';
import Swal from 'sweetalert2';
import { Add, Edit, Trash } from '@wandersonalwes/iconsax-react';
import { useRouter } from 'next/navigation';
import { Role, RoleService } from 'services/role/role.service';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';

// third-party
import { LabelKeyObject } from 'react-csv/lib/core';
import {
  Row ,
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState
} from '@tanstack/react-table';

// project-imports
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import IconButton from 'components/@extended/IconButton';
import MainCard from 'components/MainCard';

import {
  DebouncedInput,
  HeaderSort,
  RowSelection,
  TablePagination
} from 'components/third-party/react-table';
import { Grid } from '@mui/material';
import { swalService } from 'services/swalService';
interface Props {
  columns: ColumnDef<any>[];
  data: any[];
}
function ReactTable({ data, columns }: Props) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([{ id: 'name', desc: false }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data,
    columns,
    state: { columnFilters, sorting, rowSelection, globalFilter },
    enableRowSelection: true,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getRowCanExpand: () => true,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    debugTable: true
  });

  const headers: LabelKeyObject[] = [];
  table.getAllColumns().map((column) => {
    const accessorKey = (column.columnDef as { accessorKey?: string }).accessorKey;
    headers.push({
      label: typeof column.columnDef.header === 'string' ? column.columnDef.header : '#',
      key: accessorKey ?? ''
    });
  });
  //  Ajouter un nouveau rôle
  const handleAddRole = () => {
    router.push('/roles/add-new-role');
  };
  return (
    <MainCard content={false} sx={{mb:4}}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{ gap: 2, p: 3, alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}
      >
        <DebouncedInput
          value={globalFilter ?? ''}
          onFilterChange={(value) => setGlobalFilter(String(value))}
          placeholder={`Rechercher des roles`}
          sx={{ width: { xs: 1, sm: 'auto' } }}
        />

        <Stack
          direction="row"
          sx={{ width: { xs: 1, sm: 'auto' }, gap: 2, alignItems: 'center', justifyContent: { xs: 'space-between', sm: 'flex-end' } }}
        >
          <Button variant="contained" startIcon={<Add />} size="large" onClick={handleAddRole}>
           Ajouter un role
          </Button>
        </Stack>
      </Stack>
      <Stack>
        <RowSelection selected={Object.keys(rowSelection).length} />
        <TableContainer>
          <Table>
            <TableHead>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableCell key={header.id} {...header.column.columnDef.meta}>
                        {header.isPlaceholder ? null : (
                          <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {header.column.getCanSort() && <HeaderSort column={header.column} />}
                          </Stack>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableHead>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <Fragment key={row.id}>
                  <TableRow>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} {...cell.column.columnDef.meta}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <>
          <Divider />
          <Box sx={{ p: 2 }}>
            <TablePagination
              {...{
                setPageSize: table.setPageSize,
                setPageIndex: table.setPageIndex,
                getState: table.getState,
                getPageCount: table.getPageCount
              }}
            />
          </Box>
        </>
      </Stack>
    </MainCard>
  );
}


const roleService = new RoleService();
const RolesPage = () => {
  const router = useRouter();
  const [rolesData, setRolesData] = useState<Role[]>([]);

  //  Récupère la liste des rôles
  const fetchRoleData = async () => {
    try {
        const data = await roleService.getAllRoles();
        setRolesData(data);
      } catch (error) {
        console.error('Erreur lors du chargement des rôles:', error);
      } 
  };

  useEffect(() => {
    fetchRoleData();
  }, []);



  //  Modifier un rôle
  const handleEditRole = (roleId: number) => {
    router.push(`/roles/edit-role/${roleId}`);
  };

  //  Supprimer un rôle avec confirmation
const handleDeleteRole = async (roleId: string) => {
  try {
    // Étape 1 : Demander confirmation
    const confirmed = await swalService.confirm(
      'Supprimer ce rôle ?',
      'Cette action est irréversible.',
      'Oui, supprimer'
    );

    if (!confirmed) {
      swalService.toast('Suppression annulée.', 'info');
      return;
    }

    // Étape 2 : Appel API
    await roleService.deleteRole(roleId);

    // Étape 3 : Notification + actualisation
    swalService.toast('Rôle supprimé avec succès.', 'success');
    // Par exemple, rafraîchir ta liste :
  
  } catch (error) {
    swalService.toast('Erreur lors de la suppression du rôle.', 'error');
    console.error(error);
  }
};

  //  Définition des colonnes du tableau
  const columns: ColumnDef<any>[] = [
    {
      header: '#',
      id: 'rowNumber',
      cell: ({ row }) => row.index + 1,
    },
    {
      accessorKey: 'name',
      header: 'Nom du role',
      id: 'name',
    },
    {
      id: 'actions',
      meta: { align: 'center' },
      header: 'Actions',
      cell: ({ row }: { row: Row<any> }) => (
        <Stack direction="row" alignItems="center" justifyContent="center" spacing={0}>    
          {/* {hasPermission(permissionUpdate) && ( */}
            <Tooltip title="Edit">
              <IconButton color="primary" onClick={() => handleEditRole(row.original.id)}>
                <Edit />
              </IconButton>
            </Tooltip>
          {/* )} */}
          {/* {hasPermission(permissionDelete) && ( */}
            <Tooltip title="Delete">
              <IconButton color="error" onClick={() => handleDeleteRole(row.original.id)}>
                <Trash />
              </IconButton>
            </Tooltip>
          {/* )} */}
        </Stack>
      ),
    },
  ];

  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <ReactTable
          data={rolesData}
          columns={columns}
        />
      </Grid>
    </Grid>
  );
};

export default RolesPage;
