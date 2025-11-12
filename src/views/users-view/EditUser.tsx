'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MainCard from 'components/MainCard';
import { UserService } from 'services/users/user.service';
import { RoleService } from 'services/role/role.service';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Alert, Box } from '@mui/material';
import useUser from 'hooks/useUser';
interface UserData {
  firstname: string;
  lastname: string;
  phone: string;
  password?: string;
  genre: string;
  email: string;
  contact:string;
  countryCode:string;
  roleId: string;
  address: string;
}

interface Role {
  id: string;
  name: string;
}

const EditUser = ({ userId }: { userId: string }) => {
  const router = useRouter();
  const currentUser = useUser();
  const canManageUsers = useMemo(() => {
    const role =
      typeof currentUser === 'object'
        ? currentUser.role?.toLowerCase?.() ?? currentUser.role ?? ''
        : '';
    return role === 'super_admin' || role === 'admin';
  }, [currentUser]);
  const userService = new UserService();
  const roleService = new RoleService();
  const [userData, setUserData] = useState<UserData>({
    firstname: '',
    lastname: '',
    phone: '',
    password: '',
    contact: '',
    countryCode: '+228',
    genre: '',
    email: '',
    roleId: '',
    address: '',
  });
  // 🧩 Validation avec Yup
  const validationSchema = Yup.object({
    lastname: Yup.string().required('Le nom est obligatoire'),
    firstname: Yup.string().required('Le prénom est obligatoire'),
    email: Yup.string().email('Email invalide').required('Email obligatoire'),
    contact: Yup.string()
      .matches(/^[0-9]+$/, 'Le numéro doit contenir uniquement des chiffres')
      .min(6, 'Trop court')
      .required('Numéro obligatoire'),
    address: Yup.string().required('Adresse obligatoire'),
    genre: Yup.string().required('Genre obligatoire'),
    roleId: Yup.string().required('Rôle obligatoire'),
    countryCode: Yup.string().required('Code pays obligatoire'),
  });

  // 🧠 Initialisation Formik
  const formik = useFormik({
   enableReinitialize: true,
  initialValues: userData,
    validationSchema,
    onSubmit: async (values) => {
      const fullPhone = `${values.countryCode}${values.contact}`;
   
  // crée un nouvel objet sans contact ni countryCode
    const { contact, countryCode, ...rest } = values;
    const payload = { ...rest, phone: fullPhone };
    try {
      await userService.updateUser(userId, payload);
      Swal.fire('Success', 'Utilisateur modifier avec succès', 'success');
      router.push('/users');
    } catch (error: any) {
      Swal.fire('Error', error.response.data.message, 'error');
    }
    },
  });

  const { values, errors, touched, handleChange, handleBlur, handleSubmit } = formik;


  const [rolesData, setRolesData] = useState<Role[]>([]);

  // --- Fetch roles ---
  const fetchRoles = async () => {
    try {
      const roles = await roleService.getAllRoles();
      setRolesData(roles);
    } catch (_err) {
    }
  };

  // --- Fetch user data ---
  const fetchUser = async () => {
    try {
      const response = await userService.getUserById(userId);

      const user = response;
      let countryCodes = '';
      let contacts = '';

      if (user.phone && user.phone.startsWith('+')) {
        //  Expression régulière : capture le code pays et le reste
        const match = user.phone.match(/^(\+\d{1,3})(\d+)$/);
        if (match) {
          countryCodes = match[1]; // ex: +221
          contacts = match[2];     // ex: 09876554
        }
      }
      setUserData({
        firstname: user.firstname,
        lastname: user.lastname,
        phone: user.phone,
        genre: user.genre,
        email: user.email,
        roleId: user.role?.id || '',
        address: user.address,
        contact: contacts,
        countryCode:countryCodes,
      });

    } catch (err) {
      console.error('Failed to fetch user', err);
    }
  };
  useEffect(() => {
    if (!canManageUsers) return;
    fetchRoles();
    fetchUser();
  }, [userId, canManageUsers]);


  const handleCancel = () => {
    router.push('/users');
  };

  if (!canManageUsers) {
    return (
      <MainCard>
        <Alert severity="warning">
          Vous n&apos;avez pas l’autorisation de modifier des utilisateurs. Veuillez contacter un administrateur.
        </Alert>
      </MainCard>
    );
  }

  return (
    <>
    
    
         <MainCard
          content={false}
          title="Modifier un utilisateur"
          sx={{
            '& .MuiInputLabel-root': { fontSize: '0.875rem' },
            mt: 4,
          }}
        >
          <form onSubmit={handleSubmit}>
            <Box sx={{ p: 2.5 }}>
              <Grid container spacing={3}>
                {/* Nom */}
                <Grid size={{ xs: 12, sm: 4 }}>
                  <InputLabel>Nom <span style={{ color: 'red' }}>*</span></InputLabel>
                  <TextField
                    name="lastname"
                    value={values.lastname}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    fullWidth
                    error={touched.lastname && Boolean(errors.lastname)}
                    helperText={touched.lastname && errors.lastname}
                  />
                </Grid>
    
                {/* Prénom */}
                <Grid size={{ xs: 12, sm: 4}}>
                  <InputLabel>Prénom <span style={{ color: 'red' }}>*</span></InputLabel>
                  <TextField
                    name="firstname"
                    value={values.firstname}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    fullWidth
                    error={touched.firstname && Boolean(errors.firstname)}
                    helperText={touched.firstname && errors.firstname}
                  />
                </Grid>
              
                {/* Sexe */}
                <Grid size={{ xs: 12, sm: 4 }}>
                  <InputLabel>Sexe <span style={{ color: 'red' }}>*</span></InputLabel>
                  <Select
                    name="genre"
                    value={values.genre}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    fullWidth
                    error={touched.genre && Boolean(errors.genre)}
                  >
                    <MenuItem value="homme">Homme</MenuItem>
                    <MenuItem value="femme">Femme</MenuItem>
                  </Select>
                  {touched.genre && errors.genre && (
                    <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
                      {errors.genre}
                    </Box>
                  )}
                </Grid>
    
                {/* Rôle */}
                <Grid size={{ xs: 12, sm: 4 }}>
                  <InputLabel>Rôle <span style={{ color: 'red' }}>*</span></InputLabel>
                  <Select
                    name="roleId"
                    value={values.roleId}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    fullWidth
                    error={touched.roleId && Boolean(errors.roleId)}
                  >
                    {rolesData.map((role) => (
                      <MenuItem key={role.id} value={role.id}>
                        {role.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {touched.roleId && errors.roleId && (
                    <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
                      {errors.roleId}
                    </Box>
                  )}
                </Grid>
                
      {/* Téléphone avec code pays */}
                <Grid size={{ xs: 12, sm: 4 }}>
                  <InputLabel>Téléphone <span style={{ color: 'red' }}>*</span></InputLabel>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Select
                      name="countryCode"
                      value={values.countryCode}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.countryCode && Boolean(errors.countryCode)}
                      sx={{ width: '35%' }}
                    >
                      <MenuItem value="+221">+221</MenuItem>
                      <MenuItem value="+228">+228</MenuItem>
                      <MenuItem value="+225">+225</MenuItem>
                      <MenuItem value="+229">+229</MenuItem>
                      <MenuItem value="+33">+33</MenuItem>
                      <MenuItem value="+1">+1</MenuItem>
                    </Select>
    
                    <TextField
                      fullWidth
                      placeholder="Numéro de téléphone"
                      name="contact"
                      value={values.contact}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.contact && Boolean(errors.contact)}
                      helperText={touched.contact && errors.contact}
                    />
                  </Stack>
                </Grid>
    
                {/* Email */}
                <Grid size={{ xs: 12, sm: 4 }}>
                  <InputLabel>Email <span style={{ color: 'red' }}>*</span></InputLabel>
                  <TextField
                    name="email"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    fullWidth
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                  />
                </Grid>
                {/* Adresse */}
                <Grid size={{ xs: 12}}>
                  <InputLabel>Adresse <span style={{ color: 'red' }}>*</span></InputLabel>
                  <TextField
                    name="address"
                    rows={3}
                     multiline
                    value={values.address}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    fullWidth
                    error={touched.address && Boolean(errors.address)}
                    helperText={touched.address && errors.address}
                  />
                </Grid>
    
                {/* Boutons */}
                <Grid size={{ xs: 12}}>
                  <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => handleCancel()}
                    >
                      Annuler
                    </Button>
                    <Button variant="contained" type="submit">
                      Enregistrer
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          </form>
        </MainCard></>
  );
};

export default EditUser;
