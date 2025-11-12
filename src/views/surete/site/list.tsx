'use client';

import { useMemo, useState, Fragment, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

// project-imports
import MainCard from 'components/MainCard';
import Avatar from 'components/@extended/Avatar';



// material-ui
// useTheme removed (not needed here)
import Grid from '@mui/material/Grid';

import { APP_DEFAULT_PATH, GRID_COMMON_SPACING } from 'config';
import { SiteService } from 'services/plan-surete/site.service';
import { Site } from 'types/site';

// assets
import { Profile2User, Eye, DocumentText1, Card, Ship, GasStation, Drop, Flash, Wind } from '@wandersonalwes/iconsax-react';
import { GenericCardProps } from 'types/root';

interface Props {
  title: string;
  icon: GenericCardProps['iconPrimary'];
  color: string;
  bgcolor: string;
}
interface SiteCardProps extends Props {
  onClick?: () => void;
  selected?: boolean;
}
const typeSites = [
  { value: 'Port', icon: Ship, color: 'primary.darker', bgcolor: 'primary.lighter'  },
  { value: 'Plateforme gazière', icon:Wind , color: 'warning.darker', bgcolor: 'warning.lighter'  },
  { value: 'Plateforme petrolier', icon: GasStation, color: 'error.darker', bgcolor: 'error.lighter'  },
  
];

// avatarImage removed (unused)
const siteService = new SiteService();

export function SiteCard({ title, icon, color, bgcolor, onClick, selected }: SiteCardProps) {
  const IconPrimary = icon!;
  const primaryIcon = icon ? <IconPrimary /> : null;

  return (
    <MainCard content={false} sx={{ p: 2.5, cursor: onClick ? 'pointer' : 'default', border: selected ? (theme: any) => `2px solid ${theme.palette.primary.main}` : undefined }} onClick={onClick}>
      <Stack direction="row" gap={2} alignItems="center">
        <Avatar variant="rounded" sx={{ bgcolor, color }} size="md">
          {primaryIcon}
        </Avatar>
        <Stack width={1}>
          <Typography color="text.secondary">{title}</Typography>
        </Stack>
      </Stack>
    </MainCard>
  );
}

export default function SiteList() {
  const [loading, setLoading] = useState(true);
  const [lists, setLists] = useState<Site[]>([]);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({
    open: false,
    message: '',
    severity: 'success'
  });
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        // Assure-toi d'importer siteService en haut du fichier : import siteService from 'services/siteService';
        const result = await siteService.getAllSites();
        if (!mounted) return;
        // Adapter selon la shape de la réponse (result ou result.data)
        setLists((result as any)?.data ?? (result as any) ?? []);
        setSnackbar({ open: true, message: 'Sites chargés', severity: 'success' });
      } catch (error) {
        console.error('Error fetching sites:', error);
        setSnackbar({ open: true, message: 'Erreur lors du chargement des sites', severity: 'error' });
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);
  // theme not needed in this component
  const [siteName, setSiteName] = useState('');
  const [siteType, setSiteType] = useState(typeSites[0].value);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSiteNameChange = (e: React.ChangeEvent<HTMLInputElement>) => setSiteName(e.target.value);
  const handleSiteTypeChange = (e: SelectChangeEvent<string>) => setSiteType(e.target.value as string);

  const addSite = async () => {
    if (!siteName?.trim()) {
      setSnackbar({ open: true, message: 'Le nom du site est requis', severity: 'warning' });
      return;
    }
    try {
      const res = await siteService.createSite({ name: siteName.trim(), type: siteType });
      const created = (res as any)?.data ?? res;
      setLists(prev => [...prev, created]);
      setSiteName('');
      setSiteType(typeSites[0].value);
      setSelectedId(created.id ?? null);
      setSnackbar({ open: true, message: 'Site ajouté avec succès', severity: 'success' });
    } catch (err) {
      console.error('Erreur ajout site', err);
      setSnackbar({ open: true, message: "Erreur lors de l'ajout du site", severity: 'error' });
    }
  };

  const editSite = async () => {
    if (!selectedId) {
      setSnackbar({ open: true, message: 'Aucun site sélectionné pour modification', severity: 'warning' });
      return;
    }
    try {
      const res = await siteService.updateSite(selectedId, { name: siteName.trim(), type: siteType });
      const updated = (res as any)?.data ?? res;
      setLists(prev => prev.map(s => (s.id === selectedId ? { ...(s as any), ...updated } : s)));
      setSnackbar({ open: true, message: 'Site modifié avec succès', severity: 'success' });
    } catch (err) {
      console.error('Erreur modification site', err);
      setSnackbar({ open: true, message: 'Erreur lors de la modification du site', severity: 'error' });
    }
  };

  const deleteSite = async () => {
    if (!selectedId) {
      setSnackbar({ open: true, message: 'Aucun site sélectionné pour suppression', severity: 'warning' });
      return;
    }
    try {
      await siteService.deleteSite(selectedId);
      setLists(prev => prev.filter(s => s.id !== selectedId));
      setSelectedId(null);
      setSiteName('');
      setSiteType(typeSites[0].value);
      setSnackbar({ open: true, message: 'Site supprimé avec succès', severity: 'success' });
    } catch (err) {
      console.error('Erreur suppression site', err);
      setSnackbar({ open: true, message: 'Erreur lors de la suppression du site', severity: 'error' });
    }
  };

  return (
    <>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <TextField
          label="Nom du site"
          variant="outlined"
          value={siteName}
          onChange={handleSiteNameChange}
          sx={{ minWidth: 360, flexGrow: 1 }}
        />
        <Select
          value={siteType}
          onChange={handleSiteTypeChange}
          variant="outlined"
          sx={{ minWidth: 280 }}
        >
          {typeSites.map(type => (
            <MenuItem key={type.value} value={type.value}>{type.value}</MenuItem>
          ))}
        </Select>
        <Button onClick={addSite} variant="contained" color="primary" startIcon={<Profile2User />}>
          Ajouter
        </Button>
        <Button onClick={editSite} disabled={!selectedId} variant="outlined" color="warning" startIcon={<DocumentText1 />}>
          Modifier
        </Button>
        <Button onClick={deleteSite} disabled={!selectedId} variant="outlined" color="error" startIcon={<Card />}>
          Supprimer
        </Button>
      </Stack>
      <Grid container spacing={GRID_COMMON_SPACING}>
        {lists.map((site, index) => {
          // Trouver le type correspondant
          const type = typeSites.find(t => t.value === site.type) || typeSites[0];
          return (
            <Grid key={site.id || index} size={{ xs: 12, sm: 6, lg: 3 }}>
              <SiteCard
                title={site.name}
                icon={type.icon}
                color={type.color}
                bgcolor={type.bgcolor}
                onClick={() => {
                  setSelectedId(site.id ?? null);
                  setSiteName(site.name);
                  setSiteType(site.type);
                }}
                selected={selectedId === site.id}
              />
            </Grid>
          );
        })}
      </Grid>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}




