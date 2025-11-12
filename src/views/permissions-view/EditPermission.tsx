'use client';

import { useEffect, useState } from 'react';
import MainCard from 'components/MainCard';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import Swal from 'sweetalert2';
import { PermissionService } from 'services/permissions/permissions.service';
import { useRouter } from 'next/navigation';


const EditPermission = ({ permissionId }: { permissionId: any }) => {
  const [editedPermissionData, setEditedPermissionData] = useState({
    id: '',
    name: '',
    value: ''
  });
  const router = useRouter();
  const permissionService = new PermissionService();
  useEffect(() => {
    const fetchPermissionData = async () => {
      try {
        const data = await permissionService.getPermissionById(permissionId);
        console.log(data);

        setEditedPermissionData(data);
      } catch (error) {
        console.error('Error fetching permissions:', error);
        Swal.fire('Error', 'Impossible de récupérer les permissions', 'error');
      }
    };

    if (permissionId) {
      fetchPermissionData();
    }
  }, [permissionId]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setEditedPermissionData((prevPermissionData) => ({
      ...prevPermissionData,
      [name]: value
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      await permissionService.updatePermission(editedPermissionData.id, {
        name: editedPermissionData.name,
        value: editedPermissionData.value,
      });
      Swal.fire('Success', 'Permission mis à jour avec succès', 'success');
      router.push('/permissions');
    } catch (error) {
      console.error('Error updating role:', error);
      Swal.fire('Error', 'Impossible de mettre à jour le Permission', 'error');
    }
  };

  const handleCancel = () => {
    window.location.href = '/permissions';
  };

  return (
    <MainCard title="Modifier une  permission">
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Stack spacing={1}>
              <InputLabel htmlFor="name">Nom</InputLabel>
              <TextField
                fullWidth
                id="name"
                name="value"
                type="text"
                value={editedPermissionData.value}
                onChange={handleChange}
              />
            </Stack>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button variant="outlined" color="secondary" onClick={handleCancel}>
                Annuler
              </Button>
              <Button variant="contained" type="submit">
                Enregistrer
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </form>
    </MainCard>
  );
};

export default EditPermission;
