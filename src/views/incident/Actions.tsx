'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Checkbox,
  Chip,
  Stack,
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress
} from '@mui/material';
 
import { useTheme } from '@mui/material/styles';
import Swal from 'sweetalert2';

// project-imports
import Avatar from 'components/@extended/Avatar';
import IconButton from 'components/@extended/IconButton';
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';

// assets
import {
  Star1,
  AttachSquare,
  DocumentDownload,
  ArrowDown2,
  DocumentUpload,
  Trash,
  Edit,
  TickCircle,
  ShieldTick,
  Printer
} from '@wandersonalwes/iconsax-react';
import { Eye } from '@wandersonalwes/iconsax-react';
import api from 'services/axios.config';


// API Base URL
const API = process.env.NEXT_PUBLIC_API_URL;

// Types
interface ActionItem {
  id: string;
  titre: string;
  description: string;
  equipe: string;
  pieces_jointes: string[];
  dateAction: string;
  dateModification: string;
  incidentId?: string;
  entiteId?: string;
  isStarred?: boolean;
}

// Liste initiale vide - chargée depuis l'API
const initialItems: ActionItem[] = [];

// Construit une URL publique à partir d'un chemin stocké en BDD (gère les \ Windows)
const buildPublicFileUrl = (filePath: string): string => {
  if (!filePath) return '#';
  // Si c'est déjà une URL absolue
  if (/^https?:\/\//i.test(filePath)) return filePath;
  // Normaliser les séparateurs et retirer les slashs de début
  const normalized = filePath.replace(/\\/g, '/').replace(/^\/+/, '');
  return `${API}/${normalized}`;
};

// Résout la meilleure URL pour consulter/télécharger une pièce jointe
const resolveAttachmentUrl = (fileName: string, actionId?: string): string => {
  // Si le champ contient un chemin (uploads/...) on renvoie l'URL statique
  const looksLikePath = /uploads|\\|\//i.test(fileName) || /^https?:\/\//i.test(fileName);
  if (looksLikePath) return buildPublicFileUrl(fileName);
  // Fallback: endpoint d'attachement par action si disponible côté API
  if (actionId) return `${API}/actions/${actionId}/attachments/${encodeURIComponent(fileName)}`;
  return buildPublicFileUrl(fileName);
};

// Détection de type de fichier pour l'aperçu
const getExtension = (name: string): string => {
  const clean = name.replace(/\\/g, '/');
  const base = clean.split('/').pop() || clean;
  const withoutQuery = base.split('?')[0].split('#')[0];
  const parts = withoutQuery.split('.');
  return (parts.length > 1 ? parts.pop() : '')?.toLowerCase() || '';
};

const IMAGE_EXTS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg']);
const OFFICE_EXTS = new Set(['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx']);
const PDF_EXTS = new Set(['pdf']);
const isImageFile = (name: string) => IMAGE_EXTS.has(getExtension(name));
const isOfficeFile = (name: string) => OFFICE_EXTS.has(getExtension(name));
const isPdfFile = (name: string) => PDF_EXTS.has(getExtension(name));
const canUseOfficeViewer = (): boolean => !/^https?:\/\/(localhost|127\.0\.0\.1)([:/]|$)/i.test(API);
const buildOfficeViewerUrl = (fileUrl: string): string => `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;

export default function IncidentActions({ incidentId }: { incidentId?: string }) {
  const theme = useTheme();
  const [items, setItems] = useState<ActionItem[]>(initialItems);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ open: boolean; kind: 'image' | 'office' | 'pdf' | null; url: string; fileUrl: string; title: string }>(
    { open: false, kind: null, url: '', fileUrl: '', title: '' }
  );

  // Create dialog state
  const [openCreate, setOpenCreate] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [entites, setEntites] = useState<Array<{ id: string; nom: string }>>([]);
  const [entitesLoading, setEntitesLoading] = useState(false);
  const [entitesError, setEntitesError] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState<{ titre: string; description: string; equipe: string; entiteId: string }>({
    titre: '',
    description: '',
    equipe: '',
    entiteId: ''
  });

  const empty = items.length === 0;

  const handleToggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const toggleStar = (id: string) => {
    setItems((prev) => prev.map((m) => (m.id === id ? { ...m, isStarred: !m.isStarred } : m)));
  };

  // Charger les actions pour l'incident
  useEffect(() => {
    let mounted = true;
    const fetchActions = async () => {
      if (!incidentId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/incident/${incidentId}/actions`);
        if (res.status !== 200) throw new Error(`Erreur ${res.status}`);
        const data = res.data;
        if (!mounted) return;
        const mapped: ActionItem[] = Array.isArray(data)
          ? data.map((a: any) => ({
              id: a.id,
              titre: a.titre,
              description: a.description,
              equipe: a.equipe,
              pieces_jointes: a.pieces_jointes || [],
              dateAction: a.dateAction || new Date().toISOString(),
              dateModification: a.dateModification || a.dateAction || new Date().toISOString(),
              incidentId: a.incidentId ?? a.incident?.id,
              entiteId: a.entiteId ?? a.entite?.id,
              isStarred: false
            }))
          : [];
        setItems(mapped);
      } catch (e: any) {
        console.error('Erreur chargement actions:', e);
        setError(e?.message || 'Erreur de chargement des actions');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchActions();
    return () => {
      mounted = false;
    };
  }, [incidentId]);

  // Charger la liste des entités (au montage et à l'ouverture du dialog)
  useEffect(() => {
    let mounted = true;
    const fetchEntites = async () => {
      setEntitesLoading(true);
      setEntitesError(null);
      try {
        const res = await api.get(`/entite`);
        if (res.status !== 200) throw new Error(`Erreur ${res.status}`);
        const data = res.data;
        if (!mounted) return;
        const normalized = Array.isArray(data)
          ? data.map((e: any) => ({ id: e.id ?? e._id ?? e.value ?? '', nom: e.nom ?? e.name ?? e.label ?? '' }))
          : [];
        setEntites(normalized);
      } catch (e: any) {
        if (mounted) setEntitesError(e?.message || 'Erreur chargement entités');
      } finally {
        if (mounted) setEntitesLoading(false);
      }
    };
    fetchEntites();
    return () => {
      mounted = false;
    };
  }, []);

  const handleValidateAction = async (actionId: string) => {
    await Swal.fire({
      title: 'Valider cette action ?',
      text: 'Cette action sera marquée comme complétée et validée.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, valider',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire('Validée !', "L'action a été marquée comme complétée.", 'success');
      }
    });
  };

  const handleOpenCreate = () => {
    setCreateForm({ titre: '', description: '', equipe: '', entiteId: '' });
    setCreateError(null);
    setOpenCreate(true);
  };

  const handleCloseCreate = () => {
    setOpenCreate(false);
  };

  const handleSubmitCreate = async () => {
    if (!createForm.titre.trim() || !createForm.description.trim() || !createForm.equipe.trim() || !createForm.entiteId.trim()) {
      setCreateError('Tous les champs sont obligatoires');
      return;
    }
    if (!incidentId) {
      setCreateError('Aucun incident associé');
      return;
    }
    setCreateSubmitting(true);
    setCreateError(null);
    try {
      const payload = {
        titre: createForm.titre,
        description: createForm.description,
        equipe: createForm.equipe,
        entiteId: Number(createForm.entiteId), // Convertir en nombre
        incidentId: incidentId // Ajouter l'ID de l'incident
      };
      const res = await api.post(`${API}/actions`, payload);
      if (res.status !== 201) throw new Error(`Erreur création (${res.status})`);
      const created = res.data;
      const newAction: ActionItem = {
        id: created.id,
        titre: created.titre,
        description: created.description,
        equipe: created.equipe,
        pieces_jointes: created.pieces_jointes || [],
        dateAction: created.dateAction || new Date().toISOString(),
        dateModification: created.dateModification || created.dateAction || new Date().toISOString(),
        incidentId: created.incidentId ?? created.incident?.id,
        entiteId: created.entiteId ?? created.entite?.id,
        isStarred: false
      };
      setItems((prev) => [newAction, ...prev]);
      setOpenCreate(false);
      await Swal.fire('Créée !', "L'action a été créée avec succès.", 'success');
    } catch (e: any) {
      setCreateError(e?.message || 'Création impossible');
    } finally {
      setCreateSubmitting(false);
    }
  };

  const handleEditAction = (actionId: string) => {
    const action = items.find((i) => i.id === actionId);
    if (!action) return;

    Swal.fire({
      title: "Modifier l'action",
      html: `
        <input id="swal-titre" class="swal2-input" placeholder="Titre" value="${action.titre}" style="width: 90%;">
        <textarea id="swal-desc" class="swal2-textarea" placeholder="Description" style="width: 90%; height: 100px;">${action.description}</textarea>
        <input id="swal-equipe" class="swal2-input" placeholder="Équipe" value="${action.equipe}" style="width: 90%;">
      `,
      showCancelButton: true,
      confirmButtonText: 'Enregistrer',
      cancelButtonText: 'Annuler',
      width: 600,
      preConfirm: () => {
        const titre = (document.getElementById('swal-titre') as HTMLInputElement).value;
        const description = (document.getElementById('swal-desc') as HTMLTextAreaElement).value;
        const equipe = (document.getElementById('swal-equipe') as HTMLInputElement).value;

        if (!titre || !description || !equipe) {
          Swal.showValidationMessage('Tous les champs sont obligatoires');
          return null;
        }
        return { titre, description, equipe };
      }
    }).then(async (result) => {
      if (result.isConfirmed && result.value) {
        try {
          const payload = {
            titre: result.value.titre,
            description: result.value.description,
            equipe: result.value.equipe
          };
          const res = await api.patch(`/actions/${actionId}`, payload);
          if (res.status !== 200) throw new Error(`Erreur mise à jour (${res.status})`);
          const updated = res.data;
          setItems((prev) =>
            prev.map((it) =>
              it.id === actionId
                ? {
                    ...it,
                    titre: updated.titre,
                    description: updated.description,
                    equipe: updated.equipe,
                    dateModification: updated.dateModification || new Date().toISOString()
                  }
                : it
            )
          );
          await Swal.fire('Modifiée !', "L'action a été mise à jour.", 'success');
        } catch (e: any) {
          await Swal.fire('Erreur', e?.message || 'Mise à jour impossible', 'error');
        }
      }
    });
  };

  const handleDeleteAction = async (actionId: string) => {
    await Swal.fire({
      title: 'Supprimer cette action ?',
      text: 'Cette opération est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await api.delete(`/actions/${actionId}`);
          if (res.status > 400) throw new Error(`Erreur suppression (${res.status})`);
          setItems((prev) => prev.filter((it) => it.id !== actionId));
          await Swal.fire('Supprimée !', "L'action a été supprimée.", 'success');
        } catch (e: any) {
          await Swal.fire('Erreur', e?.message || 'Suppression impossible', 'error');
        }
      }
    });
  };

  const handlePrintAction = (actionId: string) => {
    Swal.fire({
      title: 'Impression',
      text: "La fonctionnalité d'impression sera disponible prochainement.",
      icon: 'info',
      confirmButtonText: 'OK'
    });
  };

  const handleUpload = async (actionId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(actionId);
    try {
      const formData = new FormData();
      Array.from(files).forEach((f) => formData.append('files', f));
      const res = await api.post(`/actions/${actionId}/upload`, formData);
      if (res.status !== 200) throw new Error(`Erreur upload (${res.status})`);
      const updated = res.data;
      setItems((prev) =>
        prev.map((it) =>
          it.id === actionId
            ? {
                ...it,
                pieces_jointes: updated.pieces_jointes || it.pieces_jointes,
                dateModification: updated.dateModification || new Date().toISOString()
              }
            : it
        )
      );
      await Swal.fire('Fichiers ajoutés', 'Les pièces jointes ont été ajoutées.', 'success');
    } catch (e: any) {
      await Swal.fire('Erreur', e?.message || "Envoi des fichiers impossible", 'error');
    } finally {
      setUploading(null);
    }
  };

  const handleDeleteAttachment = async (actionId: string, fileName: string) => {
    await Swal.fire({
      title: 'Supprimer cette pièce jointe ?',
      text: fileName,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await api.delete(`/actions/${actionId}/attachments/${encodeURIComponent(fileName)}`);
          if (res.status !== 204) throw new Error(`Erreur suppression pièce jointe (${res.status})`);
          setItems((prev) =>
            prev.map((it) =>
              it.id === actionId
                ? {
                    ...it,
                    pieces_jointes: it.pieces_jointes.filter((f) => f !== fileName),
                    dateModification: new Date().toISOString()
                  }
                : it
            )
          );
          await Swal.fire('Supprimée !', 'La pièce jointe a été supprimée.', 'success');
        } catch (e: any) {
          await Swal.fire('Erreur', e?.message || 'Suppression impossible', 'error');
        }
      }
    });
  };

  const handleViewAttachment = (actionId: string, fileName: string) => {
    const fileUrl = resolveAttachmentUrl(fileName, actionId);
    if (isImageFile(fileName)) {
      setPreview({ open: true, kind: 'image', url: fileUrl, fileUrl, title: fileName });
      return;
    }
    if (isPdfFile(fileName)) {
      // Essayer l'aperçu dans un iframe; si le serveur force le téléchargement (Content-Disposition), le navigateur téléchargera
      setPreview({ open: true, kind: 'pdf', url: fileUrl, fileUrl, title: fileName });
      return;
    }
    if (isOfficeFile(fileName)) {
      if (canUseOfficeViewer()) {
        const viewerUrl = buildOfficeViewerUrl(fileUrl);
        setPreview({ open: true, kind: 'office', url: viewerUrl, fileUrl, title: fileName });
      } else {
        // En local, l'Office Viewer ne peut pas accéder à localhost -> ouverture dans un nouvel onglet
        if (typeof window !== 'undefined') window.open(fileUrl, '_blank', 'noopener');
      }
      return;
    }
    // Non prévisualisable -> téléchargement/ouverte par le navigateur
    if (typeof window !== 'undefined') window.open(fileUrl, '_blank', 'noopener');
  };

  return (
    <>
    <MainCard sx={{ p: 0 }} content={false}>
      <Box sx={{ p: 3, pb: 0 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h5">Actions de l&apos;incident</Typography>
          <Stack direction="row" spacing={1}>
            <Chip label={`${items.length} action${items.length > 1 ? 's' : ''}`} size="small" color="primary" variant="light" />
            <Button variant="contained" size="small" startIcon={<DocumentUpload />} onClick={handleOpenCreate}>
              Nouvelle action
            </Button>
          </Stack>
        </Stack>
      </Box>

      <SimpleBar sx={{ height: 640, my: 3 }}>
        <Box sx={{ px: 3 }}>
          {loading ? (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 8 }}>
              Chargement des actions...
            </Typography>
          ) : error ? (
            <Typography color="error" sx={{ textAlign: 'center', py: 8 }}>
              {error}
            </Typography>
          ) : empty ? (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 8 }}>
              Aucune action renseignée pour cet incident.
            </Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableBody>
                  {items.map((action) => (
                    <Box key={action.id}>
                      <TableRow
                        sx={{
                          mb: 1,
                          display: 'block',
                          position: 'relative',
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                          '& .MuiTableCell-root': { border: 'none' },
                          cursor: 'pointer',
                          transition: 'background-color 0.2s ease-in-out',
                          '&:hover': {
                            backgroundColor: 'action.hover',
                            '& .hover-actions': { opacity: 1, transform: 'translateY(-50%)' }
                          },
                          ...(expandedId === action.id && { backgroundColor: 'action.selected' })
                        }}
                      >
                        <TableCell sx={{ width: 'auto' }}>
                          <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
                            <Checkbox size="small" />
                            <Checkbox
                              checked={!!action.isStarred}
                              onChange={() => toggleStar(action.id)}
                              sx={{ '& svg': { width: 18, height: 18 } }}
                              icon={<Star1 color={theme.palette.warning.main} />}
                              checkedIcon={<Star1 variant="Bold" color={theme.palette.warning.main} />}
                            />
                            <IconButton
                              size="small"
                              color="secondary"
                              onClick={() => handleToggle(action.id)}
                              sx={{
                                transform: expandedId === action.id ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.3s'
                              }}
                            >
                              <ArrowDown2 size={16} />
                            </IconButton>
                          </Stack>
                        </TableCell>

                        <TableCell onClick={() => handleToggle(action.id)}>
                          <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
                            <Avatar size="md" color="primary" variant="rounded">
                              <ShieldTick size={20} />
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" noWrap>
                                {action.equipe}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(action.dateAction).toLocaleDateString('fr-FR', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>

                        <TableCell sx={{ width: 1 }} onClick={() => handleToggle(action.id)}>
                          <Stack direction="row" sx={{ width: { xs: 220, md: 350, lg: 480, xl: 600 }, gap: 1, alignItems: 'center' }}>
                            <Typography noWrap sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {action.titre}
                            </Typography>
                            {action.pieces_jointes.length > 0 && (
                              <Chip
                                label={`${action.pieces_jointes.length} fichier${action.pieces_jointes.length > 1 ? 's' : ''}`}
                                variant="light"
                                color="warning"
                                size="small"
                              />
                            )}
                          </Stack>
                        </TableCell>

                        <TableCell>
                          {action.pieces_jointes.length > 0 && (
                            <IconButton color="secondary" size="small">
                              <AttachSquare size={18} />
                            </IconButton>
                          )}
                        </TableCell>

                        <TableCell align="right">
                          {/* Hover Actions */}
                          <Stack
                            direction="row"
                            className="hover-actions"
                            sx={{
                              position: 'absolute',
                              right: 16,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              opacity: 0,
                              gap: 0.5,
                              bgcolor: 'background.paper',
                              p: 0.75,
                              borderRadius: 1,
                              boxShadow: `0px 8px 24px rgba(126, 126, 126, 0.5)`
                            }}
                          >
                            <IconButton
                              color="success"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleValidateAction(action.id);
                              }}
                              title="Valider l'action"
                            >
                              <TickCircle size={18} />
                            </IconButton>
                            <IconButton
                              color="secondary"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditAction(action.id);
                              }}
                              title="Modifier"
                            >
                              <Edit size={18} />
                            </IconButton>
                            <IconButton
                              color="secondary"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePrintAction(action.id);
                              }}
                              title="Imprimer"
                            >
                              <Printer size={18} />
                            </IconButton>
                            <IconButton
                              color="error"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteAction(action.id);
                              }}
                              title="Supprimer"
                            >
                              <Trash size={18} />
                            </IconButton>
                          </Stack>
                          <Typography noWrap variant="body2" color="text.secondary">
                            {new Date(action.dateModification).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Typography>
                        </TableCell>
                      </TableRow>

                      {/* Detail Section */}
                      <Collapse in={expandedId === action.id} timeout="auto" unmountOnExit>
                        <Box sx={{ px: 3, py: 2, bgcolor: 'background.paper', borderRadius: 1, mb: 1 }}>
                          <Stack sx={{ gap: 2 }}>
                            {/* Info générale */}
                            <Box>
                              <Typography variant="subtitle2" sx={{ mb: 1, color: 'primary.main' }}>
                                📋 Informations
                              </Typography>
                              <Stack spacing={1}>
                                <Stack direction="row" spacing={1}>
                                  <Typography variant="body2" fontWeight={600}>
                                    Équipe :
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {action.equipe}
                                  </Typography>
                                </Stack>
                                <Stack direction="row" spacing={1}>
                                  <Typography variant="body2" fontWeight={600}>
                                    Date création :
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {new Date(action.dateAction).toLocaleString('fr-FR')}
                                  </Typography>
                                </Stack>
                                <Stack direction="row" spacing={1}>
                                  <Typography variant="body2" fontWeight={600}>
                                    Dernière modification :
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {new Date(action.dateModification).toLocaleString('fr-FR')}
                                  </Typography>
                                </Stack>
                              </Stack>
                            </Box>

                            <Divider sx={{ opacity: 0.5 }} />

                            {/* Description */}
                            <Box>
                              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                Description
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {action.description || '—'}
                              </Typography>
                            </Box>

                            <Divider sx={{ opacity: 0.5 }} />

                            {/* Pièces jointes */}
                            <Box>
                              <Stack direction="row" sx={{ gap: 1, alignItems: 'center', mb: 1 }}>
                                <AttachSquare size={20} />
                                <Typography variant="subtitle2">{action.pieces_jointes.length} Pièce(s) jointe(s)</Typography>
                              </Stack>

                              {action.pieces_jointes.length > 0 && (
                                <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 1, mb: 2, flexWrap: 'wrap' }}>
                                  {action.pieces_jointes.map((fileName, i) => (
                                    <MainCard
                                      key={`${action.id}-${fileName}-${i}`}
                                      sx={{ bgcolor: 'background.default', p: 1.5, minWidth: 200 }}
                                      content={false}
                                    >
                                      <Stack direction="row" sx={{ gap: 1, alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Typography variant="subtitle2" noWrap sx={{ flex: 1 }}>
                                          📎 {fileName}
                                        </Typography>
                                        <Stack direction="row" spacing={0.5}>
                                          {(isImageFile(fileName) || isOfficeFile(fileName) || isPdfFile(fileName)) && (
                                            <IconButton
                                              color="secondary"
                                              size="small"
                                              onClick={() => handleViewAttachment(action.id, fileName)}
                                              title="Voir"
                                            >
                                              <Eye size={18} />
                                            </IconButton>
                                          )}
                                          <a
                                            href={resolveAttachmentUrl(fileName, action.id)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title="Télécharger"
                                            style={{ display: 'inline-flex' }}
                                          >
                                            <IconButton color="secondary" size="small">
                                              <DocumentDownload size={18} />
                                            </IconButton>
                                          </a>
                                          <IconButton
                                            color="error"
                                            size="small"
                                            onClick={() => handleDeleteAttachment(action.id, fileName)}
                                            title="Supprimer"
                                          >
                                            <Trash size={16} />
                                          </IconButton>
                                        </Stack>
                                      </Stack>
                                    </MainCard>
                                  ))}
                                </Stack>
                              )}

                              {/* Upload Button */}
                              <Stack direction="row" sx={{ gap: 1 }}>
                                <input
                                  type="file"
                                  id={`upload-${action.id}`}
                                  multiple
                                  style={{ display: 'none' }}
                                  onChange={(e) => handleUpload(action.id, e.target.files)}
                                />
                                <label htmlFor={`upload-${action.id}`}>
                                  <Button
                                    variant="outlined"
                                    component="span"
                                    disabled={uploading === action.id}
                                    startIcon={<DocumentUpload />}
                                    size="small"
                                  >
                                    {uploading === action.id ? 'Envoi...' : 'Ajouter des fichiers'}
                                  </Button>
                                </label>
                              </Stack>
                            </Box>
                          </Stack>
                        </Box>
                      </Collapse>
                    </Box>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </SimpleBar>
  </MainCard>
  {/* Preview Dialog */}
    <Dialog open={preview.open} onClose={() => setPreview((p) => ({ ...p, open: false }))} fullWidth maxWidth="lg">
      <DialogTitle>Aperçu — {preview.title}</DialogTitle>
      <DialogContent dividers sx={{ p: 0 }}>
        {preview.kind === 'image' && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview.url} alt={preview.title} style={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain' }} />
          </Box>
        )}
        {preview.kind === 'pdf' && (
          <Box sx={{ width: '100%', height: '75vh' }}>
            <iframe
              title={preview.title}
              src={preview.url}
              style={{ border: 0, width: '100%', height: '100%' }}
            />
          </Box>
        )}
        {preview.kind === 'office' && (
          <Box sx={{ width: '100%', height: '75vh' }}>
            <iframe
              title={preview.title}
              src={preview.url}
              style={{ border: 0, width: '100%', height: '100%' }}
              allowFullScreen
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setPreview((p) => ({ ...p, open: false }))} color="inherit">
          Fermer
        </Button>
        {preview.fileUrl && (
          <Button
            variant="contained"
            color="primary"
            component="a"
            href={preview.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<DocumentDownload />}
          >
            Télécharger
          </Button>
        )}
      </DialogActions>
    </Dialog>
  {/* Create Action Dialog */}
    <Dialog open={openCreate} onClose={handleCloseCreate} fullWidth maxWidth="sm">
      <DialogTitle>Nouvelle action</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 0.5 }}>
          {createError && <Alert severity="error">{createError}</Alert>}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <TextField
              label="Titre"
              value={createForm.titre}
              onChange={(e) => setCreateForm((p) => ({ ...p, titre: e.target.value }))}
              fullWidth
              placeholder="Ex: Inspection, Sécurisation..."
            />
            <TextField
              label="Équipe responsable"
              value={createForm.equipe}
              onChange={(e) => setCreateForm((p) => ({ ...p, equipe: e.target.value }))}
              fullWidth
              placeholder="Ex: Équipe Sûreté A"
            />
            <FormControl fullWidth>
              <InputLabel id="entite-label">Entité</InputLabel>
              <Select
                labelId="entite-label"
                label="Entité"
                value={createForm.entiteId}
                onChange={(e) => setCreateForm((p) => ({ ...p, entiteId: String(e.target.value) }))}
                disabled={entitesLoading}
              >
                <MenuItem value="">
                  <em>Choisir une entité</em>
                </MenuItem>
                {entitesLoading ? (
                  <MenuItem disabled>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <CircularProgress size={16} />
                      <span>Chargement...</span>
                    </Stack>
                  </MenuItem>
                ) : entitesError ? (
                  <MenuItem disabled>Erreur de chargement</MenuItem>
                ) : (
                  entites.map((e) => (
                    <MenuItem key={e.id} value={e.id}>
                      {e.nom}
                    </MenuItem>
                  ))
                )}
              </Select>
              <FormHelperText>Sélectionnez l&apos;entité concernée</FormHelperText>
            </FormControl>
            <Box />
          </Box>
          <TextField
            label="Description"
            value={createForm.description}
            onChange={(e) => setCreateForm((p) => ({ ...p, description: e.target.value }))}
            fullWidth
            multiline
            rows={4}
            placeholder="Décrivez l'action"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseCreate} disabled={createSubmitting} color="inherit">
          Annuler
        </Button>
        <Button onClick={handleSubmitCreate} variant="contained" disabled={createSubmitting} startIcon={createSubmitting ? <CircularProgress size={18} color="inherit" /> : null}>
          Créer
        </Button>
      </DialogActions>
    </Dialog>
    </>
  );
}
