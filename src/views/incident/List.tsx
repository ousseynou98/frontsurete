'use client';

import { useState, ChangeEvent, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Tooltip,
  Typography,
  Button,
  Box,
  Paper,
  TextField,
  Chip,
  Stack,
  CircularProgress,
  Alert
} from '@mui/material';
import IconButton from 'components/@extended/IconButton';
import { useTheme } from '@mui/material/styles';
import { Eye, Edit, Trash, Warning2, TickSquare, Clock, Add, TaskSquare } from '@wandersonalwes/iconsax-react';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { IncidentService } from 'services/incidents/incidents.service';
import api from 'services/axios.config';

interface Incident {
  id: string;
  nom: string;
  date: string;
  lieu: string;
  gravite: Gravite;
  description?: string;
  statut: StatutIncident;
}

// Enums pour les valeurs possibles
enum Gravite {
  MINEUR = 'MINEUR',
  SERIEUX = 'SERIEUX',
  MODERE = 'MODERE',
  CRITIQUE = 'CRITIQUE',
}

enum StatutIncident {
  EN_COURS_EVALUATION = "EN_COURS_EVALUATION",
  CONFIRME = "CONFIRME",
  EN_COURS_TRAITEMENT = "EN_COURS_TRAITEMENT",
  ARCHIVE = "ARCHIVE",
  DECLARE = 'DECLARE',
  EN_COURS = 'EN_COURS',
  RESOLU = 'RESOLU',
  CLOTURE = 'CLOTURE',
}

// Types from API
interface LieuAPI {
  id: string;
  name: string;
}

interface IncidentAPI {
  id: string;
  type: string;
  description: string;
  localisation: string;
  statut: StatutIncident;
  gravite: Gravite;
  createdAt: string;
  lieu: LieuAPI;
  actions: any[];
  historiques: any[];
}
const incidentService = new IncidentService()

// ==============================|| INCIDENT LIST ||============================== //

export default function IncidentPage() {
  const theme = useTheme();
  const router = useRouter();

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredIncidents, setFilteredIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch real incidents from API and normalize shape
  useEffect(() => {
    let mounted = true;
    const fetchIncidents = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await incidentService.getAllIncidents();
        const data:IncidentAPI[] = res as IncidentAPI[]
        // map server format to local Incident interface
        const mapped: Incident[] = Array.isArray(data)
          ? data.map((it) => ({
              id: it.id, // conserver l'UUID de l'API
              nom: it.type || '-',
              date: it.createdAt,
              lieu: it.lieu?.name || it.localisation || '-',
              gravite: it.gravite,
              description: it.description,
              statut: it.statut
            }))
          : [];

        if (mounted) {
          setIncidents(mapped);
          setFilteredIncidents(mapped);
        }
      } catch (err: any) {
        console.error('Erreur récupération incidents :', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Erreur récupération incidents');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchIncidents();
    return () => {
      mounted = false;
    };
  }, []);

  // Handle search input change
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = incidents.filter((incident) =>
      incident.nom.toLowerCase().includes(term) ||
      incident.lieu.toLowerCase().includes(term) ||
      (incident.statut || '').toLowerCase().includes(term)
    );
    setFilteredIncidents(filtered);
  };

  // Get color for severity chip
  const getGravityColor = (gravite: Gravite) => {
    switch (gravite) {
      case Gravite.CRITIQUE:
        return 'error';
      case Gravite.SERIEUX:
        return 'warning';
      case Gravite.MODERE:
        return 'info';
      case Gravite.MINEUR:
      default:
        return 'success';
    }
  };

  // Get background and icon color for gravité (couleurs claires pour le background)
  const getGravityStyles = (gravite: Gravite) => {
    switch (gravite) {
      case Gravite.CRITIQUE:
        return { bg: '#ffe6e6', icon: '#b91c1c' }; // darker light red bg, dark red icon
      case Gravite.SERIEUX:
        return { bg: '#fff3db', icon: '#c2410c' }; // darker light orange bg, dark orange icon
      case Gravite.MODERE:
        return { bg: '#e6f2ff', icon: '#0ea5e9' }; // darker light blue bg, blue icon
      case Gravite.MINEUR:
      default:
        return { bg: '#e6ffed', icon: '#16a34a' }; // darker light green bg, green icon
    }
  };

  // Human-friendly label for gravite
  const graviteLabel = (g: Gravite) => {
    switch (g) {
      case Gravite.MINEUR:
        return 'Mineur';
      case Gravite.MODERE:
        return 'Modéré';
      case Gravite.SERIEUX:
        return 'Sérieux';
      case Gravite.CRITIQUE:
        return 'Critique';
      default:
        return String(g);
    }
  };

  // Handlers for actions
  const handleView = (incidentId: string) => {
    router.push(`/incident/${incidentId}`);
  };

  const handleEdit = (incidentId: string) => {
    router.push(`/incident/edit/${incidentId}`);
  };

  const handleActions = (incidentId: string) => {
    router.push(`/incident/actions/${incidentId}`);
  };

  const handleDelete = (incidentId: string) => {
    // show confirmation then call delete endpoint and update UI
    (async () => {
      const incident = incidents.find((i) => i.id === incidentId);
      if (!incident) {
        await Swal.fire('Erreur', 'Incident non trouvé', 'error');
        return;
      }
      const apiId = incident.id;
      const result = await Swal.fire({
        title: 'Confirmer la suppression',
        text: 'Voulez-vous vraiment supprimer cet incident ?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Oui, supprimer',
        cancelButtonText: 'Annuler'
      });

      if (result.isConfirmed) {
        try {
          const res = await api.delete(`/incident/${apiId}`);
          if (res.status > 204) throw new Error(`Erreur ${res.status} ${res.statusText}`);
          // remove from local state
          setIncidents((prev) => prev.filter((i) => i.id !== incidentId));
          setFilteredIncidents((prev) => prev.filter((i) => i.id !== incidentId));
          await Swal.fire('Supprimé', 'L\'incident a été supprimé avec succès.', 'success');
        } catch (err: any) {
          console.error('Erreur suppression :', err);
          await Swal.fire('Erreur', err instanceof Error ? err.message : 'Erreur lors de la suppression', 'error');
        }
      }
    })();
  };

  // Status icon mapping
  const getStatusIcon = (statut: string, color: string) => {
    switch (statut) {
      case StatutIncident.RESOLU:
      case StatutIncident.CLOTURE:
        return <TickSquare size={14} color={color} />;
      case StatutIncident.EN_COURS:
      case StatutIncident.EN_COURS_EVALUATION:
      case StatutIncident.EN_COURS_TRAITEMENT:
      case StatutIncident.CONFIRME:
        return <Clock size={14} color={color} />;
      case StatutIncident.DECLARE:
        return <Add size={14} color={color} />;
      default:
        return null;
    }
  };

  return (
    <Paper sx={{ width: '100%', p: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">Liste des incidents</Typography>
        <Button 
          variant="contained" 
          onClick={() => router.push('/incident/create')}
          startIcon={<Warning2 />}
        >
          Déclarer un incident
        </Button>
      </Box>

      <Box mb={3}>
        <TextField
          label="Rechercher des incidents"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
          fullWidth
          sx={{ maxWidth: 500 }}
        />
      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Box mb={2}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}

      {!loading && incidents.length === 0 && (
        <Box display="flex" justifyContent="center" my={4}>
          <Typography color="text.secondary">Aucun incident trouvé</Typography>
        </Box>
      )}

      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)'
        }}}>
        {filteredIncidents.map((incident) => {
          const styles = getGravityStyles(incident.gravite);
          const chipColor = getGravityColor(incident.gravite as Gravite) as 'error' | 'warning' | 'info' | 'success';
          const leftBorderColor = theme.palette[chipColor].main;
          return (
            <Box key={incident.id}>
              <Card sx={{ /* backgroundColor: styles.bg */ backgroundColor: 'transparent', borderLeft: `4px solid ${leftBorderColor}` }}>
                <CardContent>
                  <Box mb={2}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        {incident.nom}
                      </Typography>
                      <Chip 
                        label={graviteLabel(incident.gravite as Gravite)}
                        color={getGravityColor(incident.gravite as Gravite) as any}
                        size="small"
                      />
                    </Stack>
                  </Box>

                  <Stack spacing={1}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Date :</strong> {format(new Date(incident.date), 'Pp', { locale: fr })}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Lieu :</strong> {incident.lieu}
                    </Typography>
                    <Box
                      component="span"
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.5,
                        px: 1.2,
                        py: 0.45,
                        borderRadius: '12px',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                    bgcolor: 
                      incident.statut === StatutIncident.RESOLU || incident.statut === StatutIncident.CLOTURE 
                        ? 'rgba(16,185,129,0.12)' :
                      [StatutIncident.EN_COURS, StatutIncident.EN_COURS_EVALUATION, StatutIncident.EN_COURS_TRAITEMENT, StatutIncident.CONFIRME].includes(incident.statut as StatutIncident)
                        ? 'rgba(217,119,6,0.12)' :
                      incident.statut === StatutIncident.DECLARE
                        ? 'rgba(6,182,212,0.12)'
                        : 'rgba(0,0,0,0.06)',
                    color:
                      incident.statut === StatutIncident.RESOLU || incident.statut === StatutIncident.CLOTURE
                        ? '#059669' :
                      [StatutIncident.EN_COURS, StatutIncident.EN_COURS_EVALUATION, StatutIncident.EN_COURS_TRAITEMENT, StatutIncident.CONFIRME].includes(incident.statut as StatutIncident)
                        ? '#c2410c' :
                      incident.statut === StatutIncident.DECLARE
                        ? '#06b6d4'
                        : 'inherit',
                        cursor: 'default',
                        pointerEvents: 'none'
                      }}
                    >
                      {getStatusIcon(
                        incident.statut,
                        incident.statut === StatutIncident.RESOLU || incident.statut === StatutIncident.CLOTURE
                          ? '#059669'
                          : [StatutIncident.EN_COURS, StatutIncident.EN_COURS_EVALUATION, StatutIncident.EN_COURS_TRAITEMENT, StatutIncident.CONFIRME].includes(incident.statut as StatutIncident)
                            ? '#c2410c'
                            : incident.statut === StatutIncident.DECLARE
                              ? '#06b6d4'
                              : 'inherit'
                      )}
                      <span>{incident.statut}</span>
                    </Box>
                  </Stack>
                </CardContent>

                <CardActions>
                  <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ width: '100%' }}>
                    <Tooltip title="Actions">
                      <IconButton size="small" onClick={() => handleActions(incident.id)} sx={{ color: styles.icon, '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }}>
                        <TaskSquare size={18} color={styles.icon} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Modifier">
                      <IconButton size="small" onClick={() => handleEdit(incident.id)} sx={{ color: styles.icon, '&:hover': { bgcolor: 'rgba(25, 23, 23, 0.04)' } }}>
                        <Edit size={18} color={styles.icon} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton size="small" onClick={() => handleDelete(incident.id)} sx={{ color: styles.icon, '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }}>
                        <Trash size={18} color={styles.icon} />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </CardActions>
              </Card>
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
}
