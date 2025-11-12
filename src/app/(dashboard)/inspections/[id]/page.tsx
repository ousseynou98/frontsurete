'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

// material-ui
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { ArrowDown2, ArrowLeft, Edit2, TickCircle } from '@wandersonalwes/iconsax-react';

// project imports
import MainCard from 'components/MainCard';
import inspectionService, { Inspection } from 'services/inspection/inspectionService';

// ==============================|| INSPECTION DETAIL ||============================== //

export default function InspectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [loading, setLoading] = useState(true);
  const [terminerDialogOpen, setTerminerDialogOpen] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadInspection(params.id as string);
    }
  }, [params.id]);

  const loadInspection = async (id: string) => {
    try {
      const data = await inspectionService.getOne(id);
      setInspection(data);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTerminerClick = () => {
    setTerminerDialogOpen(true);
  };

  const handleTerminerConfirm = async () => {
    if (!inspection) return;

    try {
      await inspectionService.update(inspection.id, { status: 'TERMINEE' });
      alert('Inspection terminée avec succès !');
      setTerminerDialogOpen(false);
      loadInspection(inspection.id);
    } catch (error: any) {
      console.error('Erreur lors de la clôture:', error);
      alert(`Erreur: ${error.response?.data?.message || error.message || 'Impossible de terminer l\'inspection'}`);
      setTerminerDialogOpen(false);
    }
  };

  const handleTerminerCancel = () => {
    setTerminerDialogOpen(false);
  };

  if (loading) {
    return (
      <MainCard title="Détail de l'Inspection">
        <Typography>Chargement...</Typography>
      </MainCard>
    );
  }

  if (!inspection) {
    return (
      <MainCard title="Détail de l'Inspection">
        <Typography>Inspection non trouvée</Typography>
      </MainCard>
    );
  }

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

  const getResponseColor = (response: string) => {
    switch (response?.toUpperCase()) {
      case 'OUI':
        return 'success';
      case 'NON':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <MainCard
      title="Détail de l'Inspection"
      secondary={
        <Stack direction="row" spacing={1}>
          {/* Bouton Modifier : uniquement pour PLANIFIE ou EN_COURS */}
          {(inspection.status === 'PLANIFIE' || inspection.status === 'EN_COURS') && (
            <Button
              variant="outlined"
              startIcon={<Edit2 />}
              onClick={() => router.push(`/inspections/${inspection.id}/edit`)}
            >
              Modifier
            </Button>
          )}
          
          {/* Bouton Terminer : uniquement pour PLANIFIE ou EN_COURS */}
          {(inspection.status === 'PLANIFIE' || inspection.status === 'EN_COURS') && (
            <Button
              variant="contained"
              color="success"
              startIcon={<TickCircle />}
              onClick={handleTerminerClick}
            >
              Terminer
            </Button>
          )}
          
          <Button
            startIcon={<ArrowLeft />}
            onClick={() => router.push('/inspections')}
          >
            Retour
          </Button>
        </Stack>
      }
    >
      <Grid container spacing={3}>
        {/* Informations générales */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Informations Générales</Typography>
                <Chip
                  label={inspection.status}
                  color={getStatusColor(inspection.status)}
                />
              </Stack>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Type d'inspection
                  </Typography>
                  <Chip 
                    label={inspection.type} 
                    color={inspection.type === 'NAVIRE' ? 'primary' : inspection.type === 'SITE' ? 'secondary' : 'default'}
                    size="small"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Navire
                  </Typography>
                  <Typography variant="body1">{inspection.navire || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    IMO N°
                  </Typography>
                  <Typography variant="body1">{inspection.imo_number || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Date de l'inspection
                  </Typography>
                  <Typography variant="body1">
                    {new Date(inspection.date_insp).toLocaleDateString('fr-FR')}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Inspecteur(s)
                  </Typography>
                  <Typography variant="body1">{inspection.inspecteur || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    OSN / Capitaine
                  </Typography>
                  <Typography variant="body1">{inspection.osn_capitaine || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Comité de Sûreté
                  </Typography>
                  <Card variant="outlined" sx={{ p: 2, bgcolor: 'primary.lighter' }}>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Nom du Comité
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                          {inspection.comite?.name || 'N/A'}
                        </Typography>
                      </Box>
                      
                      <Divider />
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                          <Typography variant="body2" color="text.secondary">
                            Responsable Sécurité Opérationnelle (RSO)
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {inspection.comite?.rso?.name || 'N/A'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Typography variant="body2" color="text.secondary">
                            Inspecteur Principal (IP)
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {inspection.comite?.ip?.name || 'N/A'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Typography variant="body2" color="text.secondary">
                            Statut du Comité
                          </Typography>
                          <Chip 
                            label={inspection.comite?.status || 'N/A'} 
                            size="medium"
                            color={inspection.comite?.status === 'EN COURS' ? 'success' : 'default'}
                            sx={{ mt: 0.5 }}
                          />
                        </Grid>
                      </Grid>
                      
                      {(inspection.comite?.startDate || inspection.comite?.endDate) && (
                        <>
                          <Divider />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Période du Comité
                            </Typography>
                            <Typography variant="body1">
                              {inspection.comite?.startDate ? new Date(inspection.comite.startDate).toLocaleDateString('fr-FR') : 'N/A'}
                              {' → '}
                              {inspection.comite?.endDate ? new Date(inspection.comite.endDate).toLocaleDateString('fr-FR') : 'En cours'}
                            </Typography>
                          </Box>
                        </>
                      )}
                    </Stack>
                  </Card>
                </Grid>
                {inspection.desc && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Description
                    </Typography>
                    <Typography variant="body1">{inspection.desc}</Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Résultats du Checklist */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Résultats du Check-list
              </Typography>

              {inspection.data && typeof inspection.data === 'object' ? (
                Object.entries(inspection.data).map(([sectionTitle, sectionData]: [string, any]) => (
                  <Accordion key={sectionTitle} defaultExpanded>
                    <AccordionSummary expandIcon={<ArrowDown2 />}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {sectionTitle}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <TableContainer>
                        <Table size="small">
                          <TableBody>
                            {Object.entries(sectionData).map(([question, answer]: [string, any]) => (
                              <TableRow key={question}>
                                <TableCell width="60%">
                                  <Typography variant="body2">{question}</Typography>
                                </TableCell>
                                <TableCell width="15%">
                                  <Chip
                                    label={answer?.reponse || 'N/A'}
                                    color={getResponseColor(answer?.reponse)}
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell width="25%">
                                  <Typography variant="body2" color="text.secondary">
                                    {answer?.commentaire || '-'}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </AccordionDetails>
                  </Accordion>
                ))
              ) : (
                <Typography color="text.secondary">
                  Aucune donnée de checklist disponible
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog de confirmation pour terminer l'inspection */}
      <Dialog
        open={terminerDialogOpen}
        onClose={handleTerminerCancel}
        aria-labelledby="terminer-dialog-title"
        aria-describedby="terminer-dialog-description"
      >
        <DialogTitle id="terminer-dialog-title">
          Terminer l'inspection
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="terminer-dialog-description">
            Êtes-vous sûr de vouloir marquer cette inspection comme terminée ? 
            Le statut passera à "TERMINEE" et ne pourra plus être modifié.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleTerminerCancel} color="primary">
            Annuler
          </Button>
          <Button onClick={handleTerminerConfirm} color="success" variant="contained" autoFocus>
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
}

