import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// material-ui
import {
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Tooltip,
  Box,
  Button
} from '@mui/material';

// project imports
import inspectionService, { Inspection } from 'services/inspection/inspectionService';
import { Comite } from 'types/comite';

// assets
import { Eye, Edit2, Add } from '@wandersonalwes/iconsax-react';

// ==============================|| COMITE INSPECTION TAB ||============================== //

interface InspectionComiteProps {
  comite?: Comite;
}

export default function InspectionComite({ comite }: InspectionComiteProps) {
  const router = useRouter();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (comite?.id) {
      loadInspections();
    }
  }, [comite?.id]);

  const loadInspections = async () => {
    try {
      const data = await inspectionService.getAll();
      // Filtrer les inspections pour ce comité uniquement
      const comiteInspections = data.filter((insp) => insp.comite?.id === comite?.id);
      setInspections(comiteInspections);
    } catch (error) {
      console.error('Erreur lors du chargement des inspections:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'TERMINEE':
        return 'success';
      case 'EN_COURS':
        return 'warning';
      case 'BROUILLON':
        return 'default';
      case 'PLANIFIE':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h6">Inspections liées à ce comité</Typography>
      </Stack>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Chargement...
                </TableCell>
              </TableRow>
            ) : inspections.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Box sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Aucune inspection trouvée pour ce comité
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() => router.push('/inspections/new')}
                    >
                      Créer une inspection
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              inspections.map((inspection) => (
                <TableRow key={inspection.id} hover>
                  <TableCell>
                    <Chip 
                      label={inspection.type} 
                      color={inspection.type === 'NAVIRE' ? 'primary' : inspection.type === 'SITE' ? 'secondary' : 'default'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {inspection.desc || 'N/A'}
                    </Typography>
                    {inspection.navire && (
                      <Typography variant="caption" color="text.secondary">
                        Navire: {inspection.navire}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(inspection.date_insp).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={inspection.status}
                      color={getStatusColor(inspection.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={0.5} justifyContent="center">
                      <Tooltip title="Voir les détails">
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => router.push(`/inspections/${inspection.id}`)}
                        >
                          <Eye />
                        </IconButton>
                      </Tooltip>
                      
                      {/* Bouton Modifier : seulement pour PLANIFIE ou EN_COURS */}
                      {(inspection.status === 'PLANIFIE' || inspection.status === 'EN_COURS') && (
                        <Tooltip title="Modifier/Compléter">
                          <IconButton
                            color="secondary"
                            size="small"
                            onClick={() => router.push(`/inspections/${inspection.id}/edit`)}
                          >
                            <Edit2 />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

