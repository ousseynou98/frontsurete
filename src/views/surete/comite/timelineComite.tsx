// next
import Link from 'next/link';

// material-ui
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Links from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project-imports
import Dot from 'components/@extended/Dot';
import MainCard from 'components/MainCard';

// assets
import { TickCircle } from '@wandersonalwes/iconsax-react';

// ==============================|| DATA WIDGET - TASKS ||============================== //

export default function TimelineComite() {
  return (
    <MainCard
      title="État d'avancement du plan de sûreté"
      content={false}
      secondary={
        <Links component={Link} href="#" color="primary">
          
        </Links>
      }
    >
      <CardContent>
        <Grid
          container
          spacing={3.5}
          sx={{
            alignItems: 'center',
            position: 'relative',
            '&>*': { position: 'relative', zIndex: '5' },

            '&:after': {
              content: '""',
              position: 'absolute',
              top: 20,
              left: 6,
              width: 2,
              height: `calc(100% - 30px)`,
              bgcolor: 'divider',
              zIndex: '1'
            }
          }}
        >
          <Grid size={12}>
            <Grid container spacing={2}>
              <Grid>
                <Box sx={{ color: 'success.main', marginLeft: -0.5 }}>
                  <TickCircle variant="Bold" />
                </Box>
              </Grid>
              <Grid size="grow">
                <Grid container spacing={0}>
                  <Grid size={12}>
                <Typography>10/10/2023 8:50</Typography>
                  </Grid>
                  <Grid size={12}>
                    <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                      Ouverture du plan de sûreté
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid size={12}>
            <Grid container spacing={2}>
              <Grid>
                <Dot size={14} color="primary" componentDiv sx={{ mt: 0.5 }} />
              </Grid>
              <Grid size="grow">
                <Grid container spacing={0}>
                  <Grid size={12}>
                    <Typography>10/10/2023 8:50</Typography>
                  </Grid>
                  <Grid size={12}>
                    <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                      Dépot du rapport et du plan de sûreté par le RSO
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid size={12}>
            <Grid container spacing={2}>
              <Grid>
                <Dot size={14} color="error" componentDiv sx={{ mt: 0.5 }} />
              </Grid>
              <Grid size="grow">
                <Grid container spacing={0}>
                  <Grid size={12}>
                    <Typography>10/10/2023 8:50</Typography>
                  </Grid>
                  <Grid size={12}>
                    <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                      Inspection et validation du plan de sûreté par ANAM
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid size={12}>
            <Grid container spacing={2}>
              <Grid>
                <Dot size={14} color="warning" componentDiv sx={{ mt: 0.5 }} />
              </Grid>
              <Grid size="grow">
                <Grid container spacing={0}>
                  <Grid size={12}>
                    <Typography>10/10/2023 8:50</Typography>
                  </Grid>
                  <Grid size={12}>
                    <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                      Validation finale et clôture du plan de sûreté
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </MainCard>
  );
}
