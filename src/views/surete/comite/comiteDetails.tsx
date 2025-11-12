// material-ui
"use client";
import Grid from '@mui/material/Grid';

import Chip from '@mui/material/Chip';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

// material-ui
import Box from '@mui/material/Box';

// assets (only icons used in this file)
import { Calendar, Map, People, User } from '@wandersonalwes/iconsax-react';

// material-ui
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project-imports
import Avatar from 'components/@extended/Avatar';
import MainCard from 'components/MainCard';
import { GRID_COMMON_SPACING } from 'config';
// ip types/service removed — not needed for this view
import formatDateOrDash from 'utils/formatDate';
import isNotExpired from 'utils/isNotExpired';
import { Comite } from 'types/comite';
import TimelineComite from './timelineComite';
import StateComite from './stateComite';
import { ComiteService } from 'services/plan-surete/comite.service';

const comiteService = new ComiteService();


export interface TicketCommonCardProps {
  borderLeft?: boolean;
  borderColor?: string;
  comite: Comite;
  showAvatarStack: boolean;
  drawerOpen: () => void;
}
export type TicketNotificationsCardProps = {
  title: string;
  tickets: any[];
};


// ipService removed: not required for current view

function IpListCard({ comite }: { comite?: Comite }) {
    const [showAvatarStack] = useState(true);
  // drawer toggling is handled by parent/drawer component; keep a noop here
  const handleDrawerOpen = () => {};

  return (
    <Stack sx={{ gap: GRID_COMMON_SPACING }}>
      {comite ? (
        <IpCommonCard
          drawerOpen={handleDrawerOpen}
          showAvatarStack={showAvatarStack}
          borderLeft={true}
          comite={comite}
        />
      ) : (
        <MainCard>
          <Typography variant="h6">Chargement du comité...</Typography>
        </MainCard>
      )}
    </Stack>
  );
}


function IpCommonCard({
  borderLeft = false,
  comite,
  showAvatarStack = true,
  drawerOpen
}: TicketCommonCardProps) {
  // router not needed here currently
  return (
    <MainCard sx={{ borderLeft: borderLeft ? 3 : 1, borderLeftColor: borderLeft ? (isNotExpired(comite.endDate) || comite.status === 'CLOTURÉ' ? 'success.main':'error.main') : 'divider' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: { xs: 2, sm: 3 } }}>
        <Stack direction={{ xs: 'row', sm: 'column' }} sx={{ gap: 1, alignItems: { xs: 'center', sm: 'flex-start' } }}>
            <Avatar sx={{ height: 60, width: 60, bgcolor:(isNotExpired(comite.endDate) || comite.status === 'CLOTURÉ' ? 'success.lighter':'error.lighter'), color: (isNotExpired(comite.endDate) || comite.status === 'CLOTURÉ' ? 'success.main':'error.main') }}>
                <People style={{ width: '50%', height: '50%' }} />
            </Avatar>
        </Stack>
        <Stack sx={{ gap: 1, width: 1 }}>
          <Stack direction="row" onClick={drawerOpen} sx={{ gap: 1, alignItems: 'flex-start', cursor: 'pointer' }}>
            <Typography variant="h5">{comite.name}</Typography>
          </Stack>

          {showAvatarStack && (
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              onClick={drawerOpen}
              sx={{ gap: 1, alignItems: { xs: 'flex-start', sm: 'center', cursor: 'pointer' } }}
            >
              <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
               <Chip variant="light" color={comite.status === 'EN COURS' ? 'warning' : 'success'} label={comite.status} size="small" /> 
              </Stack>
              <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
                <Calendar size={14} />
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                Date de début <Box component="span" sx={{ fontWeight: 600 }}>{formatDateOrDash(comite.startDate)}</Box>
                </Typography>
              </Stack>
              <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
                <Calendar size={14} />
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  Date de fin <Box component="span" sx={{ fontWeight: 600 }}>{formatDateOrDash(comite.endDate)}</Box>
                </Typography>
              </Stack>
              
            </Stack>
          )}

        <Stack direction="row" sx={{ gap: 0.5, alignItems: 'center' }}>
            <Map size={16} style={{ color: '#f44336' }} />
            <Typography variant="h5">{comite.ip.name}</Typography>
        </Stack>
                  <Chip
          icon={<User />}
          label={`RSO: ${comite.rso.name}`}
          size="small"
          color="warning"
          variant="outlined"
        />
        </Stack>
      </Stack>
    </MainCard>
  );
}
export default function ComiteDetails() {
  const params = useParams() as { id?: string };
  const comiteId = params?.id;
  const [comite, setComite] = useState<Comite | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!comiteId) return;
      const id = Array.isArray(comiteId) ? comiteId[0] : comiteId;
      try {
        const result = await comiteService.getComiteById(id);
        console.log('Fetched Comite:', result);
        if (!mounted) return;
        setComite(result as Comite);
      } catch (error) {
        console.error('Error fetching Comite:', error);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [comiteId]);

  return (
    <>
      <Grid container spacing={GRID_COMMON_SPACING}>
        {/* row 1 */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Grid size={12} sx={{ mb: GRID_COMMON_SPACING }}>
            <IpListCard comite={comite} />
          </Grid>
          <Grid size={12}>
            <StateComite comite={comite} />
          </Grid>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack sx={{ gap: GRID_COMMON_SPACING }}>
            <TimelineComite />

          </Stack>
        </Grid>
      </Grid>
    </>
  );
}