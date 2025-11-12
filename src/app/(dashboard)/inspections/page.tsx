'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';

// project imports
import MainCard from 'components/MainCard';
import inspectionService, { Inspection } from 'services/inspection/inspectionService';

// assets
import { Add, Eye, Edit2, Trash } from '@wandersonalwes/iconsax-react';

// ==============================|| INSPECTIONS LIST ||============================== //

export default function InspectionsPage() {
  const router = useRouter();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [inspectionToDelete, setInspectionToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadInspections();
  }, []);

  const loadInspections = async () => {
    try {
      const data = await inspectionService.getAll();
      setInspections(data);
    } catch (error) {
      console.error('Erreur lors du chargement des inspections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setInspectionToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!inspectionToDelete) return;

    try {
      await inspectionService.delete(inspectionToDelete);
      alert('Inspection supprimée avec succès !');
      setDeleteDialogOpen(false);
      setInspectionToDelete(null);
      loadInspections();
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      alert(`Erreur: ${error.response?.data?.message || error.message || 'Impossible de supprimer l\'inspection'}`);
      setDeleteDialogOpen(false);
      setInspectionToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setInspectionToDelete(null);
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
    <MainCard title="Gestion des Inspections">
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5">Liste des Inspections</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => router.push('/inspections/new')}
        >
          Nouvelle Inspection
        </Button>
      </Stack>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Comité</TableCell>
              <TableCell>RSO / IP</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Chargement...
                </TableCell>
              </TableRow>
            ) : inspections.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Aucune inspection trouvée
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
                    <Typography variant="body2" fontWeight="medium">
                      {inspection.comite?.name || 'N/A'}
                    </Typography>
                    <Chip 
                      label={inspection.comite?.status || 'N/A'} 
                      size="small"
                      color={inspection.comite?.status === 'EN COURS' ? 'success' : 'default'}
                      sx={{ mt: 0.5 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      RSO: {inspection.comite?.rso?.name || 'N/A'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      IP: {inspection.comite?.ip?.name || 'N/A'}
                    </Typography>
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
                      <Tooltip title="Voir">
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
                      
                      <Tooltip title="Supprimer">
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleDeleteClick(inspection.id)}
                        >
                          <Trash />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog de confirmation de suppression */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Confirmer la suppression
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Êtes-vous sûr de vouloir supprimer cette inspection ? Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Annuler
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" autoFocus>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
}

