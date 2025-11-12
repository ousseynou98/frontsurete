'use client';
import Grid from '@mui/material/Grid';
import { GRID_COMMON_SPACING } from 'config';

import WelcomeBanner from 'sections/dashboard/default/WelcomeBanner';

export default function DashboardDefault() {
  return (
    <Grid container spacing={GRID_COMMON_SPACING}>
      <Grid size={12}>
        <WelcomeBanner />
      </Grid>
    </Grid>
  );
}
