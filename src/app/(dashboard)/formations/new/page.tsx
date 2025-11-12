'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { Add, Trash, DocumentUpload } from '@wandersonalwes/iconsax-react';
import MainCard from 'components/MainCard';
import formationService, { CreateFormationDto } from 'services/formation/formationService';
import axios from 'services/axios.config';

export default function NewFormationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    type: 'GARDE_SURETE',
    nombreParticipants: 0,
    lieu: '',
    dateDebut: '',
    dateFin: '',
    centreFormation: ''
    // rsoFormateurId est automatiquement récupéré depuis le JWT côté backend
  });

  const [participants, setParticipants] = useState<Array<any>>([]);
  const [participantFiles, setParticipantFiles] = useState<Map<number, { cni?: File; casier?: File }>>(new Map());

  const ajouterParticipant = () => {
    setParticipants([...participants, {
      nom: '',
      prenom: '',
      dateNaissance: '',
      lieuNaissance: '',
      urlCNI: '',
      urlCasierJudiciaire: '',
      infosCasier: ''
    }]);
  };

  const supprimerParticipant = (index: number) => {
    setParticipants(participants.filter((_, i) => i !== index));
    const newFiles = new Map(participantFiles);
    newFiles.delete(index);
    setParticipantFiles(newFiles);
  };

  const updateParticipant = (index: number, field: string, value: string) => {
    const newParticipants = [...participants];
    newParticipants[index][field] = value;
    setParticipants(newParticipants);
  };

  const handleFileChange = (index: number, type: 'cni' | 'casier', file: File | null) => {
    const newFiles = new Map(participantFiles);
    const participantFile = newFiles.get(index) || {};
    
    if (file) {
      participantFile[type] = file;
    } else {
      delete participantFile[type];
    }
    
    newFiles.set(index, participantFile);
    setParticipantFiles(newFiles);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (!formData.lieu || !formData.dateDebut || !formData.dateFin) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
      }

      // Uploader les fichiers pour chaque participant
      const participantsWithFiles = await Promise.all(
        participants.map(async (participant, index) => {
          const files = participantFiles.get(index);
          let urlCNI = participant.urlCNI;
          let urlCasierJudiciaire = participant.urlCasierJudiciaire;

          if (files) {
            const formData = new FormData();
            if (files.cni) formData.append('files', files.cni);
            if (files.casier) formData.append('files', files.casier);

            if (formData.has('files')) {
              try {
                const response = await axios.post(
                  'http://localhost:8080/formations/participants/upload-documents',
                  formData,
                  {
                    headers: { 'Content-Type': 'multipart/form-data' }
                  }
                );

                const uploadedFiles = response.data.files;
                if (files.cni && uploadedFiles[0]) {
                  urlCNI = uploadedFiles[0].url;
                }
                if (files.casier) {
                  const casierIndex = files.cni ? 1 : 0;
                  if (uploadedFiles[casierIndex]) {
                    urlCasierJudiciaire = uploadedFiles[casierIndex].url;
                  }
                }
              } catch (error) {
                console.error(`Erreur upload participant ${index}:`, error);
              }
            }
          }

          return {
            ...participant,
            urlCNI,
            urlCasierJudiciaire
          };
        })
      );

      // Ne pas inclure rsoFormateurId - il sera automatiquement ajouté depuis le JWT
      const { rsoFormateurId, ...formDataWithoutRso } = formData as any;
      
      const payload: CreateFormationDto = {
        ...formDataWithoutRso,
        nombreParticipants: participantsWithFiles.length,
        participants: participantsWithFiles
      };

      await formationService.create(payload);
      alert('Formation créée avec succès !');
      router.push('/formations');
    } catch (error: any) {
      console.error('Erreur:', error);
      alert(`Erreur: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainCard title="Nouvelle Demande de Formation ISPS">
      <Grid container spacing={3}>
        {/* Informations générales */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Informations Générales
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Type de Formation *</InputLabel>
                    <Select
                      value={formData.type}
                      label="Type de Formation *"
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                      <MenuItem value="GARDE_SURETE">Garde de sûreté</MenuItem>
                      <MenuItem value="ASIP">ASIP</MenuItem>
                      <MenuItem value="SENSIBILISATION">Sensibilisation</MenuItem>
                      <MenuItem value="AUTRE">Autre</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Centre de Formation"
                    value={formData.centreFormation}
                    onChange={(e) => setFormData({ ...formData, centreFormation: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Lieu *"
                    value={formData.lieu}
                    onChange={(e) => setFormData({ ...formData, lieu: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Date de début *"
                    value={formData.dateDebut}
                    onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Date de fin *"
                    value={formData.dateFin}
                    onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Liste des participants */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6">
                  Participants ({participants.length})
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={ajouterParticipant}
                >
                  Ajouter un participant
                </Button>
              </Stack>

              {participants.length === 0 ? (
                <Typography color="text.secondary" align="center" sx={{ py: 3 }}>
                  Aucun participant ajouté. Cliquez sur "Ajouter un participant" pour commencer.
                </Typography>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Nom</TableCell>
                        <TableCell>Prénom</TableCell>
                        <TableCell>Date Naissance</TableCell>
                        <TableCell>Lieu Naissance</TableCell>
                        <TableCell>Pièce CNI</TableCell>
                        <TableCell>Casier Judiciaire</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {participants.map((participant, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <TextField
                              size="small"
                              value={participant.nom}
                              onChange={(e) => updateParticipant(index, 'nom', e.target.value)}
                              placeholder="Nom"
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              value={participant.prenom}
                              onChange={(e) => updateParticipant(index, 'prenom', e.target.value)}
                              placeholder="Prénom"
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              type="date"
                              value={participant.dateNaissance}
                              onChange={(e) => updateParticipant(index, 'dateNaissance', e.target.value)}
                              InputLabelProps={{ shrink: true }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              value={participant.lieuNaissance}
                              onChange={(e) => updateParticipant(index, 'lieuNaissance', e.target.value)}
                              placeholder="Lieu"
                            />
                          </TableCell>
                          <TableCell>
                            <input
                              accept="image/*,application/pdf"
                              style={{ display: 'none' }}
                              id={`cni-file-${index}`}
                              type="file"
                              onChange={(e) => handleFileChange(index, 'cni', e.target.files?.[0] || null)}
                            />
                            <label htmlFor={`cni-file-${index}`}>
                              <Button
                                component="span"
                                size="small"
                                variant={participantFiles.get(index)?.cni ? 'contained' : 'outlined'}
                                color={participantFiles.get(index)?.cni ? 'success' : 'primary'}
                                startIcon={<DocumentUpload />}
                              >
                                {participantFiles.get(index)?.cni ? 'Chargée' : 'Upload'}
                              </Button>
                            </label>
                          </TableCell>
                          <TableCell>
                            <input
                              accept="image/*,application/pdf"
                              style={{ display: 'none' }}
                              id={`casier-file-${index}`}
                              type="file"
                              onChange={(e) => handleFileChange(index, 'casier', e.target.files?.[0] || null)}
                            />
                            <label htmlFor={`casier-file-${index}`}>
                              <Button
                                component="span"
                                size="small"
                                variant={participantFiles.get(index)?.casier ? 'contained' : 'outlined'}
                                color={participantFiles.get(index)?.casier ? 'success' : 'primary'}
                                startIcon={<DocumentUpload />}
                              >
                                {participantFiles.get(index)?.casier ? 'Chargé' : 'Upload'}
                              </Button>
                            </label>
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => supprimerParticipant(index)}
                            >
                              <Trash />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Actions */}
        <Grid item xs={12}>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button variant="outlined" onClick={() => router.push('/formations')}>
              Annuler
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading || participants.length === 0}
            >
              Soumettre la demande
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </MainCard>
  );
}

