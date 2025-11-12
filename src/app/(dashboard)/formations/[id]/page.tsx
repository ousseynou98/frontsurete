'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { ArrowLeft } from '@wandersonalwes/iconsax-react';
import MainCard from 'components/MainCard';
import formationService, { Formation } from 'services/formation/formationService';
import Cookies from 'js-cookie';
import axios from 'services/axios.config';

type CurrentUser = {
  role: string;
  [key: string]: any;
};

export default function FormationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [formation, setFormation] = useState<Formation | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  // Dialogs
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [showRapportDialog, setShowRapportDialog] = useState(false);
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  
  // Données validation
  const [urlSujetExamen, setUrlSujetExamen] = useState('');
  const [uploadingSujet, setUploadingSujet] = useState(false);
  const [sujetFileName, setSujetFileName] = useState('');

  // Données rapport supervision
  const [rapportData, setRapportData] = useState({
    observationsGenerales: '',
    conformiteContenu: '',
    conformiteFormateur: '',
    conformiteLieu: '',
    recommandations: '',
    apteExamen: true
  });

  // Données notes participants
  const [notesParticipants, setNotesParticipants] = useState<Array<{
    participantId: string;
    note: number;
    statut: string;
    appreciation: string;
  }>>([]);

  // Upload copies examen
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadingCopies, setUploadingCopies] = useState(false);

  // Charger l'utilisateur connecté
  useEffect(() => {
    const userCookie = Cookies.get('user') ?? Cookies.get('anam-auth.csrf-user');
    if (userCookie) {
      try {
        const parsed = JSON.parse(userCookie);
        const roleValue = parsed?.role?.name || parsed?.role || '';
        let normalizedRole = typeof roleValue === 'string' ? roleValue.toLowerCase().trim() : '';
        
        // Normaliser les anciens rôles vers les nouveaux
        if (normalizedRole === 'rso_formateur') {
          normalizedRole = 'rso';
        }
        // S'assurer que chef_surete est bien normalisé
        if (normalizedRole === 'chef_surete' || normalizedRole === 'chef surete') {
          normalizedRole = 'chef_surete';
        }
        // S'assurer que dsm est bien normalisé
        if (normalizedRole === 'dsm') {
          normalizedRole = 'dsm';
        }
        
        setCurrentUser({ ...parsed, role: normalizedRole });
      } catch (error) {
        console.error('Erreur parsing cookie user:', error);
      }
    }
  }, []);

  // Charger la formation une fois que l'utilisateur est chargé
  useEffect(() => {
    if (params.id) {
      loadFormation(params.id as string);
    }
  }, [params.id, currentUser]);

  // Vérifier les rôles courants
  const isChefSurete = currentUser?.role === 'chef_surete';
  const isDSM = currentUser?.role === 'dsm';
  const isResponsableSurete = isChefSurete || isDSM;
  const isDG = currentUser?.role === 'dg';
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin';
  const canGererFormation = isResponsableSurete || isAdmin;

  const loadFormation = async (id: string) => {
    try {
      const data = await formationService.getOne(id);
      setFormation(data);
      
      // Initialiser les notes si les participants existent
      if (data.participants && data.participants.length > 0) {
        const initialNotes = data.participants.map(p => ({
          participantId: p.id,
          note: p.note || 0,
          statut: p.statut || 'EN_ATTENTE',
          appreciation: p.appreciation || ''
        }));
        setNotesParticipants(initialNotes);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSujetExamen = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      alert('Seuls les fichiers PDF et DOCX sont acceptés');
      return;
    }

    try {
      setUploadingSujet(true);
      
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch('http://localhost:8080/docs/upload-single', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Cookies.get('anam-auth.csrf-token')}`
        },
        body: formData
      });

      if (!uploadResponse.ok) {
        throw new Error('Erreur lors de l\'upload');
      }

      const result = await uploadResponse.json();
      setUrlSujetExamen(result.url);
      setSujetFileName(file.name);
      alert('Sujet d\'examen téléversé avec succès !');
    } catch (error: any) {
      alert(`Erreur: ${error.message}`);
    } finally {
      setUploadingSujet(false);
    }
  };

  const handleValider = async (valide: boolean, motifRejet?: string) => {
    try {
      await formationService.valider(formation!.id, {
        valide,
        urlSujetExamen: valide && urlSujetExamen ? urlSujetExamen : undefined,
        motifRejet: valide ? undefined : motifRejet
      });
      
      alert(valide ? 'Formation validée avec succès !' : 'Formation rejetée');
      loadFormation(formation!.id);
      setShowValidationDialog(false);
      setUrlSujetExamen('');
      setSujetFileName('');
    } catch (error: any) {
      alert(`Erreur: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDemarrerExamen = async () => {
    try {
      await formationService.demarrerExamen(formation!.id);
      loadFormation(formation!.id);
    } catch (error: any) {
      alert(`Erreur: ${error.message}`);
    }
  };

  const handleTerminerExamen = async () => {
    try {
      await formationService.terminerExamen(formation!.id);
      alert('Examen terminé avec succès !');
      loadFormation(formation!.id);
    } catch (error: any) {
      alert(`Erreur: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleSoumettreRapport = async () => {
    try {
      if (!rapportData.observationsGenerales) {
        alert('Les observations générales sont obligatoires');
        return;
      }

      await formationService.soumettreRapport(formation!.id, rapportData);
      alert('Rapport de supervision soumis avec succès !');
      setShowRapportDialog(false);
      loadFormation(formation!.id);
      // Réinitialiser le formulaire
      setRapportData({
        observationsGenerales: '',
        conformiteContenu: '',
        conformiteFormateur: '',
        conformiteLieu: '',
        recommandations: '',
        apteExamen: true
      });
    } catch (error: any) {
      alert(`Erreur: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleSaisirNotes = async () => {
    try {
      // Vérifier que toutes les notes sont saisies
      const notesInvalides = notesParticipants.filter(n => !n.note || n.note === 0);
      if (notesInvalides.length > 0) {
        alert('Veuillez saisir toutes les notes');
        return;
      }

      await formationService.saisirNotes(formation!.id, { notes: notesParticipants });
      alert('Notes saisies avec succès !');
      setShowNotesDialog(false);
      loadFormation(formation!.id);
    } catch (error: any) {
      alert(`Erreur: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleTeleverserCopies = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      alert('Seuls les fichiers PDF et DOCX sont acceptés');
      return;
    }

    try {
      setUploadingCopies(true);
      
      // Créer FormData pour l'upload
      const formData = new FormData();
      formData.append('file', file); // Fichier unique

      // Upload vers le backend
      const uploadResponse = await fetch('http://localhost:8080/docs/upload-single', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Cookies.get('anam-auth.csrf-token')}`
        },
        body: formData
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.message || 'Erreur lors de l\'upload');
      }

      const result = await uploadResponse.json();
      const url = result.url; // URL du fichier uploadé

      // Enregistrer l'URL dans la formation
      await formationService.telechargerCopies(formation!.id, url);
      alert('Copies téléversées avec succès !');
      setShowUploadDialog(false);
      loadFormation(formation!.id);
    } catch (error: any) {
      alert(`Erreur: ${error.message}`);
    } finally {
      setUploadingCopies(false);
    }
  };

  const updateNote = (participantId: string, field: string, value: any) => {
    setNotesParticipants(prevNotes => 
      prevNotes.map(n => 
        n.participantId === participantId 
          ? { ...n, [field]: value }
          : n
      )
    );
  };

  const handleValiderDiplomes = async () => {
    try {
      await formationService.validerDiplomes(formation!.id, currentUser?.id || 'DG_USER_ID');
      loadFormation(formation!.id);
      alert('Diplômes générés avec succès !');
    } catch (error: any) {
      alert(`Erreur: ${error.response?.data?.message || error.message}`);
    }
  };

  // Fonction pour télécharger un fichier avec authentification
  const handleDownloadFile = async (url: string, filename: string = 'document.pdf') => {
    try {
      // Extraire l'ID du document depuis l'URL
      const docId = url.split('/').pop();
      
      // Faire la requête avec axios (qui inclut automatiquement le token JWT)
      const response = await axios.get(`http://localhost:8080/docs/download/${docId}`, {
        responseType: 'blob', // Important pour télécharger des fichiers
      });

      // Créer un blob et télécharger le fichier
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error: any) {
      console.error('Erreur lors du téléchargement:', error);
      alert(`Erreur: ${error.response?.data?.message || error.message || 'Impossible de télécharger le fichier'}`);
    }
  };

  // Fonction pour afficher/télécharger le diplôme d'un participant
  const handleDownloadDiplome = async (participantId: string, nom: string, prenom: string) => {
    try {
      // Ouvrir le diplôme dans un nouvel onglet (HTML qui peut être imprimé en PDF)
      const url = `http://localhost:8080/formations/participants/${participantId}/diplome`;
      window.open(url, '_blank');
    } catch (error: any) {
      console.error('Erreur lors de l\'ouverture du diplôme:', error);
      alert(`Erreur: ${error.message || 'Impossible d\'ouvrir le diplôme'}`);
    }
  };

  if (loading) {
    return (
      <MainCard title="Détail de la Formation">
        <Typography>Chargement...</Typography>
      </MainCard>
    );
  }

  if (!formation) {
    return (
      <MainCard title="Détail de la Formation">
        <Typography>Formation non trouvée</Typography>
      </MainCard>
    );
  }

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

  const getStatutParticipantColor = (statut: string) => {
    switch (statut) {
      case 'Certifié ISPS':
        return 'success';
      case 'Réussi':
        return 'success';
      case 'Échoué':
        return 'error';
      case 'Non habilité':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <MainCard
      title="Détail de la Formation ISPS"
      secondary={
        <Button
          startIcon={<ArrowLeft />}
          onClick={() => router.push('/formations')}
        >
          Retour
        </Button>
      }
    >
      <Grid container spacing={3}>
        {/* Informations générales */}
        <Grid size={12}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Informations Générales</Typography>
                <Chip
                  label={formation.status}
                  color={getStatusColor(formation.status)}
                />
              </Stack>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Type de formation
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {formation.type}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Nombre de participants
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {formation.nombreParticipants}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Lieu
                  </Typography>
                  <Typography variant="body1">{formation.lieu}</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Centre de formation
                  </Typography>
                  <Typography variant="body1">{formation.centreFormation || 'N/A'}</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Période
                  </Typography>
                  <Typography variant="body1">
                    {new Date(formation.dateDebut).toLocaleDateString('fr-FR')}
                    {' au '}
                    {new Date(formation.dateFin).toLocaleDateString('fr-FR')}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    RSO
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {formation.rsoFormateur 
                      ? `${formation.rsoFormateur.firstname} ${formation.rsoFormateur.lastname}` 
                      : 'N/A'}
                  </Typography>
                </Grid>
                {formation.chefSurete && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Responsable sûreté (Chef Sûreté / DSM)
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {`${formation.chefSurete.firstname} ${formation.chefSurete.lastname}`}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Sujet d'examen */}
        {formation.urlSujetExamen && (isResponsableSurete || isAdmin) && (
          <Grid size={12}>
            <Card sx={{ bgcolor: 'info.lighter' }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">
                    Sujet d'examen
                  </Typography>
                  <Button 
                    variant="contained" 
                    size="small"
                    onClick={() => handleDownloadFile(formation.urlSujetExamen!, 'sujet_examen.pdf')}
                  >
                    Télécharger le sujet
                  </Button>
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Le sujet d'examen a été fourni par le Chef de Sûreté. Vous pouvez le consulter et le télécharger.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Rapport de supervision */}
        {formation.rapportSupervision && (
          <Grid size={12}>
            <Card data-section="rapport-supervision">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Rapport de Supervision
                </Typography>
                <Divider sx={{ my: 2 }} />
                
                <Grid container spacing={3}>
                  <Grid size={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Observations Générales
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      {formation.rapportSupervision.observationsGenerales}
                    </Typography>
                  </Grid>

                  {formation.rapportSupervision.conformiteContenu && (
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Conformité du contenu
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 1 }}>
                        {formation.rapportSupervision.conformiteContenu}
                      </Typography>
                    </Grid>
                  )}

                  {formation.rapportSupervision.conformiteFormateur && (
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Conformité du formateur
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 1 }}>
                        {formation.rapportSupervision.conformiteFormateur}
                      </Typography>
                    </Grid>
                  )}

                  {formation.rapportSupervision.conformiteLieu && (
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Conformité du lieu
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 1 }}>
                        {formation.rapportSupervision.conformiteLieu}
                      </Typography>
                    </Grid>
                  )}

                  {formation.rapportSupervision.recommandations && (
                    <Grid size={12}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Recommandations
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 1 }}>
                        {formation.rapportSupervision.recommandations}
                      </Typography>
                    </Grid>
                  )}

                  <Grid size={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Aptitude à l'examen
                    </Typography>
                    <Chip
                      label={formation.rapportSupervision.apteExamen ? 'Aptes' : 'Non aptes'}
                      color={formation.rapportSupervision.apteExamen ? 'success' : 'error'}
                      sx={{ mt: 1 }}
                    />
                  </Grid>

                  <Grid size={12}>
                    <Typography variant="caption" color="text.secondary">
                      Rapport soumis le {new Date(formation.rapportSupervision.dateRapport).toLocaleString('fr-FR')}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Liste des participants */}
        <Grid size={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Participants ({formation.participants?.length || 0})
              </Typography>
              
              {formation.participants && formation.participants.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Nom</TableCell>
                        <TableCell>Prénom</TableCell>
                        <TableCell>Pièce CNI</TableCell>
                        <TableCell>Casier Jud.</TableCell>
                        <TableCell>Note</TableCell>
                        <TableCell>Statut</TableCell>
                        <TableCell>Diplôme</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {formation.participants.map((participant) => (
                        <TableRow key={participant.id}>
                          <TableCell>{participant.nom}</TableCell>
                          <TableCell>{participant.prenom}</TableCell>
                          <TableCell>
                            {participant.urlCNI ? (
                              <Button 
                                size="small" 
                                variant="outlined"
                                onClick={() => window.open(`http://localhost:8080${participant.urlCNI}`, '_blank')}
                              >
                                Voir CNI
                              </Button>
                            ) : (
                              'Non fournie'
                            )}
                          </TableCell>
                          <TableCell>
                            {participant.urlCasierJudiciaire ? (
                              <Button 
                                size="small" 
                                variant="outlined"
                                onClick={() => window.open(`http://localhost:8080${participant.urlCasierJudiciaire}`, '_blank')}
                              >
                                Voir Casier
                              </Button>
                            ) : (
                              'Non fourni'
                            )}
                          </TableCell>
                          <TableCell>{participant.note || 'N/A'}</TableCell>
                          <TableCell>
                            <Chip
                              label={participant.statut}
                              size="small"
                              color={getStatutParticipantColor(participant.statut)}
                            />
                          </TableCell>
                          <TableCell>
                            {participant.numeroDiplome ? (
                              <Button 
                                size="small" 
                                variant="outlined"
                                onClick={() => handleDownloadDiplome(participant.id, participant.nom, participant.prenom)}
                              >
                                Télécharger
                              </Button>
                            ) : (
                              'N/A'
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography color="text.secondary">Aucun participant</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Actions selon le statut */}
        <Grid size={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Actions
              </Typography>
              <Stack spacing={2}>
                {/* Étape 1 : Chef Sûreté / DSM - Valider ou Rejeter */}
                {formation.status === 'En attente de validation ANAM' && isResponsableSurete && (
                  <Stack spacing={1}>
                    <Typography variant="caption" color="text.secondary">
                      Action Chef Sûreté / DSM : Valider la conformité de la demande
                    </Typography>
                    <Stack direction="row" spacing={2}>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => setShowValidationDialog(true)}
                      >
                        Valider la formation
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => {
                          const motif = prompt('Motif du rejet :');
                          if (motif) {
                            handleValider(false, motif);
                          }
                        }}
                      >
                        Rejeter la demande
                      </Button>
                    </Stack>
                  </Stack>
                )}

                {/* Étape 2 : Responsable Sûreté - Démarrer l'examen */}
                {formation.status === 'Validée - En attente d\'examen' && canGererFormation && (
                  <Stack spacing={1}>
                    <Typography variant="caption" color="text.secondary">
                      Action Chef Sûreté / DSM : Démarrer officiellement l'examen
                    </Typography>
                    <Button variant="contained" color="primary" onClick={handleDemarrerExamen}>
                      Démarrer l'examen
                    </Button>
                  </Stack>
                )}

                {/* Étape 3 : Responsable Sûreté - Terminer examen */}
                {formation.status === 'Examen en cours' && canGererFormation && (
                  <Stack spacing={1}>
                    <Typography variant="caption" color="text.secondary">
                      Action Chef Sûreté / DSM : Clôturer l'examen
                    </Typography>
                    <Button variant="contained" color="warning" onClick={handleTerminerExamen}>
                      Terminer l'examen
                    </Button>
                  </Stack>
                )}

                {/* Étape 4 : Responsable Sûreté - Soumettre rapport APRÈS clôture */}
                {formation.status === 'Examen terminé' && !formation.rapportSupervision && canGererFormation && (
                  <Stack spacing={1}>
                    <Typography variant="caption" color="text.secondary">
                      Action Chef Sûreté / DSM : Remplir le rapport de supervision après clôture de l'examen
                    </Typography>
                    <Button variant="contained" color="info" onClick={() => setShowRapportDialog(true)}>
                      Soumettre le rapport de supervision
                    </Button>
                  </Stack>
                )}

                {/* Étape 5 : Responsable Sûreté - Saisir notes (APRÈS rapport supervision) */}
                {formation.status === 'Examen terminé' && formation.rapportSupervision && isResponsableSurete && (
                  <Stack spacing={1}>
                    <Typography variant="caption" color="text.secondary">
                      Action Chef Sûreté / DSM : Saisir les résultats de l'examen
                    </Typography>
                    <Button 
                      variant="contained" 
                      onClick={() => setShowNotesDialog(true)}
                    >
                      Saisir les notes et résultats
                    </Button>
                  </Stack>
                )}

                {/* Message si rapport manquant */}
                {formation.status === 'Examen terminé' && !formation.rapportSupervision && isResponsableSurete && (
                  <Typography variant="body2" color="warning.main">
                    ⏳ En attente du rapport de supervision du Chef Sûreté / DSM
                  </Typography>
                )}

                {/* Étape 6 : DG - Validation finale */}
                {formation.status === 'En attente validation DG' && isDG && (
                  <Stack spacing={3}>
                    <Typography variant="h6" color="primary">
                       Validation finale - Dossiers des candidats réussis
                    </Typography>

                    {/* Liste des candidats réussis avec leurs dossiers complets */}
                    {formation.participants?.filter(p => p.statut === 'Réussi').map((participant) => (
                      <Card key={participant.id} variant="outlined" sx={{ bgcolor: 'success.lighter' }}>
                        <CardContent>
                          <Stack spacing={2}>
                            <Typography variant="h6" color="success.dark">
                               {participant.prenom} {participant.nom}
                            </Typography>
                            
                            <Grid container spacing={2}>
                              {/* Résultat examen */}
                              <Grid size={{ xs: 12, md: 6 }}>
                                <Card variant="outlined">
                                  <CardContent>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                       Résultat de l'examen
                                    </Typography>
                                    <Typography variant="h4" color="success.main">
                                      {participant.note}/20
                                    </Typography>
                                    <Chip 
                                      label={participant.statut} 
                                      color="success" 
                                      size="small" 
                                      sx={{ mt: 1 }}
                                    />
                                    {participant.appreciation && (
                                      <Typography variant="body2" sx={{ mt: 1 }}>
                                        "{participant.appreciation}"
                                      </Typography>
                                    )}
                                  </CardContent>
                                </Card>
                              </Grid>

                              {/* Documents */}
                              <Grid size={{ xs: 12, md: 6 }}>
                                <Card variant="outlined">
                                  <CardContent>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                      Documents du dossier
                                    </Typography>
                                    <Stack spacing={1}>
                                      <Typography variant="body2">
                                        CNI : {participant.urlCNI ? (
                                          <Button 
                                            size="small" 
                                            variant="outlined"
                                            sx={{ ml: 1 }} 
                                            onClick={() => window.open(`http://localhost:8080${participant.urlCNI}`, '_blank')}
                                          >
                                            Voir
                                          </Button>
                                        ) : (
                                          <span style={{ marginLeft: 8, color: '#999' }}>Non fournie</span>
                                        )}
                                      </Typography>
                                      <Typography variant="body2">
                                        Casier judiciaire : {participant.urlCasierJudiciaire ? (
                                          <Button 
                                            size="small" 
                                            variant="outlined"
                                            sx={{ ml: 1 }} 
                                            onClick={() => window.open(`http://localhost:8080${participant.urlCasierJudiciaire}`, '_blank')}
                                          >
                                            Voir
                                          </Button>
                                        ) : (
                                          <span style={{ marginLeft: 8, color: '#999' }}>Non fourni</span>
                                        )}
                                      </Typography>
                                      <Typography variant="body2">
                                        Rapport supervision : {formation.rapportSupervision ? (
                                          <Button 
                                            size="small" 
                                            variant="outlined"
                                            sx={{ ml: 1 }}
                                            onClick={() => {
                                              const rapportSection = document.querySelector('[data-section="rapport-supervision"]');
                                              if (rapportSection) {
                                                rapportSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                              }
                                            }}
                                          >
                                            Voir
                                          </Button>
                                        ) : (
                                          <span style={{ marginLeft: 8, color: '#999' }}>Non disponible</span>
                                        )}
                                      </Typography>
                                    </Stack>
                                  </CardContent>
                                </Card>
                              </Grid>
                            </Grid>
                          </Stack>
                        </CardContent>
                      </Card>
                    ))}

                    {/* Bouton de validation globale */}
                    <Stack direction="row" justifyContent="center" sx={{ mt: 3 }}>
                      <Button 
                        variant="contained" 
                        color="success" 
                        size="large"
                        onClick={handleValiderDiplomes}
                        sx={{ minWidth: 300 }}
                      >
                        🎓 Valider et générer les diplômes certifiés
                      </Button>
                    </Stack>

                    <Typography variant="caption" color="text.secondary" textAlign="center">
                      En validant, vous générerez automatiquement :
                      • Diplômes PDF certifiés avec QR Code intégré • Numéros uniques • Signature DG ANAM
                    </Typography>
                  </Stack>
                )}

                {/* Formation terminée - Diplômes générés */}
                {formation.status === 'Formation terminée' && (
                  <Stack spacing={3}>
                    <Typography variant="h6" color="success.main">
                       Formation terminée - Diplômes générés et archivés
                    </Typography>

                    {/* Liste des diplômes générés */}
                    {formation.participants?.filter(p => p.statut === 'Certifié ISPS').map((participant) => (
                      <Card key={participant.id} variant="outlined" sx={{ bgcolor: 'success.lighter' }}>
                        <CardContent>
                          <Grid container spacing={2} alignItems="center">
                            <Grid size={{ xs: 12, md: 4 }}>
                              <Typography variant="subtitle1" fontWeight="bold">
                                🎓 {participant.prenom} {participant.nom}
                              </Typography>
                              <Chip 
                                label={participant.statut} 
                                color="success" 
                                size="small" 
                                sx={{ mt: 1 }}
                              />
                            </Grid>
                            
                            <Grid size={{ xs: 12, md: 4 }}>
                              <Typography variant="body2" color="text.secondary">
                                Numéro de diplôme
                              </Typography>
                              <Typography variant="body1" fontWeight="medium">
                                {participant.numeroDiplome}
                              </Typography>
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                              {participant.numeroDiplome && (
                                <Button 
                                  variant="contained" 
                                  size="small"
                                  onClick={() => handleDownloadDiplome(participant.id, participant.nom, participant.prenom)}
                                >
                                   Télécharger diplôme
                                </Button>
                              )}
                            </Grid>
                          </Grid>

                          <Divider sx={{ my: 2 }} />
                          
                          <Typography variant="caption" color="text.secondary">
                            Validé le {participant.dateValidationDG ? new Date(participant.dateValidationDG).toLocaleString('fr-FR') : 'N/A'}
                            {' par ' + (formation.dg ? `${formation.dg.firstname} ${formation.dg.lastname}` : 'DG ANAM')}
                          </Typography>
                        </CardContent>
                      </Card>
                    ))}

                    {/* Participants non habilités */}
                    {(formation.participants?.filter(p => p.statut === 'Non habilité' || p.statut === 'Échoué').length || 0) > 0 && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Participants non certifiés
                        </Typography>
                        {formation.participants?.filter(p => p.statut === 'Non habilité' || p.statut === 'Échoué').map((participant) => (
                          <Typography key={participant.id} variant="body2" color="error.main">
                            • {participant.prenom} {participant.nom} - {participant.statut} ({participant.note}/20)
                          </Typography>
                        ))}
                      </Box>
                    )}
                  </Stack>
                )}

                {/* Formation rejetée */}
                {formation.status === 'Rejetée' && formation.motifRejet && (
                  <Stack spacing={1}>
                    <Typography variant="body1" color="error.main" fontWeight="medium">
                      Formation rejetée
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Motif : {formation.motifRejet}
                    </Typography>
                  </Stack>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog de validation */}
      <Dialog open={showValidationDialog} onClose={() => setShowValidationDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Valider la formation</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Vous êtes sur le point de valider cette formation. Vous pouvez téléverser le sujet d&apos;examen (facultatif) avant de lancer l&apos;évaluation.
            </Typography>

            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Sujet d'examen (optionnel)
              </Typography>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                disabled={uploadingSujet}
              >
                {uploadingSujet ? 'Téléversement...' : (sujetFileName || 'Téléverser le sujet d\'examen (PDF ou DOCX)')}
                <input
                  type="file"
                  hidden
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleUploadSujetExamen}
                />
              </Button>
              {sujetFileName && (
                <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
                  ✓ Fichier téléversé : {sujetFileName}
                </Typography>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowValidationDialog(false)}>
            Annuler
          </Button>
          <Button 
            variant="contained" 
            color="success"
            onClick={() => handleValider(true)}
          >
            Valider la formation
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de rapport de supervision */}
      <Dialog open={showRapportDialog} onClose={() => setShowRapportDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Rapport de Supervision</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Remplissez le rapport de supervision après avoir observé le déroulement complet de la formation et de l'examen.
            </Typography>

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Observations générales *"
              value={rapportData.observationsGenerales}
              onChange={(e) => setRapportData({ ...rapportData, observationsGenerales: e.target.value })}
              placeholder="Décrivez le déroulement général de la formation et de l'examen..."
              required
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Conformité du contenu"
                  value={rapportData.conformiteContenu}
                  onChange={(e) => setRapportData({ ...rapportData, conformiteContenu: e.target.value })}
                  placeholder="Conforme / Non conforme"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Conformité du formateur"
                  value={rapportData.conformiteFormateur}
                  onChange={(e) => setRapportData({ ...rapportData, conformiteFormateur: e.target.value })}
                  placeholder="Qualifié / Non qualifié"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Conformité du lieu"
                  value={rapportData.conformiteLieu}
                  onChange={(e) => setRapportData({ ...rapportData, conformiteLieu: e.target.value })}
                  placeholder="Adapté / Non adapté"
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Recommandations"
              value={rapportData.recommandations}
              onChange={(e) => setRapportData({ ...rapportData, recommandations: e.target.value })}
              placeholder="Recommandations pour améliorer les prochaines sessions..."
            />

            <FormControl fullWidth>
              <InputLabel>Les participants sont-ils aptes à l'examen ?</InputLabel>
              <Select
                value={rapportData.apteExamen}
                onChange={(e) => setRapportData({ ...rapportData, apteExamen: e.target.value === 'true' })}
                label="Les participants sont-ils aptes à l'examen ?"
              >
                <MenuItem value="true">Oui - Aptes</MenuItem>
                <MenuItem value="false">Non - Non aptes</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRapportDialog(false)}>
            Annuler
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleSoumettreRapport}
          >
            Soumettre le rapport
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de saisie des notes */}
      <Dialog open={showNotesDialog} onClose={() => setShowNotesDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Saisir les notes et résultats</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Saisissez les notes et résultats pour chaque participant. Les participants avec une note ≥ 10 seront marqués "Réussi".
            </Typography>

            {formation?.participants?.map((participant, index) => {
              const noteData = notesParticipants.find(n => n.participantId === participant.id);
              
              return (
                <Card key={participant.id} variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      {participant.prenom} {participant.nom}
                    </Typography>
                    
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Note / 20 *"
                          value={noteData?.note || ''}
                          onChange={(e) => {
                            const note = parseFloat(e.target.value);
                            updateNote(participant.id, 'note', note);
                            // Auto-déterminer le statut selon la note (valeurs avec accents comme dans l'enum backend)
                            updateNote(participant.id, 'statut', note >= 10 ? 'Réussi' : 'Échoué');
                          }}
                          inputProps={{ min: 0, max: 20, step: 0.5 }}
                        />
                      </Grid>
                      
                      <Grid size={{ xs: 12, md: 3 }}>
                        <FormControl fullWidth>
                          <InputLabel>Statut *</InputLabel>
                          <Select
                            value={noteData?.statut || 'En attente'}
                            onChange={(e) => updateNote(participant.id, 'statut', e.target.value)}
                            label="Statut *"
                          >
                            <MenuItem value="Réussi">Réussi</MenuItem>
                            <MenuItem value="Échoué">Échoué</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          label="Appréciation"
                          value={noteData?.appreciation || ''}
                          onChange={(e) => updateNote(participant.id, 'appreciation', e.target.value)}
                          placeholder="Ex: Très bon travail, maîtrise du sujet"
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNotesDialog(false)}>
            Annuler
          </Button>
          <Button 
            variant="contained" 
            color="success"
            onClick={handleSaisirNotes}
          >
            Enregistrer les notes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog upload copies examen */}
      <Dialog open={showUploadDialog} onClose={() => setShowUploadDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Téléverser les copies d'examen</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Téléversez le fichier PDF ou DOCX contenant les copies scannées de l'examen.
            </Typography>

            <Button
              variant="outlined"
              component="label"
              fullWidth
              disabled={uploadingCopies}
            >
              {uploadingCopies ? 'Téléversement...' : 'Choisir un fichier (PDF ou DOCX)'}
              <input
                type="file"
                hidden
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleTeleverserCopies}
              />
            </Button>

            <Typography variant="caption" color="text.secondary">
              Formats acceptés : PDF, DOCX • Taille max : 10 Mo
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUploadDialog(false)} disabled={uploadingCopies}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
}

