'use client';

import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Add, Edit, Trash, User, UserRemove } from '@wandersonalwes/iconsax-react';
import { UserService } from 'services/users/user.service';

// material-ui
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';

// third-party
import { LabelKeyObject } from 'react-csv/lib/core';
import {
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
import Avatar from 'components/@extended/Avatar';
import Dot from 'components/@extended/Dot';
import IconButton from 'components/@extended/IconButton';
import MainCard from 'components/MainCard';

import {
  DebouncedInput,
  HeaderSort,
  RowSelection,
  SelectColumnSorting,
  TablePagination
} from 'components/third-party/react-table';
import { Grid } from '@mui/material';
import { swalService } from 'services/swalService';
import useUser from 'hooks/useUser';

interface User {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  genre: string;
  isActive: boolean;
  lastLoginAt: Date | null;
  avatar?: string;
  role?: { name: string };
  contact?: string;
}
interface Props {
  columns: ColumnDef<User>[];
  data: User[];
  canManage: boolean;
}
// ==============================|| REACT TABLE - LIST ||============================== //
function ReactTable({ data, columns, canManage }: Props) {
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
  // --- Handlers ---
  const handleAddUser = () => {
    if (canManage) {
      router.push('/users/add-new-user');
    }
  };

  return (
    <MainCard content={false} sx={{ mb: 4 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{ gap: 2, p: 3, alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}
      >
        <DebouncedInput
          value={globalFilter ?? ''}
          onFilterChange={(value) => setGlobalFilter(String(value))}
          placeholder={`Rechercher un utilisateur`}
          sx={{ width: { xs: 1, sm: 'auto' } }}
        />

        <Stack
          direction="row"
          sx={{ width: { xs: 1, sm: 'auto' }, gap: 2, alignItems: 'center', justifyContent: { xs: 'space-between', sm: 'flex-end' } }}
        >
          <SelectColumnSorting {...{ getState: table.getState, getAllColumns: table.getAllColumns, setSorting }} />
          <Button
            variant="contained"
            startIcon={<Add />}
            size="large"
            onClick={handleAddUser}
            disabled={!canManage}
          >
            Ajouter
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
const avatarImage = '/assets/images/users';
const userService = new UserService();
const UsersPage = () => {

  const router = useRouter();
  const currentUser = useUser();
  const canManageUsers = useMemo(() => {
    const role =
      typeof currentUser === 'object'
        ? currentUser.role?.toLowerCase?.() ?? currentUser.role ?? ''
        : '';
    return role === 'super_admin' || role === 'admin';
  }, [currentUser]);
  const [usersData, setUsersData] = useState<User[]>([]);

  // --- Fetch users ---
  const fetchUserData = async () => {
    try {
      const response = await userService.getAllUsers();
      setUsersData(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des rôles:', error);
    }
  };
  const handleEditUser = (roleId: string) => {
    if (!canManageUsers) return;
    router.push(`/users/edit-user/${roleId}`);
  };

  useEffect(() => {
    if (canManageUsers) {
      fetchUserData();
    }
  }, [canManageUsers]);

  const handleActivateUser = async (id: string) => {
    if (!canManageUsers) return;
    const confirmed = await swalService.confirm(
      'Activer cet utilisateur ?',
      'Il pourra de nouveau se connecter.',
      'Oui, activer'
    );
    if (!confirmed) return;

    try {
      await userService.updateUserStatus(id, { isActive: true });
      swalService.toast('Utilisateur activé avec succès', 'success');
      fetchUserData(); // Recharger la liste
    } catch (_error) {
      swalService.toast('Erreur lors de l’activation', 'error');
    }
  };

  const handleDeactivateUser = async (id: string) => {
    if (!canManageUsers) return;
    const confirmed = await swalService.confirm(
      'Désactiver cet utilisateur ?',
      'Il ne pourra plus se connecter.',
      'Oui, désactiver'
    );
    if (!confirmed) return;

    try {
      const res = await userService.updateUserStatus(id, { isActive: false });
      swalService.toast('Utilisateur désactivé avec succès', 'success');
      fetchUserData();
    } catch (error) {
      swalService.toast('Erreur lors de la désactivation', 'error');
    }
  };


  const handleDeleteUser = async (userId: string) => {
    if (!canManageUsers) return;
    const confirmed = await swalService.confirm(
      'Suprimer cet utilisateur ?',
      'Il sera suprimé définitivement.',
      'Oui, désactiver'
    );
    if (!confirmed) return;

    try {
      const res = await userService.deleteUser(userId);
      swalService.toast('Utilisateur est suprimé avec succès', 'success');
      fetchUserData();
    } catch (error) {
      swalService.toast('Erreur lors de la suppression', 'error');
    }
  };

  // --- Columns ---
  const columns: ColumnDef<User>[] = [
    {
      header: 'Nom',
      accessorKey: 'lastname',
      cell: ({ row, getValue }) => {
        const genre = row.original.genre?.toLowerCase();

        const avatarSrc =
          genre === 'homme'
            ? `${avatarImage}/avatar-3.png`
            : genre === 'femme'
              ? `${avatarImage}/avatar-7.png`
              : `${avatarImage}/avatar-3.png`;

        return (
          <Stack direction="row" sx={{ alignItems: 'center' }}>
            <Avatar alt="Avatar" size="md" src={avatarSrc} sx={{ mr: 2 }} />
            <Typography variant="body1">{getValue() as string}</Typography>
          </Stack>


        );
      }
    },
    {
      header: 'Prenom',
      accessorKey: 'firstname',
    },
    {
      header: 'Email',
      accessorKey: 'email',
    },
    {
      header: 'Sexe',
      accessorKey: 'genre',
    },
    {
      header: 'Status',
      accessorKey: 'isActive',
      cell: ({ row }) => (
        <Stack direction="row" sx={{ gap: 0.5, alignItems: 'center' }}>
          <Dot
            color={row.original.isActive ? 'success' : 'error'}
            size={6}
          />
          <Typography
            sx={{ color: row.original.isActive ? 'success.main' : 'error.main' }}
            variant="caption"
          >
            {row.original.isActive ? 'Active' : 'Inactive'}
          </Typography>
        </Stack>
      )
    },

    {
      header: 'Role',
      accessorKey: 'role',
      cell: ({ row }) => row.original.role?.name || '-',
    },
    {
      header: 'Adreese',
      accessorKey: 'address',
    },
    {
      header: 'Dernière connexion',
      accessorKey: 'lastLoginAt',
      cell: ({ getValue }) => {
        const dateStr = getValue() as string;
        if (!dateStr) return '-';

        const date = new Date(dateStr);
        const now = new Date();

        // Vérifier si c'est aujourd'hui
        const isToday =
          date.getDate() === now.getDate() &&
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear();

        const formattedDate = date.toLocaleString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });

        return (
          <Chip
            label={formattedDate}
            size="small"
            variant="light"
            color={isToday ? 'success' : 'error'}
          />
        );
      },
    },
    {
      header: 'Actions',
      meta: { align: 'center' },
      id: 'actions',
      cell: ({ row }: { row: any }) => {
        const user = row.original; // l’utilisateur complet

        if (!canManageUsers) {
          return (
            <Typography variant="caption" color="text.secondary">
              Accès restreint
            </Typography>
          );
        }

        return (
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
            {/* Activer / Désactiver */}
            {user.isActive ? (
              <Tooltip title="Désactiver l&apos;utilisateur">
                <IconButton
                  color="success"
                  onClick={() => handleDeactivateUser(user.id)} //  utiliser user.id
                >
                  <User />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="Activer l&apos;utilisateur">
                <IconButton
                  color="error"
                  onClick={() => handleActivateUser(user.id)} //  utiliser user.id
                >
                  <UserRemove />
                </IconButton>
              </Tooltip>
            )}

            <Tooltip title="Modifier">
              <IconButton color="primary" onClick={() => handleEditUser(user.id)}>
                <Edit />
              </IconButton>
            </Tooltip>

            <Tooltip title="Supprimer">
              <IconButton color="error" onClick={() => handleDeleteUser(user.id)}>
                <Trash />
              </IconButton>
            </Tooltip>
          </Stack>
        );
      },
    }

  ];

  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        {canManageUsers ? (
          <ReactTable data={usersData} columns={columns} canManage={canManageUsers} />
        ) : (
          <MainCard>
            <Alert severity="warning">
              Vous n&apos;avez pas l’autorisation de gérer les utilisateurs. Veuillez contacter un administrateur.
            </Alert>
          </MainCard>
        )}
      </Grid>
    </Grid>
  );
};

export default UsersPage;
