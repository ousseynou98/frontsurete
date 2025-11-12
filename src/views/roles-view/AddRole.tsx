'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Grid,
  Stack,
  Button,
  TextField,
  InputLabel,
  Autocomplete,
} from '@mui/material';
import MainCard from 'components/MainCard';
import Swal from 'sweetalert2';
import { RoleService } from 'services/role/role.service';
import { PermissionService } from 'services/permissions/permissions.service';

interface Permission {
  id: string;
  name: string;
   value: string;
}

interface RoleData {
  name: string;
  permissions: string[]; // IDs des permissions
}

const roleService = new RoleService();
const permissionService = new PermissionService();

const AddRole = () => {
  const router = useRouter();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roleData, setRoleData] = useState<RoleData>({
    name: '',
    permissions: [],
  });

  // --- Fetch permissions ---
  const fetchPermissions = async () => {
    try {
      const data = await permissionService.getAllPermissions();
      setPermissions(data);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      Swal.fire('Error', 'Impossible de récupérer les permissions', 'error');
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  // --- Handle input change ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRoleData((prev) => ({ ...prev, [name]: value }));
  };

  // --- Handle form submit ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      console.log("role",roleData);
      
      const res =  await roleService.createRole(roleData);
      console.log('res',res);
      
      Swal.fire('Success', 'Role créé avec succès', 'success');
      router.push('/roles'); // Redirige vers la liste des rôles
    } catch (error) {
      console.error('Error creating role:', error);
      Swal.fire('Error', 'Impossible de créer le rôle', 'error');
    }
  };

  // --- Handle cancel ---
  const handleCancel = () => {
    router.push('/roles');
  };

  return (
    <MainCard title="Creer un role">
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Name */}
          <Grid size={12}>
            <Stack spacing={1}>
              <InputLabel htmlFor="name">Nom</InputLabel>
              <TextField
                fullWidth
                id="name"
                name="name"
                value={roleData.name}
                onChange={handleChange}
              />
            </Stack>
          </Grid>

          {/* Permissions */}
          <Grid size={12}>
            <Stack spacing={1}>
              <InputLabel htmlFor="permissions">Permissions</InputLabel>
              <Autocomplete
                multiple
                id="permissions"
                options={permissions}
                getOptionLabel={(option) => option.value}
                value={permissions.filter((p) =>
                  roleData.permissions.includes(p.id)
                )}
                onChange={(event, newValue) => {
                  setRoleData((prev) => ({
                    ...prev,
                    permissions: newValue.map((option) => option.id),
                  }));
                }}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Selectionné les permissions" />
                )}
              />
            </Stack>
          </Grid>

          {/* Buttons */}
          <Grid  size={12}>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button variant="outlined" color="secondary" onClick={handleCancel}>
                Annuler
              </Button>
              <Button variant="contained" color="primary" type="submit">
              Enregistrer
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </form>
    </MainCard>
  );
};

export default AddRole;
