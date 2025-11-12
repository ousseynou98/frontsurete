// material-ui
import Button from '@mui/material/Button';
import CardMedia from '@mui/material/CardMedia';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project-imports
import AnimateButton from 'components/@extended/AnimateButton';
import MainCard from 'components/MainCard';

// assets
const avatar = '/assets/images/users/customer-support-1.png';

// ==============================|| DRAWER CONTENT - NAV CARD ||============================== //

export default function NavCard() {
  return (
    <MainCard sx={{ bgcolor: 'secondary.lighter', m: 3 }}>
      <Stack sx={{ gap: 2.5, alignItems: 'center' }}>
        <Stack sx={{ alignItems: 'center' }}>
          <Typography variant="h5">Besoin d'aide ?</Typography>
          <Typography variant="h6" color="secondary">
            Contactez notre support 24/7 
          </Typography>

          <Link href="mailto:support@anam.sn">support@anam.sn</Link>
        </Stack>
      </Stack>
    </MainCard>
  );
}
