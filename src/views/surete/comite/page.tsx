// material-ui
'use client';
import Grid from '@mui/material/Grid';

import Chip from '@mui/material/Chip';
import { MouseEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// material-ui
import Button from '@mui/material/Button';

import Box from '@mui/material/Box';

// assets
import {  Building, Calendar, Electricity, Eye, Map, MessageText, People, Trash, User } from '@wandersonalwes/iconsax-react';

// material-ui
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';


// assets
import { Element3, HambergerMenu, TextalignJustifycenter } from '@wandersonalwes/iconsax-react';

// project-imports
import Avatar from 'components/@extended/Avatar';
import MainCard from 'components/MainCard';
import { GRID_COMMON_SPACING } from 'config';
import { Ip } from 'types/ip';
import { IpService } from 'services/plan-surete/ip.service';
import formatDateOrDash from 'utils/formatDate';
import isNotExpired from 'utils/isNotExpired';
import TotalRevenue from 'sections/widget/data/TotalRevenue';
import MonthlyRevenue from 'sections/widget/data/MonthlyRevenue';
import { Comite } from 'types/comite';
import InfoComite from './infoComite';
import { ComiteService } from 'services/plan-surete/comite.service';
import { RsoService } from 'services/plan-surete/rso.service';
import { co } from '@fullcalendar/core/internal-common';


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


const ipService = new IpService();
const comiteService = new ComiteService();
const rsoService = new RsoService();

function ComiteListCard() {
  const [showAvatarStack, setShowAvatarStack] = useState(true);
  const [openDrawer, setOpenDrawer] = useState<boolean>(false);
  const [comites, setComites] = useState<Comite[]>([]);
  const handleDrawerOpen = () => {
    setOpenDrawer((prevState) => !prevState);
  };
  const [ipData, setIpData] = useState<Ip[]>([]);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({
      open: false,
      message: '',
      severity: 'success'
    });
    useEffect(() => {
      let mounted = true;
  
      (async () => {
        try {
          const resultComites = await comiteService.getAllComites();
          setComites(resultComites as Comite[]);
            if (!mounted) return;
            setSnackbar({ open: true, message: 'Comités chargés', severity: 'success' });
        } catch (error) {
          console.error('Error fetching comites:', error);
        }

        try {
          const result = await ipService.getAllIps();
          setIpData(result as Ip[]);
          console.log('Fetched IP data:', result);
          if (!mounted) return;
          setSnackbar({ open: true, message: 'IP chargés', severity: 'success' });
        } catch (error) {
          console.error('Error fetching IP:', error);
          setSnackbar({ open: true, message: 'Erreur lors du chargement des IP', severity: 'error' });
        }
      })();
  
      return () => {
        mounted = false;
      };
    }, []);

  return (
    <Stack sx={{ gap: GRID_COMMON_SPACING }}>
      <MainCard>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5">Listes des comités de pilotage</Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button variant="contained" color="primary" onClick={handleDrawerOpen}>
              Ouvrir comité
            </Button>
            {openDrawer && (
              <Box
              sx={{
                position: 'fixed',
                inset: 0,
                zIndex: 1300,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              >
              {/* Backdrop */}
              <Box
                onClick={handleDrawerOpen}
                sx={{
                position: 'absolute',
                inset: 0,
                bgcolor: 'rgba(0,0,0,0.5)'
                }}
              />
              {/* Modal content */}
              <MainCard sx={{ width: { xs: '95%', sm: 700 }, zIndex: 1301, p: 3 }}>
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6">Créer un comité</Typography>
                <Button size="small" color="error" variant="text" onClick={handleDrawerOpen}>
                  Fermer
                </Button>
                </Stack>

                <Box
                component="form"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = new FormData(e.currentTarget as HTMLFormElement);
                  console.log('Form data:', Object.fromEntries(form.entries()));
                  const payload: Partial<Comite> = {
                  name: form.get('name') as string,
                  status:'EN COURS',
                  startDate: form.get('startDate') ? new Date(form.get('startDate') as string) : undefined,
                  endDate: form.get('endDate') ? new Date(form.get('endDate') as string) : undefined,
                  ipId: form.get('ipId') as string,
                  rsoId: form.get('rsoId') as string,
                  };

                  try {
                  // Utilise le service comite pour créer le comite
                  // NOTE: adapte la méthode si votre service attend un autre nom (create / createComite)
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  const created = await comiteService.create?.(payload) ?? await comiteService.createComite?.(payload);
                  setSnackbar({ open: true, message: 'Comité créé avec succès', severity: 'success' });

                  // Ferme le modal
                  handleDrawerOpen();

                  // Rafraîchir la liste des comités immédiatement après création
                  try {
                  const refreshed = await comiteService.getAllComites();
                  setComites(refreshed as Comite[]);
                  setSnackbar({ open: true, message: 'Liste des comités mise à jour', severity: 'success' });
                  } catch (refreshErr) {
                  console.error('Erreur lors du rafraîchissement des comités:', refreshErr);
                  setSnackbar({ open: true, message: 'Comité créé, mais erreur lors du rafraîchissement', severity: 'warning' });
                  }

                  // Optionnel: console log / refresh list
                  // console.log('Comité créé', created);
                  } catch (err) {
                  console.error('Erreur création comité', err);
                  setSnackbar({ open: true, message: 'Erreur lors de la création du comité', severity: 'error' });
                  }
                }}
                >
                <Stack spacing={2}>
                  <Box>
                  <label htmlFor="name" style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>
                  Nom du comité
                  </label>
                  <input name="name" id="name" required placeholder="Nom du comité" style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #e0e0e0' }} />
                  </Box>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Box sx={{ flex: 1 }}>
                  <label htmlFor="startDate" style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>
                  Date de début
                  </label>
                  <input name="startDate" id="startDate" type="date" style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #e0e0e0' }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                  <label htmlFor="endDate" style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>
                  Date de fin
                  </label>
                  <input name="endDate" id="endDate" type="date" style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #e0e0e0' }} />
                  </Box>
                  </Stack>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Box sx={{ flex: 1 }}>
                  <label htmlFor="ipId" style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>
                  Installation portuaire (IP)
                  </label>
                  <select name="ipId" id="ipId" required style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #e0e0e0' }}>
                  <option value="">Sélectionner une IP</option>
                  {ipData.map((ip) => (
                    // ip.id and ip.name proviennent du state ipData
                    <option key={ip.id} value={ip.id}>
                    {ip.name}
                    </option>
                  ))}
                  </select>
                  </Box>

                  <Box sx={{ width: 220 }}>
                  <label htmlFor="rsoId" style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>
                    RSO
                  </label>
                  <select
                    name="rsoId"
                    id="rsoId"
                    required
                    style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #e0e0e0' }}
                    onFocus={async (e) => {
                    const el = e.currentTarget as HTMLSelectElement;
                    if (el.dataset.loaded) return;
                    try {
                      const rsos = (await rsoService.getAllRsos()) ?? [];
                      rsos.forEach((r: any) => {
                      const opt = document.createElement('option');
                      opt.value = r.id;
                      opt.text = r.name;
                      el.appendChild(opt);
                      });
                      el.dataset.loaded = '1';
                    } catch (err) {
                      console.error('Erreur chargement RSO', err);
                    }
                    }}
                  >
                    <option value="">Sélectionner un RSO</option>
                  </select>
                  </Box>
                  </Stack>

                  <Stack direction="row" sx={{ justifyContent: 'flex-end', gap: 1 }}>
                  <Button variant="outlined" color="secondary" onClick={handleDrawerOpen}>
                  Annuler
                  </Button>
                  <Button type="submit" variant="contained" color="primary">
                  Créer le comité
                  </Button>
                  </Stack>
                </Stack>
                </Box>
              </MainCard>
              </Box>
            )}
            </Box>
        </Stack>
      </MainCard>
      {comites.map((comite, index) => (
        <ComiteCommonCard
          key={index}
          drawerOpen={handleDrawerOpen}
          showAvatarStack={showAvatarStack}
          borderLeft={true}
          comite={comite}
        />
        
      ))}
    </Stack>
  );
}


function ComiteCommonCard({
  borderLeft = false,
  comite,
  showAvatarStack = true,
  drawerOpen
}: TicketCommonCardProps) {
  const router = useRouter();
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

          <Stack direction="row" sx={{ gap: 1.5 }}>
            <Button
              startIcon={<Eye />}
              variant="dashed"
              sx={{ border: 'none' }}
              color="primary"
              onClick={() => router.push('/plan-surete/comite/details/' + comite.id)}
            >
              Consulter
            </Button>
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
export default function Comite() {

  return (
    <>
      <Grid container spacing={GRID_COMMON_SPACING}>
        {/* row 1 */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <ComiteListCard />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack sx={{ gap: GRID_COMMON_SPACING }}>
            <InfoComite />

          </Stack>
        </Grid>
      </Grid>
    </>
  );
}