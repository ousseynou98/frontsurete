import { useEffect, useState } from 'react';

// material-ui
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// third-party
import { merge } from 'lodash-es';
import * as Yup from 'yup';
import { useFormik, Form, FormikProvider } from 'formik';

// project-imports
import CircularWithPath from 'components/@extended/progress/CircularWithPath';

// types
import { AgentList } from 'types/agent';
import { AgentService } from 'services/agent/agent';
import Swal from 'sweetalert2';
import { MenuItem, Select } from '@mui/material';

// CONSTANT
const getInitialValues = (agent: AgentList | null) => {
  const newAgent = {
    firstname: '',
    lastname: '',
    mat: '',
    contact: '',
    countryCode: '+221',
    active: true,
    agenceId: ''
  };

  if (agent) {
    return merge({}, newAgent, agent);
  }

  return newAgent;
};

interface Props {
  agent: AgentList | null;
  closeModal: () => void;
  onRefresh: () => void;
}
// ==============================|| agent ADD / EDIT - FORM ||============================== //

export default function FormAgentAdd({ agent, closeModal, onRefresh }: Props) {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const agentSchema = Yup.object().shape({
    firstname: Yup.string()
      .max(255, 'Le prénom ne doit pas dépasser 255 caractères')
      .required('Le prénom est obligatoire'),
    lastname: Yup.string()
      .max(255, 'Le nom ne doit pas dépasser 255 caractères')
      .required('Le nom est obligatoire'),
    mat: Yup.string()
      .max(255, 'Le matricule ne doit pas dépasser 255 caractères')
      .required('Le matricule est obligatoire'),
    countryCode: Yup.string().required('Le code pays est obligatoire'),
    contact: Yup.string()
      .matches(/^[0-9]+$/, 'Le numéro doit contenir uniquement des chiffres')
      .required('Le numéro de téléphone est obligatoire'),
    active: Yup.boolean(),
  });

  const agentService = new AgentService();

  const formik = useFormik({
    initialValues: getInitialValues(agent!),
    validationSchema: agentSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setSubmitting(true);
        const phone = `${values.countryCode}${values.contact}`;
        const data = {
          firstname: values.firstname,
          lastname: values.lastname,
          phone,
          mat: values.mat,
        };

        let response;
        if (agent) {
          response = await agentService.updateAgent(agent.id, data);
        } else {
          response = await agentService.createAgent(data);
        }

        closeModal();
        onRefresh();

        await Swal.fire({
          icon: 'success',
          title: agent ? 'Agent modifié avec succès' : 'Agent ajouté avec succès',
          showConfirmButton: false,
          timer: 1800,
          toast: true,
          position: 'top-end',
          customClass: { popup: 'my-swal-toast' },
        });
      } catch (error: any) {
        console.error(error);
        await Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text:
            error.response?.data?.message ||
            'Une erreur est survenue lors de l’enregistrement.',
          confirmButtonText: 'OK',
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  const {
    errors,
    touched,
    handleSubmit,
    isSubmitting,
    getFieldProps,
    values,
    handleChange,
    handleBlur,
  } = formik;

  if (loading)
    return (
      <Box sx={{ p: 5 }}>
        <Stack direction="row" sx={{ justifyContent: 'center' }}>
          <CircularWithPath />
        </Stack>
      </Box>
    );

  return (
    <FormikProvider value={formik}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
          <DialogTitle>{agent ? 'Modifier un agent' : 'Ajouter un agent'}</DialogTitle>
          <Divider />
          <DialogContent sx={{ p: 2.5 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel>Nom</InputLabel>
                  <TextField
                    fullWidth
                    placeholder="Entrez le nom"
                    {...getFieldProps('lastname')}
                    error={Boolean(touched.lastname && errors.lastname)}
                    helperText={touched.lastname && errors.lastname}
                  />
                </Stack>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel>Prénom</InputLabel>
                  <TextField
                    fullWidth
                    placeholder="Entrez le prénom"
                    {...getFieldProps('firstname')}
                    error={Boolean(touched.firstname && errors.firstname)}
                    helperText={touched.firstname && errors.firstname}
                  />
                </Stack>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel>Matricule</InputLabel>
                  <TextField
                    fullWidth
                    placeholder="Entrez le matricule"
                    {...getFieldProps('mat')}
                    error={Boolean(touched.mat && errors.mat)}
                    helperText={touched.mat && errors.mat}
                  />
                </Stack>
              </Grid>

              {/* Téléphone */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <InputLabel>
                  Téléphone <span style={{ color: 'red' }}>*</span>
                </InputLabel>
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
            </Grid>
          </DialogContent>

          <Divider />

          <DialogActions sx={{ p: 2.5 }}>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button color="error" onClick={closeModal}>
                Annuler
              </Button>
              <Button type="submit" variant="contained" disabled={isSubmitting}>
                {agent ? 'Modifier' : 'Enregistrer'}
              </Button>
            </Stack>
          </DialogActions>
        </Form>
      </LocalizationProvider>
    </FormikProvider>
  );
}

