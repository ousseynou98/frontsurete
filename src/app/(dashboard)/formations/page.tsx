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
import MainCard from 'components/MainCard';
import formationService, { Formation } from 'services/formation/formationService';
import { Add, Eye, Edit2, Trash } from '@wandersonalwes/iconsax-react';
import Cookies from 'js-cookie';

type CurrentUser = {
  role: string;
  [key: string]: any;
};

export default function FormationsPage() {
  const router = useRouter();
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formationToDelete, setFormationToDelete] = useState<string | null>(null);

  useEffect(() => {
    // Récupérer l'utilisateur connecté
    const userCookie = Cookies.get('user') ?? Cookies.get('anam-auth.csrf-user');
    if (userCookie) {
      try {
        const parsed = JSON.parse(userCookie);
        const roleValue = parsed?.role?.name || parsed?.role || '';
        const normalizedRole = typeof roleValue === 'string' ? roleValue.toLowerCase() : '';
        setCurrentUser({ ...parsed, role: normalizedRole });
      } catch (error) {
        console.error('Erreur parsing cookie user:', error);
      }
    }
    
    loadFormations();
  }, []);

  // Vérifier si l'utilisateur peut supprimer
  const canDelete = ['admin', 'super_admin'].includes(currentUser?.role ?? '');

  const loadFormations = async () => {
    try {
      const data = await formationService.getAll();
      setFormations(data);
    } catch (error) {
      console.error('Erreur lors du chargement des formations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    if (!canDelete) {
      alert('Vous n\'avez pas les permissions pour supprimer cette formation.');
      return;
    }
    setFormationToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!formationToDelete) return;
    
    try {
      await formationService.delete(formationToDelete);
      alert('Formation supprimée avec succès !');
      setDeleteDialogOpen(false);
      setFormationToDelete(null);
      loadFormations();
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      alert(`Erreur: ${error.response?.data?.message || error.message || 'Impossible de supprimer la formation'}`);
      setDeleteDialogOpen(false);
      setFormationToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setFormationToDelete(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Formation terminée':
        return 'success';
      case 'Examen en cours':
        return 'warning';
      case 'Rejetée':
        return 'error';
      case 'Validée - En attente d\'examen':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <MainCard title="Gestion des Formations ISPS">
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5">Liste des Formations</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => router.push('/formations/new')}
        >
          Nouvelle Formation
        </Button>
      </Stack>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Lieu</TableCell>
              <TableCell>Période</TableCell>
              <TableCell>Participants</TableCell>
              <TableCell>RSO</TableCell>
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
            ) : formations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Aucune formation trouvée
                </TableCell>
              </TableRow>
            ) : (
              formations.map((formation) => (
                <TableRow key={formation.id} hover>
                  <TableCell>
                    <Chip 
                      label={formation.type} 
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{formation.lieu}</TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(formation.dateDebut).toLocaleDateString('fr-FR')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      au {new Date(formation.dateFin).toLocaleDateString('fr-FR')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={`${formation.participants?.length || 0} / ${formation.nombreParticipants}`} 
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {formation.rsoFormateur
                      ? `${formation.rsoFormateur.firstname} ${formation.rsoFormateur.lastname}`
                      : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={formation.status}
                      color={getStatusColor(formation.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={0.5} justifyContent="center">
                      <Tooltip title="Voir">
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => router.push(`/formations/${formation.id}`)}
                        >
                          <Eye />
                        </IconButton>
                      </Tooltip>
                      
                      {formation.status !== 'Formation terminée' && formation.status !== 'Rejetée' && (
                        <Tooltip title="Modifier">
                          <IconButton
                            color="secondary"
                            size="small"
                            onClick={() => router.push(`/formations/${formation.id}/edit`)}
                          >
                            <Edit2 />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      {canDelete && (
                        <Tooltip title="Supprimer">
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => handleDeleteClick(formation.id)}
                          >
                            <Trash />
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
            Êtes-vous sûr de vouloir supprimer cette formation ? Cette action est irréversible.
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

