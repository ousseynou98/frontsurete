'use client';

import { useState } from 'react';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import MainCard from 'components/MainCard';

const AddPermission = () => {
  const [permissionData, setPermissionData] = useState({
    name: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPermissionData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
 };

  const handleCancel = () => {};

  return (
    <MainCard title="Create Permission">
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={1}>
              <InputLabel htmlFor="name">Name</InputLabel>
              <TextField
                fullWidth
                id="name"
                name="name"
                type="text"
                value={permissionData.name}
                onChange={handleChange} // Ajoutez le gestionnaire de changement
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

export default AddPermission;
