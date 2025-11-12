'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Swal from 'sweetalert2';

// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

// project imports
import MainCard from 'components/MainCard';
import api from 'services/axios.config';
interface IncidentForm {
  type: string;
  description: string;
  localisation: string;
  gravite: 'MINEUR' | 'MODERE' | 'SERIEUX' | 'CRITIQUE';
  statut:
    | 'SIGNALE'
    | 'EN_COURS_EVALUATION'
    | 'CONFIRME'
    | 'EN_COURS_TRAITEMENT'
    | 'RESOLU'
    | 'ARCHIVE'
    | 'DECLARE'
    | 'EN_COURS'
    | 'CLOTURE';
  lieuId?: string;
}

const initialForm: IncidentForm = {
  type: '',
  description: '',
  localisation: '',
  gravite: 'MINEUR',
  statut: 'SIGNALE'
};

// ==============================|| INCIDENT - EDIT ||============================== //

export default function EditIncidentPage() {
  const router = useRouter();
  const params = useParams();
  const incidentId = params?.id as string;

  // States
  const [form, setForm] = useState<IncidentForm>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [lieux, setLieux] = useState<Array<{ id: string; nom: string }>>([]);
  const [lieuxLoading, setLieuxLoading] = useState(false);
  const [lieuxError, setLieuxError] = useState<string | null>(null);

  // Fetch incident data
  useEffect(() => {
    if (!incidentId) {
      setError('ID d\'incident manquant');
      setIsLoading(false);
      return;
    }

    const fetchIncident = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.get(`/incident/${incidentId}`);
        if (res.status > 400) {
          throw new Error(`Erreur ${res.status} ${res.statusText}`);
        }
        const data = res.data;

        // Map API data to form
        setForm({
          type: data.type || '',
          description: data.description || '',
          localisation: data.localisation || '',
          gravite: data.gravite || 'MINEUR',
          statut: data.statut || 'SIGNALE',
          lieuId: data.lieu?.id || ''
        });
      } catch (err) {
        console.error('Erreur chargement incident:', err);
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement de l\'incident');
      } finally {
        setIsLoading(false);
      }
    };

    fetchIncident();
  }, [incidentId]);

  // (optional) Fetch current user if needed later

  // Fetch lieux list
  useEffect(() => {
    let mounted = true;
    const fetchLieux = async () => {
      setLieuxLoading(true);
      try {
        const res = await api.get('/lieu/all');
        if (res.status > 400) {
          throw new Error(`Erreur lieu ${res.status} ${res.statusText}`);
        }
        const data = res.data;
        if (mounted) {
          // normalize items: backend may return { id, name } or { id, nom }
          const normalized = Array.isArray(data)
            ? data.map((item: any) => ({ 
                id: item.id ?? item._id ?? item.value ?? '', 
                nom: item.nom ?? item.name ?? item.label ?? '' 
              }))
            : [];
          setLieux(normalized);
        }
      } catch (err) {
        console.error('Erreur lieux:', err);
        if (mounted) setLieuxError(err instanceof Error ? err.message : 'Erreur récupération lieux');
      } finally {
        if (mounted) setLieuxLoading(false);
      }
    };

    fetchLieux();
    return () => {
      mounted = false;
    };
  }, []);

  // Reset success/error messages after delay
  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error]);

  // Form validation
  const validateForm = useCallback(() => {
    if (!form.type.trim()) {
      setError('Le type d\'incident est requis');
      return false;
    }
    // require either a selected lieu or a free-text localisation
    if (!(form.lieuId && String(form.lieuId).trim()) && !String(form.localisation || '').trim()) {
      setError('La localisation est requise (sélectionner un lieu ou préciser un emplacement)');
      return false;
    }
    if (!form.description.trim()) {
      setError('La description est requise');
      return false;
    }
    return true;
  }, [form]);

  // Handle form field changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent,
    field?: string
  ) => {
    const name = field || e.target.name;
    const value = e.target.value;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setError(null);

    // confirmation SweetAlert2
    const result = await Swal.fire({
      title: "Confirmer la modification",
      text: "Voulez-vous enregistrer les modifications de cet incident ?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, enregistrer',
      cancelButtonText: 'Annuler'
    });

    if (!result.isConfirmed) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Build payload with only allowed fields
      const payload: any = {
        type: form.type,
        description: form.description,
        localisation: form.localisation,
        gravite: form.gravite,
        statut: form.statut
      };
      if (form.lieuId && String(form.lieuId).trim()) {
        payload.lieuId = form.lieuId;
      }

      const response = await api.patch(`/incident/${incidentId}`, payload);

      if (response.status > 204) {
        const text = response.data?.message || '';
        throw new Error(text || 'Erreur lors de la modification de l\'incident');
      }

      setSuccessMessage('Incident modifié avec succès');
      await Swal.fire('Succès', "L'incident a été modifié avec succès.", 'success');
      setTimeout(() => {
        router.push('/incident/list');
      }, 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(message);
      await Swal.fire('Erreur', message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <MainCard title="Modification d'incident">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </MainCard>
    );
  }

  // Show error if incident not found
  if (error && !form.type) {
    return (
      <MainCard title="Modification d'incident">
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="outlined" onClick={() => router.push('/incident/list')}>
          Retour à la liste
        </Button>
      </MainCard>
    );
  }

  return (
    <MainCard title="Modifier l'incident">
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <Grid sx={{ display: 'grid', gap: 3 }}>
          {(error || successMessage) && (
            <Box sx={{ width: '100%' }}>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}
            </Box>
          )}

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <Stack spacing={1}>
              <InputLabel required>Type d'incident</InputLabel>
              <TextField
                name="type"
                value={form.type}
                onChange={handleChange}
                fullWidth
                placeholder="Ex: Intrusion, Dégradation..."
                disabled={isSubmitting}
              />
              <FormHelperText>Spécifiez le type d'incident</FormHelperText>
            </Stack>

            <Stack spacing={1}>
              <InputLabel>Gravité</InputLabel>
              <FormControl fullWidth>
                <Select
                  name="gravite"
                  value={form.gravite}
                  onChange={(e) => handleChange(e, 'gravite')}
                  disabled={isSubmitting}
                >
                  <MenuItem value="MINEUR">Mineur</MenuItem>
                  <MenuItem value="MODERE">Modéré</MenuItem>
                  <MenuItem value="SERIEUX">Sérieux</MenuItem>
                  <MenuItem value="CRITIQUE">Critique</MenuItem>
                </Select>
                <FormHelperText>Sélectionnez le niveau de gravité</FormHelperText>
              </FormControl>
            </Stack>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <Stack spacing={1}>
              <InputLabel sx={{ mt: 1 }}>Statut</InputLabel>
              <FormControl fullWidth>
                <Select
                  name="statut"
                  value={form.statut}
                  onChange={(e) => handleChange(e, 'statut')}
                  disabled={isSubmitting}
                >
                  <MenuItem value="SIGNALE">Signalé</MenuItem>
                  <MenuItem value="DECLARE">Déclaré</MenuItem>
                  <MenuItem value="EN_COURS_EVALUATION">En cours d'évaluation</MenuItem>
                  <MenuItem value="CONFIRME">Confirmé</MenuItem>
                  <MenuItem value="EN_COURS_TRAITEMENT">En cours de traitement</MenuItem>
                  <MenuItem value="EN_COURS">En cours</MenuItem>
                  <MenuItem value="RESOLU">Résolu</MenuItem>
                  <MenuItem value="CLOTURE">Clôturé</MenuItem>
                  <MenuItem value="ARCHIVE">Archivé</MenuItem>
                </Select>
                <FormHelperText>Sélectionnez le statut de l'incident</FormHelperText>
              </FormControl>
            </Stack>

            <Stack spacing={1}>
              <InputLabel sx={{ mt: 1 }}>Lieu (sélection)</InputLabel>
              <FormControl fullWidth>
                <Select
                  name="lieuId"
                  value={form.lieuId || ''}
                  onChange={(e) => handleChange(e, 'lieuId')}
                  disabled={isSubmitting || lieuxLoading}
                >
                  <MenuItem value="">Autre / Préciser</MenuItem>
                  {lieuxLoading ? (
                    <MenuItem disabled>Chargement des lieux...</MenuItem>
                  ) : lieuxError ? (
                    <MenuItem disabled>Erreur chargement lieux</MenuItem>
                  ) : (
                    lieux.map((l) => (
                      <MenuItem key={l.id} value={l.id}>{l.nom}</MenuItem>
                    ))
                  )}
                </Select>
                <FormHelperText>Choisissez un lieu si disponible (ou laissez Autre)</FormHelperText>
              </FormControl>
            </Stack>
          </Box>

          <Stack spacing={1}>
            <InputLabel required>Localisation</InputLabel>
            <TextField
              name="localisation"
              value={form.localisation}
              onChange={handleChange}
              fullWidth
              placeholder="Ex: Terminal conteneurs - Quai 7"
              disabled={isSubmitting}
            />
            <FormHelperText>Précisez l'emplacement exact de l'incident</FormHelperText>
          </Stack>

          <Stack spacing={1}>
            <InputLabel required>Description détaillée</InputLabel>
            <TextField
              name="description"
              value={form.description}
              onChange={handleChange}
              multiline
              rows={4}
              fullWidth
              placeholder="Décrivez en détail l'incident..."
              disabled={isSubmitting}
            />
            <FormHelperText>
              Fournissez tous les détails pertinents concernant l'incident
            </FormHelperText>
          </Stack>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              color="error"
              onClick={() => router.push('/incident/list')}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {isSubmitting ? 'Modification en cours...' : 'Enregistrer les modifications'}
            </Button>
          </Box>
        </Grid>
      </Box>
    </MainCard>
  );
}
