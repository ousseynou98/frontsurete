'use client';
// next
import Link from 'next/link';

// material-ui
import { Theme } from '@mui/material/styles';
import { useState, useEffect, useMemo } from 'react';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import MainCard from 'components/MainCard';
import Box from '@mui/material/Box';
import { ThemeDirection } from 'config';
import { Alert, IconButton, InputAdornment, useMediaQuery } from '@mui/material';
import { RoleService } from 'services/role/role.service';
import { UserService } from 'services/users/user.service';
import ProfileRadialChart from 'sections/apps/profiles/user/ProfileRadialChart';
import BackLeft from '../../../public/assets/images/profile/UserProfileBackLeft';
import BackRight from '../../../public/assets/images/profile/UserProfileBackRight';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { Eye, EyeSlash } from '@wandersonalwes/iconsax-react';
import { EntiteService } from 'services/entite/entite';
import useUser from 'hooks/useUser';

const AddUser = () => {
  //  const router = useRouter();
  const currentUser = useUser();
  const canManageUsers = useMemo(() => {
    const role =
      typeof currentUser === 'object'
        ? currentUser.role?.toLowerCase?.() ?? currentUser.role ?? ''
        : '';
    return role === 'super_admin' || role === 'admin';
  }, [currentUser]);

  // Validation avec Yup
  const validationSchema = Yup.object({
    lastname: Yup.string().required('Le nom est obligatoire'),
    firstname: Yup.string().required('Le prénom est obligatoire'),
    email: Yup.string().email('Email invalide').required('Email obligatoire'),
    contact: Yup.string()
      .matches(/^[0-9]+$/, 'Le numéro doit contenir uniquement des chiffres')
      .min(6, 'Trop court')
      .required('Numéro obligatoire'),
    password: Yup.string()
      .min(6, 'Min 6 caractères')
      .matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{6,}$/, 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre')
      .required('Mot de passe obligatoire'),
    address: Yup.string().required('Adresse obligatoire'),
    genre: Yup.string().required('Genre obligatoire'),
    roleId: Yup.string().required('Rôle obligatoire'),
    countryCode: Yup.string().required('Code pays obligatoire'),
  });

  //  Initialisation Formik
  const formik = useFormik({
    initialValues: {
      lastname: '',
      firstname: '',
      email: '',
      contact: '',
      countryCode: '+221',
      genre: '',
      roleId: '',
      password: '',
      address: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      const fullPhone = `${values.countryCode}${values.contact}`;

      // crée un nouvel objet sans contact ni countryCode
      const { contact, countryCode, ...rest } = values;
      const payload = { ...rest, phone: fullPhone };

      try {
        await userService.createUser(payload);
        Swal.fire('Succès', 'Utilisateur créé avec succès', 'success');
        router.push('/users');
      } catch (error: any) {
        console.error('Erreur création utilisateur:', error);
        const errorMessage = error?.response?.data?.message || error?.message || 'Erreur de création';
        Swal.fire('Erreur', errorMessage, 'error');
      }
    },
  });

  const { values, errors, touched, handleChange, handleBlur, handleSubmit } = formik;

  const downSM = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event: any) => event.preventDefault();
  const [rolesData, setRolesData] = useState<any[]>([]);
  const [_entitesData, setEntitesData] = useState<any[]>([]);
  const roleService = new RoleService();
  const entiteService = new EntiteService();
  const userService = new UserService();
  // const rsoService = new RsoService();

  const fetchRoleData = async () => {
    try {
      const response = await roleService.getAllRoles(); // GET /roles
      setRolesData(response);
    } catch (_error: any) {
    }
  };
  const fetchEntiteData = async () => {
    try {
      const response = await entiteService.getAllEntites(); // GET /roles
      setEntitesData(response);
    } catch (_error: any) {
    }
  };
  const fetchRsoData = async () => {
    // try {
    //   const response = await rsoService.getAllRso(); // GET /roles
    //   console.log('res',response);
      
    //   setRsoData(response);
    // } catch (error: any) {
    //   console.log(error);
    // }
  };

  useEffect(() => {
    if (!canManageUsers) return;
    fetchRoleData();
    fetchEntiteData();
    fetchRsoData();
  }, [canManageUsers]);

  if (!canManageUsers) {
    return (
      <MainCard>
        <Alert severity="warning">
          Vous n&apos;avez pas l’autorisation de créer des utilisateurs. Veuillez contacter un administrateur.
        </Alert>
      </MainCard>
    );
  }

  return (
    <>
      <MainCard
        border={false}
        content={false}
        sx={(theme: Theme) => ({
          bgcolor: 'primary.lighter',
          ...theme.applyStyles('dark', { bgcolor: 'primary.700' }),
          position: 'relative'
        })}
      >
        <Box
          sx={(theme: Theme) => ({
            position: 'absolute',
            bottom: '-7px',
            left: 0,
            zIndex: 1,
            ...(theme.direction === ThemeDirection.RTL && { transform: 'rotate(180deg)', top: -7, bottom: 'unset' })
          })}
        >
          <BackLeft />
        </Box>
        <Grid container sx={{ justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 5 }}>
          <Grid>
            <Stack direction="row" sx={{ gap: { xs: 1, sm: 2 }, alignItems: 'center' }}>
              <Box sx={{ ml: { xs: 0, sm: 1 } }}>
                <ProfileRadialChart />
              </Box>
              <Stack sx={{ gap: 0.75 }}>
                <Typography variant="h5">Creer un utilisateur</Typography>
                <Typography variant="body2">Creation d'un compte utilisateur</Typography>
              </Stack>
            </Stack>
          </Grid>
          <Grid sx={{ mx: { xs: 2, sm: 3 }, my: { xs: 1, sm: 0 }, mb: { xs: 2, sm: 0 } }} size={downSM ? 12 : 'auto'}>
            <Button variant="contained" fullWidth={downSM} component={Link} href="/apps/profiles/user/personal">
              Mon Profile
            </Button>
          </Grid>
        </Grid>
        <Box
          sx={(theme: Theme) => ({
            position: 'absolute',
            top: 0,
            right: 0,
            zIndex: 1,
            ...(theme.direction === ThemeDirection.RTL && { transform: 'rotate(180deg)', top: 16, bottom: 'unset' })
          })}
        >
          <BackRight />
        </Box>
      </MainCard>

      <MainCard
        content={false}
        title="Créer un utilisateur"
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
              <Grid size={{ xs: 12, sm: 4 }}>
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
              {/* Entite */}
              {/* <Grid size={{ xs: 12, sm: 4 }}>
                <InputLabel>Structure</InputLabel>
                <Select
                  name="entiteId"
                  value={values.entiteId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  fullWidth
                  error={touched.entiteId && Boolean(errors.entiteId)}
                >
                  {entitesData.map((entite) => (
                    <MenuItem key={entite.id} value={entite.id}>
                      {entite.nom}
                    </MenuItem>
                  ))}
                </Select>
                {touched.entiteId && errors.entiteId && (
                  <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
                    {errors.entiteId}
                  </Box>
                )}
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <InputLabel>Rso</InputLabel>
                <Select
                  name="rsoId"
                  value={values.rsoId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  fullWidth
                  error={touched.rsoId && Boolean(errors.rsoId)}
                >
                  {rsoData.map((rso) => (
                    <MenuItem key={rso.id} value={rso.id}>
                      {rso.name}
                    </MenuItem>
                  ))}
                </Select>
                {touched.rsoId && errors.rsoId && (
                  <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
                    {errors.rsoId}
                  </Box>
                )}
              </Grid> */}

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
              {/* Mot de passe */}
              <Grid size={{ xs: 12, sm: 4 }}>
                <InputLabel>Mot de passe <span style={{ color: 'red' }}>*</span></InputLabel>
                <TextField
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  fullWidth
                  error={touched.password && Boolean(errors.password)}
                  helperText={touched.password && errors.password}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                        >
                          {showPassword ? <Eye /> : <EyeSlash />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              {/* Adresse */}
              <Grid size={{ xs: 12 }}>
                <InputLabel>Adresse</InputLabel>
                <TextField
                  name="address"
                  multiline
                  rows={3}
                  value={values.address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  fullWidth
                  error={touched.address && Boolean(errors.address)}
                  helperText={touched.address && errors.address}
                />
              </Grid>

              {/* Boutons */}
              <Grid size={{ xs: 12 }}>
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => router.push('/users')}
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
      </MainCard>
    </>
  );
};

export default AddUser;

