'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// material-ui
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert
} from '@mui/material';
import { ArrowDown2 } from '@wandersonalwes/iconsax-react';

// project imports
import MainCard from 'components/MainCard';
import inspectionService from 'services/inspection/inspectionService';
import comiteService, { Comite } from 'services/comite/comiteService';
import checklistService from 'services/checklist/checklistService';
import itemChecklistService from 'services/checklist/itemChecklistService';
import { INSPECTION_CHECKLIST, ChecklistItem } from 'data/inspection-checklist';

// ==============================|| NEW INSPECTION ||============================== //

export default function NewInspectionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [comites, setComites] = useState<Comite[]>([]);

  // Informations générales
  const [formData, setFormData] = useState({
    type: 'NAVIRE', // Type d'inspection par défaut
    navire: '',
    imo_number: '',
    date_insp: new Date().toISOString().split('T')[0],
    inspecteur: '',
    osn_capitaine: '',
    comiteId: '',
    desc: ''
  });

  // Données du checklist
  const [checklistData, setChecklistData] = useState<Record<string, ChecklistItem>>({});

  useEffect(() => {
    loadComites();
    initializeChecklist();
  }, []);

  const loadComites = async () => {
    try {
      const data = await comiteService.getAll();
      setComites(data);
    } catch (error) {
      console.error('Erreur lors du chargement des comités:', error);
      // En cas d'erreur, afficher un message à l'utilisateur
      alert('Erreur lors du chargement des comités. Vérifiez que le backend est démarré.');
    }
  };

  const initializeChecklist = () => {
    const initialData: Record<string, ChecklistItem> = {};
    INSPECTION_CHECKLIST.forEach((section) => {
      section.items.forEach((item) => {
        initialData[item.id] = {
          ...item,
          value: undefined,
          commentaire: ''
        };
      });
    });
    setChecklistData(initialData);
  };

  const handleChecklistChange = (itemId: string, field: 'value' | 'commentaire', value: any) => {
    setChecklistData((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value
      }
    }));
  };

  const saveChecklistsToDatabase = async (inspectionId: string, checklistBySection: Record<string, any>) => {
    try {
      // Pour chaque section, créer une checklist
      for (const [sectionTitle, sectionData] of Object.entries(checklistBySection)) {
        // Créer la checklist pour cette section
        const createdChecklist = await checklistService.create({
          name: sectionTitle,
          inspectionId: inspectionId
        });

        // Créer tous les items de cette section
                        const itemsToCreate = Object.entries(sectionData).map(([question, answer]: [string, any]) => ({
          name: question,
          isValid: answer?.reponse === 'OUI',
          commentaire: answer?.commentaire || '',
          checklistId: createdChecklist.id
        }));

        // Sauvegarder tous les items en batch
        await itemChecklistService.createBatch(itemsToCreate);
      }
      console.log('Checklists sauvegardées dans les tables relationnelles');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des checklists:', error);
      // On ne bloque pas l'inspection même si la sauvegarde relationnelle échoue
      // Car les données sont déjà dans le JSON
    }
  };

  const handleSubmit = async (status: 'PLANIFIE' | 'TERMINEE') => {
    try {
      setLoading(true);

      // Validation des champs obligatoires
      if (!formData.comiteId) {
        alert('Veuillez sélectionner un comité');
        setLoading(false);
        return;
      }
      if (!formData.desc) {
        alert('Veuillez saisir une description');
        setLoading(false);
        return;
      }

      // Convertir les données du checklist en format structuré
      const checklistBySection: Record<string, any> = {};
      INSPECTION_CHECKLIST.forEach((section) => {
        checklistBySection[section.title] = {};
        section.items.forEach((item) => {
          const data = checklistData[item.id];
          checklistBySection[section.title][item.question] = {
            reponse: data?.value || 'NON',
            commentaire: data?.commentaire || ''
          };
        });
      });

      const payload = {
        ...formData,
        style: 'INSPECTION',
        status: status,
        data: checklistBySection
      };

      console.log('Payload envoyé:', payload);

      // Créer l'inspection
      const createdInspection = await inspectionService.create(payload);

      // Sauvegarder aussi dans les tables relationnelles (checklists + items)
      await saveChecklistsToDatabase(createdInspection.id, checklistBySection);

      alert(`Inspection ${status === 'PLANIFIE' ? 'planifiée' : 'terminée'} avec succès !`);
      router.push('/inspections');
    } catch (error: any) {
      console.error('Erreur complète:', error);
      console.error('Réponse du serveur:', error.response?.data);
      
      const errorMessage = error.response?.data?.message || error.message || 'Erreur inconnue';
      alert(`Erreur lors de la création de l'inspection:\n\n${errorMessage}\n\nVérifiez que le backend est démarré sur le port 8080.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainCard title="Nouvelle Inspection de Sûreté">
      <Grid container spacing={3}>
        {/* Informations générales */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Informations Générales
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Type d'inspection *</InputLabel>
                    <Select
                      value={formData.type}
                      label="Type d'inspection *"
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                      <MenuItem value="NAVIRE">
                        Navire (Inspection de bateau/navire)
                      </MenuItem>
                      <MenuItem value="SITE">
                        Site (Inspection de lieu terrestre)
                      </MenuItem>
                      <MenuItem value="INSTALLATION">
                        Installation (Inspection d'infrastructure portuaire)
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Navire"
                    value={formData.navire}
                    onChange={(e) => setFormData({ ...formData, navire: e.target.value })}
                    helperText={formData.type === 'NAVIRE' ? 'Obligatoire pour inspection de navire' : 'Optionnel'}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="IMO N°"
                    value={formData.imo_number}
                    onChange={(e) => setFormData({ ...formData, imo_number: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Date de l'inspection"
                    value={formData.date_insp}
                    onChange={(e) => setFormData({ ...formData, date_insp: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Inspecteur(s)"
                    value={formData.inspecteur}
                    onChange={(e) => setFormData({ ...formData, inspecteur: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="OSN / Capitaine"
                    value={formData.osn_capitaine}
                    onChange={(e) => setFormData({ ...formData, osn_capitaine: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ p: 2, border: '1px solid', borderColor: 'primary.light', borderRadius: 1, bgcolor: 'grey.50' }}>
                    <Typography variant="body2" fontWeight="bold" gutterBottom color="primary">
                      Comité de Sûreté *
                    </Typography>
                    <FormControl fullWidth required>
                      <InputLabel>Sélectionnez un comité</InputLabel>
                      <Select
                        value={formData.comiteId}
                        label="Sélectionnez un comité"
                        onChange={(e) => setFormData({ ...formData, comiteId: e.target.value })}
                        sx={{ bgcolor: 'white' }}
                      >
                        {comites.length === 0 ? (
                          <MenuItem disabled>Aucun comité disponible</MenuItem>
                        ) : (
                          comites.map((comite) => (
                            <MenuItem key={comite.id} value={comite.id} sx={{ py: 1 }}>
                              <Box>
                                <Typography variant="body1" fontWeight="medium">
                                  {comite.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  RSO: {comite.rso?.name || 'N/A'} • IP: {comite.ip?.name || 'N/A'} • {comite.status}
                                </Typography>
                              </Box>
                            </MenuItem>
                          ))
                        )}
                      </Select>
                    </FormControl>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Description"
                    value={formData.desc}
                    onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Checklist */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Check-list d'Inspection de Sûreté
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Répondez à chaque question en sélectionnant OUI ou NON. Ajoutez des commentaires si nécessaire.
              </Alert>

              {INSPECTION_CHECKLIST.map((section) => (
                <Accordion key={section.id} defaultExpanded={section.id === 'A'}>
                  <AccordionSummary expandIcon={<ArrowDown2 />}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {section.title}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={2}>
                      {section.items.map((item) => (
                        <Box key={item.id}>
                          <Typography variant="body2" gutterBottom>
                            {item.question}
                          </Typography>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <RadioGroup
                              row
                              value={checklistData[item.id]?.value || ''}
                              onChange={(e) => handleChecklistChange(item.id, 'value', e.target.value)}
                            >
                              <FormControlLabel value="OUI" control={<Radio />} label="Oui" />
                              <FormControlLabel value="NON" control={<Radio />} label="Non" />
                            </RadioGroup>
                            <TextField
                              size="small"
                              placeholder="Commentaire"
                              value={checklistData[item.id]?.commentaire || ''}
                              onChange={(e) => handleChecklistChange(item.id, 'commentaire', e.target.value)}
                              sx={{ flexGrow: 1 }}
                            />
                          </Stack>
                          <Divider sx={{ mt: 1.5 }} />
                        </Box>
                      ))}
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Actions */}
        <Grid item xs={12}>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button variant="outlined" onClick={() => router.push('/inspections')}>
              Annuler
            </Button>
            <Button
              variant="outlined"
              onClick={() => handleSubmit('PLANIFIE')}
              disabled={loading}
            >
              Enregistrer comme Planifiée
            </Button>
            <Button
              variant="contained"
              onClick={() => handleSubmit('TERMINEE')}
              disabled={loading}
            >
              Soumettre (Terminée)
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </MainCard>
  );
}

