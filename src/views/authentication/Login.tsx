// next
import Image from 'next/image';


// material-ui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project-imports
import AuthWrapper from 'sections/auth/AuthWrapper';
import AuthLogin from 'sections/auth/auth-forms/AuthLogin';
import { Box } from '@mui/material';

// ================================|| LOGIN ||================================ //

export default function Login() {
  return (
    <AuthWrapper>
      <Grid container spacing={3}>
        <Grid size={12}>
          <Stack direction="row" sx={{ justifyContent: 'center', alignItems: 'baseline', mb: { xs: -0.5, sm: 0.5 } }}>
             <Box display="flex" justifyContent="center" alignItems="center">
      <Image
        src="/assets/images/auth/anam.png" // chemin public
        alt="Logo ANAM"
        width={70}
        height={70}
      />
       
    </Box>
          </Stack>
          <Stack sx={{ justifyContent: 'center', alignItems: 'center', mb: { xs: -0.5, sm: 0.5 } }}>
             <Typography variant="body1">Portail de connexion</Typography>
          </Stack>
        </Grid>
        <Grid size={12}>
          <AuthLogin />
        </Grid>
      </Grid>
    </AuthWrapper>
  );
}
