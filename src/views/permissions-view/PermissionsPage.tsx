'use client';

import React, { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import { Edit } from '@wandersonalwes/iconsax-react';
import Stack from '@mui/material/Stack';
import { Row, ColumnDef } from '@tanstack/react-table';
import { useRouter } from 'next/navigation';
import ReactTable from 'sections/tables/react-table/ReactTable';
import { PermissionService } from 'services/permissions/permissions.service';

const permissionService = new PermissionService();
const PermissionsPage = () => {
  const router = useRouter();
  const [permissionsData, setPermissionsData] = useState<any[]>([]);
  // const { permissions } = AuthService();

  const fetchPermissionsData = async () => {
    try {
        const data = await permissionService.getAllPermissions();
        console.log('byllgg',data);
        
        setPermissionsData(data);
      } catch (error) {
        console.error('Erreur lors du chargement des rôles:', error);
      }
  };
  useEffect(() => {
    fetchPermissionsData();
  }, []);

  const handleUpdatePermission = (permissionId: number) => {
    router.push(`/permissions/edit-permission/${permissionId}`);
  };

  const columns: ColumnDef<any>[] = [
    {
      header: '#',
      id: 'rowNumber',
      cell: ({ row }) => row.index + 1,
    },
    { accessorKey: 'value', header: 'Name', id: 'value' },
    {
      id: 'actions',
      header: 'Actions',
      meta: { align: 'center' },
      cell: ({ row }: { row: Row<any> }) => (
        <Stack direction="row"  spacing={0}>
          <Tooltip title="Update">
            <IconButton color="secondary" onClick={() => handleUpdatePermission(row.original.id)}>
              <Edit />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12}}>
        <ReactTable
          data={permissionsData}
          columns={columns}
        />
      </Grid>
    </Grid>
  );
};

export default PermissionsPage;
