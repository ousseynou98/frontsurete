// material-ui

// project-imports
import { GRID_COMMON_SPACING } from 'config';
import MainCard from 'components/MainCard';

import Grid from '@mui/material/Grid';

import Chip from '@mui/material/Chip';
import {useState } from 'react';


import Box from '@mui/material/Box';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

// assets
import {  Building, Calendar, Map } from '@wandersonalwes/iconsax-react';

// material-ui
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export interface TicketCommonCardProps {
  borderLeft?: boolean;
  borderColor?: string;
  ip: Ip;
  showAvatarStack: boolean;
}

// project-imports
import Avatar from 'components/@extended/Avatar';
import { Ip } from 'types/ip';
import formatDateOrDash from 'utils/formatDate';
import isNotExpired from 'utils/isNotExpired';
import { ipService } from 'services/plan-surete/ip.service';
function IncomingRequests({
  borderLeft = false,
    ip,
  showAvatarStack = true
}: TicketCommonCardProps) {
  return (
    <MainCard sx={{ borderLeft: borderLeft ? 3 : 1, borderLeftColor: borderLeft ? (isNotExpired(ip.expiredDate) ? 'success.main':'error.main') : 'divider' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: { xs: 2, sm: 3 } }}>
        <Stack direction={{ xs: 'row', sm: 'column' }} sx={{ gap: 1, alignItems: { xs: 'center', sm: 'flex-start' } }}>
            <Avatar sx={{ height: 60, width: 60, bgcolor:(isNotExpired(ip.expiredDate) ? 'success.lighter':'error.lighter'), color: (isNotExpired(ip.expiredDate) ? 'success.main':'error.main') }}>
                <Building style={{ width: '50%', height: '50%' }} />
            </Avatar>
        </Stack>
        <Stack sx={{ gap: 1, width: 1 }}>
          <Stack direction="row"  sx={{ gap: 1, alignItems: 'flex-start', cursor: 'pointer' }}>
            <Typography variant="h5">{ip.site.name}</Typography>
          </Stack>

          {showAvatarStack && (
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
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
                  Date d'expiration <Box component="span" sx={{ fontWeight: 600 }}>{formatDateOrDash(ip.expiredDate)}</Box>
                </Typography>
              </Stack>
              
            </Stack>
          )}

        <Stack direction="row" sx={{ gap: 0.5, alignItems: 'center' }}>
            <Map size={16} style={{ color: '#f44336' }} />
            <Typography variant="h5">{ip.name}</Typography>
        </Stack>

          <Stack direction="row" sx={{ gap: 1.5 }}>
          </Stack>
        </Stack>
      </Stack>
    </MainCard>
  );
}
export default function IpDetailsData({
  borderLeft = false,
  ip,
  showAvatarStack = true,
}: TicketCommonCardProps) {
  const [selectedPosition, setSelectedPosition] = useState<{ lat: number; lng: number } | null>(null);

  // Charger l'API Google Maps
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  // Position initiale (Dakar par défaut) ou coordonnées de l'ip si valides
  const parseNum = (v: any): number | null => {
    if (v == null) return null;
    const n = typeof v === 'number' ? v : parseFloat(String(v));
    return Number.isFinite(n) ? n : null;
  };

  const latCandidate = parseNum((ip as any).latitude ?? (ip as any).lat ?? (ip as any).location?.lat);
  const lngCandidate = parseNum((ip as any).longitude ?? (ip as any).lng ?? (ip as any).location?.lng);

  const isValidLat = (v: number | null) => v !== null && v >= -90 && v <= 90;
  const isValidLng = (v: number | null) => v !== null && v >= -180 && v <= 180;

  const defaultCenter = (isValidLat(latCandidate) && isValidLng(lngCandidate))
    ? { lat: latCandidate as number, lng: lngCandidate as number }
    : { lat: 14.716677, lng: -17.467686 };
    
  return (
    <Grid container spacing={GRID_COMMON_SPACING}>
      {/* row 5 */}
      <Grid size={{ xs: 12, md: 12, lg: 6 }}>
        <IncomingRequests borderLeft={borderLeft} ip={ip} showAvatarStack={showAvatarStack} />
      </Grid>
      <Grid size={{ xs: 12, md: 12, lg: 6 }}>
        <MainCard sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Sélectionnez une position sur la carte
          </Typography>
          {isLoaded ? (
            <Box sx={{ height: 400, width: '100%' }}>
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={selectedPosition || defaultCenter}
                zoom={15}
                onClick={e => {
                  const lat = e.latLng?.lat();
                  const lng = e.latLng?.lng();
                  if (lat && lng) setSelectedPosition({ lat, lng });
                }}
              >
                {selectedPosition && (
                  <Marker position={selectedPosition} />
                )}
              </GoogleMap>
            </Box>
          ) : (
            <Typography>Chargement de la carte...</Typography>
          )}
            {selectedPosition && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1">
              Latitude : {selectedPosition.lat}
              </Typography>
              <Typography variant="body1">
              Longitude : {selectedPosition.lng}
              </Typography>

              {(selectedPosition.lat !== (latCandidate ?? 0) || selectedPosition.lng !== (lngCandidate ?? 0)) && (
              <Box sx={{ mt: 2 }}>
                <button
                type="button"
                onClick={async () => {
                  const id = (ip as any).id ?? (ip as any).uuid;
                  const res = await ipService.updateCoordinates(id, {
                    latitude: Number(selectedPosition.lat),
                    longitude: Number(selectedPosition.lng)
                  });
                    const showToast = (message: string, duration = 5000) => {
                    const toast = document.createElement('div');
                    toast.textContent = message;
                    Object.assign(toast.style, {
                      position: 'fixed',
                      right: '20px',
                      bottom: '20px',
                      background: '#323232',
                      color: '#fff',
                      padding: '12px 16px',
                      borderRadius: '6px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      zIndex: '9999',
                      opacity: '0',
                      transition: 'opacity 300ms ease-in-out, transform 300ms ease-in-out',
                      transform: 'translateY(8px)'
                    });
                    document.body.appendChild(toast);
                    // trigger enter animation
                    requestAnimationFrame(() => {
                      toast.style.opacity = '1';
                      toast.style.transform = 'translateY(0)';
                    });
                    // hide after duration
                    setTimeout(() => {
                      toast.style.opacity = '0';
                      toast.style.transform = 'translateY(8px)';
                      setTimeout(() => toast.remove(), 300);
                    }, duration);
                    };
                    showToast('Coordonnées mises à jour avec succès.');
                }}
                style={{ padding: '8px 12px', borderRadius: 4, background: '#1976d2', color: '#fff', border: 'none', cursor: 'pointer' }}
                >
                Enregistrer
                </button>
              </Box>
              )}
            </Box>
            )}
        </MainCard>
      </Grid>
    </Grid>
  );
}
