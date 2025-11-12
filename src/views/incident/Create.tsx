'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

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
import CircularProgress from '@mui/material/CircularProgress';
// removed unused useTheme
import Swal from 'sweetalert2';

// project imports
import MainCard from 'components/MainCard';
import axios from 'utils/axios';
import api from 'services/axios.config';

// types
interface User {
  id: string;
  name: string;
}

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
    | 'ARCHIVE';
  siteId?: string;
}

const initialForm: IncidentForm = {
  type: '',
  description: '',
  localisation: '',
  gravite: 'MINEUR',
  statut: 'SIGNALE'
};

// ==============================|| INCIDENT - CREATE ||============================== //

export default function CreateIncidentPage() {
  const router = useRouter();

  // States
  const [form, setForm] = useState<IncidentForm>(initialForm);
  const [_currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [lieux, setLieux] = useState<Array<{ id: string; nom: string }>>([]);
  const [lieuxLoading, setLieuxLoading] = useState(false);
  const [lieuxError, setLieuxError] = useState<string | null>(null);

  // Fetch current user on component mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('http://localhost:8080/users');
        if (!response.ok) throw new Error('Erreur d\'authentification');
        const user = await response.json();
        setCurrentUser(user);
      } catch (err) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', err);
        setError('Veuillez vous connecter pour créer un incident');
      }
    };

    fetchCurrentUser();
  }, []);

  // Fetch lieux list
  useEffect(() => {
    let mounted = true;
    const fetchLieux = async () => {
      setLieuxLoading(true);
      try {
        const res = await axios.get('http://localhost:8080/sites');
        if (res.status !== 200) {
          throw new Error(`Erreur site ${res.status} ${res.statusText}`);
        }
        const data = res.data;
        if (mounted) {
          // normalize items: backend may return { id, name } or { id, nom }
          const normalized = Array.isArray(data)
            ? data.map((item: any) => ({ id: item.id ?? item._id ?? item.value ?? '', nom: item.nom ?? item.name ?? item.label ?? '' }))
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
      setError("Le type d'incident est requis");
      Swal.fire({ icon: 'warning', title: 'Champs requis', text: "Le type d'incident est requis" });
      return false;
    }
    // require either a selected site or a free-text localisation
    if (!(form.siteId && String(form.siteId).trim()) && !String(form.localisation || '').trim()) {
      setError('La localisation est requise (sélectionner un site ou préciser un emplacement)');
      Swal.fire({ icon: 'warning', title: 'Localisation manquante', text: 'La localisation est requise (sélectionner un site ou préciser un emplacement)' });
      return false;
    }
    if (!form.description.trim()) {
      setError('La description est requise');
      Swal.fire({ icon: 'warning', title: 'Champs requis', text: 'La description est requise' });
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

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await api.post('/incident', {
        headers: {
          'Content-Type': 'application/json',
        },
        data: JSON.stringify({
          ...form,
          /*userCreate: currentUser,*/
          userCreate: "4bad3327-6685-4f60-ae2b-784c9306534c",
          createAt: new Date().toISOString()
        })
      });

      if (response.status > 204) {
        const text = response.data?.message || '';
        throw new Error(text || "Erreur lors de la création de l'incident");
      }

      setSuccessMessage('Incident créé avec succès');
      await Swal.fire({ icon: 'success', title: 'Créé', text: 'Incident créé avec succès', timer: 1500, showConfirmButton: false });
      router.push('/incident/list');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(message);
      await Swal.fire({ icon: 'error', title: 'Erreur', text: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    const result = await Swal.fire({
      title: 'Annuler la déclaration ?',
      text: 'Les informations non enregistrées seront perdues.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, quitter',
      cancelButtonText: 'Rester'
    });
    if (result.isConfirmed) router.push('/incident');
  };

  // Redirect if not authenticated
//   useEffect(() => {
//     if (!currentUser && error?.includes('connecter')) {
//       const timer = setTimeout(() => {
//         router.push('/auth/login');
//       }, 3000);
//       return () => clearTimeout(timer);
//     }
//   }, [currentUser, error, router]);

  return (
    <MainCard title="Déclarer un incident">
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <Grid sx={{ display: 'grid', gap: 3 }}>
          {/* Notifications gérées via SweetAlert */}

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <Stack spacing={1}>
              <InputLabel required>Type d&apos;incident</InputLabel>
              <TextField
                name="type"
                value={form.type}
                onChange={handleChange}
                fullWidth
                placeholder="Ex: Intrusion, Dégradation..."
                disabled={isSubmitting}
              />
              <FormHelperText>Spécifiez le type d&apos;incident</FormHelperText>
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
              <MenuItem value="EN_COURS_EVALUATION">En cours d’évaluation</MenuItem>
              <MenuItem value="CONFIRME">Confirmé</MenuItem>
              <MenuItem value="EN_COURS_TRAITEMENT">En cours de traitement</MenuItem>
              <MenuItem value="RESOLU">Résolu</MenuItem>
              <MenuItem value="ARCHIVE">Archivé</MenuItem>
            </Select>
            <FormHelperText>Sélectionnez le statut de l&apos;incident</FormHelperText>
            </FormControl>
          </Stack>

          <Stack spacing={1}>
            <InputLabel sx={{ mt: 1 }}>Lieu (sélection)</InputLabel>
            <FormControl fullWidth>
            <Select
              name="siteId"
              value={form.siteId || ''}
              onChange={(e) => { handleChange(e, 'siteId') }}
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
            <FormHelperText>Choisissez un site si disponible (ou laissez Autre)</FormHelperText>
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
            <FormHelperText>Précisez l&apos;emplacement exact de l&apos;incident</FormHelperText>
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
              placeholder="Décrivez en détail l&apos;incident..."
              disabled={isSubmitting}
            />
            <FormHelperText>
              Fournissez tous les détails pertinents concernant l&apos;incident
            </FormHelperText>
          </Stack>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              color="error"
              onClick={handleCancel}
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
              {isSubmitting ? 'Création en cours...' : 'Déclarer l\'incident'}
            </Button>
          </Box>
        </Grid>
      </Box>
    </MainCard>
  );
}
