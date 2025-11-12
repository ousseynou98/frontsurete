'use client';

import { useState, useEffect } from 'react';
import {
  Grid,
  TextField,
  Button,
  Stack,
  Autocomplete,
  InputLabel,
} from '@mui/material';
import Swal from 'sweetalert2';
import { RoleService } from 'services/role/role.service';
import { PermissionService } from 'services/permissions/permissions.service';
import MainCard from 'components/MainCard';

interface Permission {
  id: string;
  name: string;
  value: string;
}

interface RoleData {
  id: string;
  name: string;
  permissions: Permission[]; // IDs des permissions
}

interface EditRoleProps {
  roleId: string;
}

const roleService = new RoleService();
const permissionService = new PermissionService();

const EditRole = ({ roleId }: EditRoleProps) => {
  // const router = useRouter();

  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roleData, setRoleData] = useState<RoleData>({
    id: '',
    name: '',
    permissions: [],
  });
  const [loading, setLoading] = useState(true);

  // --- Fetch all permissions ---
  const fetchPermissions = async () => {
    try {
      const data = await permissionService.getAllPermissions();
      setPermissions(data);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      Swal.fire('Error', 'Impossible de récupérer les permissions', 'error');
    }
  };

  // --- Fetch role data by ID ---
  const fetchRoleData = async () => {
    try {
      const role = await roleService.getRoleById(roleId);
      console.log("role", role);

      setRoleData({
        id: role.id,
        name: role.name,
        permissions: role.permissions, // tableau d'IDs
      });
    } catch (error) {
      console.error('Error fetching role:', error);
      Swal.fire('Error', 'Impossible de récupérer le rôle', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  useEffect(() => {
    if (permissions.length > 0) {
      fetchRoleData();
    }
  }, [permissions]);

  // --- Handle input change ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRoleData((prev) => ({ ...prev, [name]: value }));
  };

  // --- Handle form submit ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await roleService.updateRole(roleData.id, {
        name: roleData.name,
        permissions: roleData.permissions,
      });
      Swal.fire('Success', 'Role mis à jour avec succès', 'success');
      // router.push('/roles');
    } catch (error) {
      console.error('Error updating role:', error);
      Swal.fire('Error', 'Impossible de mettre à jour le rôle', 'error');
    }
  };

  const handleCancel = () => {
    // router.push('/roles');
  };

  if (loading) return <p>Loading...</p>;

  return (
    <MainCard title="Modifier Role">
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
      value={roleData.permissions || []} 
      onChange={(event, newValue) => {
        setRoleData((prev) => ({
          ...prev,
          permissions: newValue, 
        }));
      }}
      renderInput={(params) => (
        <TextField {...params} placeholder="Sélectionnez les permissions" />
      )}
    />
  </Stack>
</Grid>


          {/* Buttons */}
          <Grid size={12}>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button variant="outlined" color="secondary" onClick={handleCancel}>
                Annuler
              </Button>
              <Button variant="contained" color="primary" type="submit">
                Modifier
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </form>
    </MainCard>
  );
};

export default EditRole;
