// material-ui
'use client';
import Grid from '@mui/material/Grid';

import Chip from '@mui/material/Chip';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// material-ui
import Button from '@mui/material/Button';

import Box from '@mui/material/Box';

// assets
import {  Building, Calendar, Eye, Map, Trash } from '@wandersonalwes/iconsax-react';

// material-ui
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project-imports
import Avatar from 'components/@extended/Avatar';
import MainCard from 'components/MainCard';
import { GRID_COMMON_SPACING } from 'config';
import { Ip } from 'types/ip';
import { IpService } from 'services/plan-surete/ip.service';
import formatDateOrDash from 'utils/formatDate';
import isNotExpired from 'utils/isNotExpired';
import { SiteService} from 'services/plan-surete/site.service';
import { Site } from 'types/site';
import { co } from '@fullcalendar/core/internal-common';

export interface TicketCommonCardProps {
  borderLeft?: boolean;
  borderColor?: string;
  ip: Ip;
  showAvatarStack: boolean;
  drawerOpen: () => void;
}
export type TicketNotificationsCardProps = {
  title: string;
  tickets: any[];
};
const ipService = new IpService();
const siteService = new SiteService();

function IpListCard() {
  const [showAvatarStack, setShowAvatarStack] = useState(true);
  const [openDrawer, setOpenDrawer] = useState<boolean>(false);
  const [selectedIp, setSelectedIp] = useState<Ip | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const handleDrawerOpen = () => {
    setOpenDrawer((prevState) => !prevState);
  };
  const editer = () => {
    setOpenDrawer((prevState) => !prevState);
    console.log('Éditer cliqué');
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
          const result = await ipService.getAllIps();
          const sitesResult = await siteService.getAllSites();
          if (sitesResult && mounted) {
          setSites(sitesResult as Site[]);
          }
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
          <Typography variant="h5">Listes des installations portuaires</Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button variant="contained" color="primary" onClick={handleDrawerOpen}>
              Ouvrir IP
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
                <Typography variant="h6">Créer un IP</Typography>
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
                  const payload: Partial<Ip> = {
                  name: form.get('name') as string,
                  startDate: form.get('startDate') ? new Date(form.get('startDate') as string) : undefined,
                  refDate: form.get('refDate') ? new Date(form.get('refDate') as string) : undefined,
                  expiredDate: form.get('expiredDate') ? new Date(form.get('expiredDate') as string) : undefined,
                  siteId: form.get('siteId') as string,
                  longitude: form.get('longitude') ? parseFloat(form.get('longitude') as string) : undefined,
                  latitude: form.get('latitude') ? parseFloat(form.get('latitude') as string) : undefined,
                  };

                  try {
                  await ipService.createIp(payload);
                  setSnackbar({ open: true, message: 'IP créé avec succès', severity: 'success' });

                  // Ferme le modal
                  handleDrawerOpen();
                  try {
                  const refreshed = await ipService.getAllIps();
                  setIpData(refreshed as Ip[]);
                  setSnackbar({ open: true, message: 'Liste des IP mise à jour', severity: 'success' });
                  } catch (refreshErr) {
                  console.error('Erreur lors du rafraîchissement des IP:', refreshErr);
                  setSnackbar({ open: true, message: 'IP créé, mais erreur lors du rafraîchissement', severity: 'warning' });
                  }
                  } catch (err) {
                  console.error('Erreur création IP', err);
                  setSnackbar({ open: true, message: 'Erreur lors de la création de l\'IP', severity: 'error' });
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
                  Date de délivrance
                  </label>
                  <input name="startDate" id="startDate" type="date" style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #e0e0e0' }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                  <label htmlFor="refDate" style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>
                  Date de référence
                  </label>
                  <input name="refDate" id="refDate" type="date" style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #e0e0e0' }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                  <label htmlFor="expiredDate" style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>
                  Date d&apos;expiration
                  </label>
                  <input name="expiredDate" id="expiredDate" type="date" style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #e0e0e0' }} />
                  </Box>
                  </Stack>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Box sx={{ flex: 1 }}>
                  <label htmlFor="siteId" style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>
                  Site
                  </label>
                  <select name="siteId" id="siteId" required style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #e0e0e0' }}>
                  <option value="">Sélectionner un Site</option>
                  {sites.map((site) => (
                    <option key={site.id} value={site.id}>
                    {site.name}
                    </option>
                  ))}
                  </select>
                  </Box>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Box sx={{ flex: 1 }}>
                    <label htmlFor="latitude" style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>
                    Latitude
                    </label>
                    <input name="latitude" id="latitude" type="string" style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #e0e0e0' }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <label htmlFor="longitude" style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>
                    Longitude
                    </label>
                    <input name="longitude" id="longitude" type="string" style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #e0e0e0' }} />
                  </Box>
                  </Stack>

                  </Stack>

                  <Stack direction="row" sx={{ justifyContent: 'flex-end', gap: 1 }}>
                  <Button variant="outlined" color="secondary" onClick={handleDrawerOpen}>
                  Annuler
                  </Button>
                  <Button type="submit" variant="contained" color="primary">
                  Créer l&apos;IP
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
      {ipData.map((ip, index) => (
        <IpCommonCard
          key={index}
          drawerOpen={editer}
          showAvatarStack={showAvatarStack}
          borderLeft={true}
          ip={ip}
        />
        
      ))}
    </Stack>
  );
}

function IpCommonCard({
  borderLeft = false,
    ip,
  showAvatarStack = true,
  drawerOpen
}: TicketCommonCardProps) {
  const router = useRouter();
  return (
    <MainCard sx={{ borderLeft: borderLeft ? 3 : 1, borderLeftColor: borderLeft ? (isNotExpired(ip.expiredDate) ? 'success.main':'error.main') : 'divider' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: { xs: 2, sm: 3 } }}>
        <Stack direction={{ xs: 'row', sm: 'column' }} sx={{ gap: 1, alignItems: { xs: 'center', sm: 'flex-start' } }}>
            <Avatar sx={{ height: 60, width: 60, bgcolor:(isNotExpired(ip.expiredDate) ? 'success.lighter':'error.lighter'), color: (isNotExpired(ip.expiredDate) ? 'success.main':'error.main') }}>
                <Building style={{ width: '50%', height: '50%' }} />
            </Avatar>
        </Stack>
        <Stack sx={{ gap: 1, width: 1 }}>
          <Stack direction="row" onClick={drawerOpen} sx={{ gap: 1, alignItems: 'flex-start', cursor: 'pointer' }}>
            <Typography variant="h5">{ip.site.name}</Typography>
          </Stack>

          {showAvatarStack && (
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              onClick={drawerOpen}
              sx={{ gap: 1, alignItems: { xs: 'flex-start', sm: 'center', cursor: 'pointer' } }}
            >
              <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
               {isNotExpired(ip.expiredDate) ? (<Chip variant="light" color="success" label="VALIDE" size="small" />) : (<Chip variant="light" color="error" label="EXPIRÉ" size="small" />)    }
              </Stack>
              <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
                <Calendar size={14} />
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                Date de délivrance <Box component="span" sx={{ fontWeight: 600 }}>{formatDateOrDash(ip.startDate)}</Box>
                </Typography>
              </Stack>
              <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
                <Calendar size={14} />
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  Date d&apos;expiration <Box component="span" sx={{ fontWeight: 600 }}>{formatDateOrDash(ip.expiredDate)}</Box>
                </Typography>
              </Stack>
              
            </Stack>
          )}

        <Stack direction="row" sx={{ gap: 0.5, alignItems: 'center' }}>
            <Map size={16} style={{ color: '#f44336' }} />
            <Typography variant="h5">{ip.name}</Typography>
        </Stack>

          <Stack direction="row" sx={{ gap: 1.5 }}>
            <Button
              startIcon={<Eye />}
              variant="dashed"
              sx={{ border: 'none' }}
              color="primary"
              onClick={() => router.push('/plan-surete/ips/details/' + ip.id)}
            >
              Voir l&apos;installation Portuaires
            </Button>
            <Button startIcon={<Trash />} variant="dashed" sx={{ border: 'none' }} color="error">
              Supprimer
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </MainCard>
  );
}
export default function IpList() {

  return (
    <>
      <Grid container spacing={GRID_COMMON_SPACING}>
        {/* row 1 */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <IpListCard />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack sx={{ gap: GRID_COMMON_SPACING }}>
            
          </Stack>
        </Grid>
      </Grid>
    </>
  );
}