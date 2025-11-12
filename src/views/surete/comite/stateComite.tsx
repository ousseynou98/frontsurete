import MainCard from "components/MainCard";
import { SyntheticEvent } from "react";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { useState, useEffect, ChangeEvent } from "react";
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';

import { CloseCircle, DocumentUpload, Document, Trash, DocumentDownload, Eye, Check, TickCircle } from "@wandersonalwes/iconsax-react";
import { AnalyseService } from "services/plan-surete/analyse.service";
import { DocService } from "services/plan-surete/doc.service";
import { Comite } from "types/comite";
import InspectionComite from "./inspectionComite";
import axios from "services/axios.config";
import comiteService from "services/comite/comiteService";
import { ComiteService } from "services/plan-surete/comite.service";

const analyseService = new AnalyseService();
const docService = new DocService();
const comiteService = new ComiteService();

export function PsOnglets({ comite }: { comite?: Comite}) {
    const [open, setOpen] = useState(false);
    const [draftComment, setDraftComment] = useState("");
    const [draftFiles, setDraftFiles] = useState<File[]>([]);
    const [draftPreviews, setDraftPreviews] = useState<Record<string, string>>({});
    const [savedComment, setSavedComment] = useState<string | null>(null);
    const [savedFiles, setSavedFiles] = useState<File[]>([]);
    const analyse = comite?.analyses?.[0] ?? null;
    const [savedPreviews, setSavedPreviews] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);

    const handleDownloadFile = async (docId: string, fileName: string) => {
        try {
            const response = await axios.get(`http://localhost:8080/docs/download/${docId}`, {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Erreur lors du téléchargement:', error);
            alert('Erreur lors du téléchargement du fichier');
        }
    };

    const handleDeleteFile = async (docId: string) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
            return;
        }

        try {
            await docService.deleteDoc(docId);
            alert('Document supprimé avec succès');
            // Recharger la page pour afficher les changements
            window.location.reload();
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            alert('Erreur lors de la suppression du document');
        }
    };

    const handleOpenFile = (file: File) => {
        const url = URL.createObjectURL(file);
        window.open(url, '_blank');
        // Libérer l'URL après un court délai
        setTimeout(() => URL.revokeObjectURL(url), 100);
    };

    const handleDownloadLocalFile = (file: File) => {
        const url = URL.createObjectURL(file);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', file.name);
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    };

    useEffect(() => {
        const prevs: Record<string, string> = {};
        draftFiles.forEach((f) => {
            if (f.type.startsWith("image/")) prevs[f.name] = URL.createObjectURL(f);
        });
        Object.values(draftPreviews).forEach((u) => URL.revokeObjectURL(u));
        setDraftPreviews(prevs);
        return () => {
            Object.values(prevs).forEach((u) => URL.revokeObjectURL(u));
        };
    }, [draftFiles]);

    useEffect(() => {
        const prevs: Record<string, string> = {};
        savedFiles.forEach((f) => {
            if (f.type.startsWith("image/")) prevs[f.name] = URL.createObjectURL(f);
        });
        Object.values(savedPreviews).forEach((u) => URL.revokeObjectURL(u));
        setSavedPreviews(prevs);
        return () => {
            Object.values(prevs).forEach((u) => URL.revokeObjectURL(u));
        };
    }, [savedFiles]);

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
    };

    const handleFilesChange = (e: ChangeEvent<HTMLInputElement>) => {
        const list = e.target.files;
        if (!list) return;
        const arr = Array.from(list);
        const combined = [...draftFiles];
        arr.forEach((f) => {
            if (!combined.some((c) => c.name === f.name && c.size === f.size)) combined.push(f);
        });
        setDraftFiles(combined);
        e.currentTarget.value = "";
    };

    const removeDraftFile = (index: number) => {
        setDraftFiles((s) => s.filter((_, i) => i !== index));
    };

    const removeSavedFile = (index: number) => {
        setSavedFiles((s) => s.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (saving) return;
        setSaving(true);

        try {
            
            const payload = {
                description: draftComment?.trim() || null,
                titre: "Plan de sûreté",
                comiteId: comite?.id || ""

            };
            const createdAnalyse = await analyseService.createAnalyse?.(payload);

            const analysisId = createdAnalyse?.id;
            if (!analysisId) {
                throw new Error("Aucun id d'analyse retourné par le service.");
            }

            // 2) upload files to docService linked to the created analysis id
            if (draftFiles.length > 0) {
                await docService.uploadFiles(draftFiles, analysisId);
            }

            // 3) mettre à jour l'UI locale (saved state)
            setSavedComment(draftComment.trim() || null);
            setSavedFiles(draftFiles);
            setDraftFiles([]);
            setDraftComment("");
            setOpen(false);
        } catch (err) {
            // Log / handle error — adaptez à votre stratégie d'erreur (toast, snackbar...)
            // eslint-disable-next-line no-console
            console.error("Erreur lors de l'enregistrement du plan de sûreté :", err);
            // Optionnel: afficher un message d'erreur utilisateur
            // alert("Erreur lors de l'enregistrement du plan de sûreté");
        } finally {
            setSaving(false);
        }
    };

    const formatSize = (n: number) => {
        if (n < 1024) return `${n} B`;
        if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
        return `${(n / (1024 * 1024)).toFixed(2)} MB`;
    };

    return (
        <Box>
            <Stack direction="row" spacing={2} sx={{ alignItems: "center", mb: 2, mt: 2, mx: 2, justifyContent: "flex-end" }}>
                <Button
                    variant="contained"
                    startIcon={<DocumentUpload />}
                    onClick={handleOpen}
                    sx={{ textTransform: "none" }}
                >
                    Ajouter le plan de sûreté
                </Button>
            </Stack>

            {(savedComment || savedFiles.length > 0 || analyse) && (
                <Paper
                    elevation={0}
                    sx={{
                        borderRadius: 2,
                        p: 2,
                        mb: 2,
                        bgcolor: "background.paper",
                    }}
                >
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                        <Typography variant="subtitle1">RSO</Typography>
                        <IconButton size="small" aria-label="supprimer-fichier">
                            {/* reserved for future actions */}
                        </IconButton>
                    </Stack>
                    <Divider sx={{ mb: 1 }} />

                    {/* Affiche les infos de l'analyse si existante */}
                    {analyse && (
                        <Box sx={{ mb: 1 }}>
                            <Typography variant="body1" sx={{ mt: 0.5 }}>
                                {analyse?.titre ?? "Analyse sans titre"}
                            </Typography>
                            {analyse?.description && (
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                    {analyse.description}
                                </Typography>
                            )}
                        </Box>
                    )}
                    {savedComment && (
                        <Box sx={{ mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                Commentaire
                            </Typography>
                            <Typography variant="body1" sx={{ mt: 0.5 }}>
                                {savedComment}
                            </Typography>
                        </Box>
                    )}

                    {/* Docs attachés à l'analyse (si fournis dans l'objet analyse) */}
                    {(() => {
                        const analyseDocs: any[] = analyse?.docs ?? [];
                        if (analyseDocs.length === 0) return null;
                        return (
                            <Box sx={{ mb: 1 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    Documents attachés
                                </Typography>
                                <List dense>
                                    {analyseDocs.map((d: any, i: number) => (
                                        <ListItem
                                            key={d.id ?? `${d.name ?? 'doc'}-${i}`}
                                            secondaryAction={
                                                d.id ? (
                                                    <Stack direction="row" spacing={1}>
                                                        <IconButton
                                                            onClick={() => window.open(`http://localhost:8080/docs/download/${d.id}`, '_blank')}
                                                            aria-label="ouvrir"
                                                            color="info"
                                                            size="small"
                                                        >
                                                            <Eye />
                                                        </IconButton>
                                                        <IconButton
                                                            onClick={() => handleDownloadFile(d.id, d.name ?? 'document')}
                                                            aria-label="télécharger"
                                                            color="primary"
                                                            size="small"
                                                        >
                                                            <DocumentDownload />
                                                        </IconButton>
                                                        <IconButton
                                                            onClick={() => handleDeleteFile(d.id)}
                                                            aria-label="supprimer"
                                                            color="error"
                                                            size="small"
                                                        >
                                                            <Trash />
                                                        </IconButton>
                                                    </Stack>
                                                ) : null
                                            }
                                        >
                                            <ListItemAvatar>
                                                <Avatar
                                                    variant="rounded"
                                                    sx={{ bgcolor: "primary.light", width: 48, height: 48 }}
                                                >
                                                    {(
                                                        d.url ||
                                                        d.path ||
                                                        d.previewUrl
                                                    ) ? (
                                                        <img
                                                            src={d.url ?? d.path ?? d.previewUrl}
                                                            alt={d.name ?? `doc-${i}`}
                                                            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 6 }}
                                                        />
                                                    ) : (
                                                        <Document />
                                                    )}
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={d.name ?? "Document"}
                                                secondary={`${d.size ? formatSize(Number(d.size)) + " • " : ""}${d.mimeType ?? d.type ?? "fichier"}`}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </Box>
                        );
                    })()}

                    {savedFiles.length > 0 && (
                        <List dense>
                            {savedFiles.map((f, i) => (
                                <ListItem
                                    key={`${f.name}-${f.size}-${i}`}
                                    secondaryAction={
                                        <Stack direction="row" spacing={1}>
                                            <IconButton 
                                                onClick={() => handleOpenFile(f)} 
                                                aria-label="ouvrir"
                                                color="info"
                                                size="small"
                                            >
                                                <Eye />
                                            </IconButton>
                                            <IconButton 
                                                onClick={() => handleDownloadLocalFile(f)} 
                                                aria-label="télécharger"
                                                color="primary"
                                                size="small"
                                            >
                                                <DocumentDownload />
                                            </IconButton>
                                            <IconButton 
                                                onClick={() => removeSavedFile(i)} 
                                                aria-label="supprimer"
                                                color="error"
                                                size="small"
                                            >
                                                <Trash />
                                            </IconButton>
                                        </Stack>
                                    }
                                >
                                    <ListItemAvatar>
                                        <Avatar
                                            variant="rounded"
                                            sx={{ bgcolor: "primary.light", width: 48, height: 48 }}
                                        >
                                            {savedPreviews[f.name] ? (
                                                <img
                                                    src={savedPreviews[f.name]}
                                                    alt={f.name}
                                                    style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 6 }}
                                                />
                                            ) : (
                                                <Document />
                                            )}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={f.name}
                                        secondary={`${formatSize(f.size)} • ${f.type || "fichier"}`}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Paper>
            )}

            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
                <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    Ajouter le plan de sûreté
                    <IconButton size="small" onClick={handleClose}>
                        <CloseCircle />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={2}>
                        <TextField
                            label="Commentaire"
                            multiline
                            minRows={3}
                            value={draftComment}
                            onChange={(e) => setDraftComment(e.target.value)}
                            fullWidth
                        />

                        <Box>
                            <input
                                id="ps-file-input"
                                type="file"
                                multiple
                                onChange={handleFilesChange}
                                style={{ display: "none" }}
                            />
                            <label htmlFor="ps-file-input">
                                <Button variant="outlined" component="span" startIcon={<DocumentUpload />}>
                                    Choisir des fichiers
                                </Button>
                            </label>
                        </Box>

                        {draftFiles.length > 0 && (
                            <Paper variant="outlined" sx={{ p: 1 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    Fichiers sélectionnés
                                </Typography>
                                <List dense>
                                    {draftFiles.map((f, i) => (
                                        <ListItem
                                            key={`${f.name}-${f.size}-${i}`}
                                            secondaryAction={
                                                <IconButton edge="end" onClick={() => removeDraftFile(i)} aria-label="remove">
                                                    <Trash />
                                                </IconButton>
                                            }
                                        >
                                            <ListItemAvatar>
                                                <Avatar variant="rounded" sx={{ bgcolor: "grey.100", width: 40, height: 40 }}>
                                                    {draftPreviews[f.name] ? (
                                                        <img
                                                            src={draftPreviews[f.name]}
                                                            alt={f.name}
                                                            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 6 }}
                                                        />
                                                    ) : (
                                                        <Document />
                                                    )}
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText primary={f.name} secondary={formatSize(f.size)} />
                                        </ListItem>
                                    ))}
                                </List>
                            </Paper>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} disabled={saving}>Annuler</Button>
                    <Button variant="contained" onClick={handleSubmit} disabled={saving || (draftFiles.length === 0 && !draftComment)}>
                        {saving ? "Enregistrement..." : "Sauvegarder"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

//Créer un composant pour l'onglet Comité de pilotage avec deux buttons Validé ou rejeté le comité

function ComitePilotage({ comite }: { comite?: Comite }) {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<string | null>(comite?.status ?? null);

    const updateStatus = async (newStatus: string) => {
        if (!comite?.id) {
            alert("Comité introuvable");
            return;
        }
        if (status === newStatus) return;
        if (!window.confirm(`Confirmer passage au statut "${newStatus}" ?`)) return;

        setLoading(true);
        try {
            await comiteService.updateComiteStatus(comite.id, { status: newStatus });
            setStatus(newStatus);
            alert("Statut mis à jour");
        } catch (err) {
            console.error("Erreur mise à jour statut comite:", err);
            alert("Erreur lors de la mise à jour du statut");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h6">Comité de pilotage</Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
                Valider ou rejeter le plan de sûreté soumis par le RSO.
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Statut actuel: {status ?? "Non défini"}
            </Typography>

            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                <Button
                    variant="contained"
                    color="success"
                    startIcon={<TickCircle />}
                    sx={{ textTransform: "none" }}
                    onClick={() => updateStatus("VALIDATION ANAM")}
                    disabled={comite?.status === "VALIDATION ANAM"}
                >
                    {loading && status !== "REJETE" ? "Traitement..." : "Valider le plan de sûreté"}
                </Button>
                <Button
                    variant="outlined"
                    color="error"
                    startIcon={<CloseCircle />}
                    sx={{ textTransform: "none" }}
                    onClick={() => updateStatus("REJETÉ")}
                    disabled={comite?.status === "REJETÉ"}
                >
                    {loading && status !== "VALIDATION ANAM" ? "Traitement..." : "Rejeter le plan de sûreté"}
                </Button>
            </Stack>
        </Box>
    );
}
function Dg({ comite }: { comite?: Comite }) {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<string | null>(comite?.status ?? null);

    const updateStatus = async (newStatus: string) => {
        if (!comite?.id) {
            alert("Comité introuvable");
            return;
        }
        if (status === newStatus) return;
        if (!window.confirm(`Confirmer passage au statut "${newStatus}" ?`)) return;

        setLoading(true);
        try {
            await comiteService.updateComiteStatus(comite.id, { status: newStatus });
            setStatus(newStatus);
            alert("Statut mis à jour");
        } catch (err) {
            console.error("Erreur mise à jour statut comite:", err);
            alert("Erreur lors de la mise à jour du statut");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h6">Comité de pilotage</Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
                Valider la version finale du plan de sûreté soumis par le RSO et clôture du comité de sûreté.
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Statut actuel: {status ?? "Non défini"}
            </Typography>

            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                <Button
                    variant="contained"
                    color="success"
                    startIcon={<TickCircle />}
                    sx={{ textTransform: "none" }}
                    onClick={() => updateStatus("VALIDATION ANAM")}
                    disabled={comite?.status === "VALIDATION ANAM"}
                >
                    {loading && status !== "REJETE" ? "Traitement..." : "Valider le plan de sûreté"}
                </Button>
                <Button
                    variant="outlined"
                    color="error"
                    startIcon={<CloseCircle />}
                    sx={{ textTransform: "none" }}
                    onClick={() => updateStatus("REJETÉ")}
                    disabled={comite?.status === "REJETÉ"}
                >
                    {loading && status !== "VALIDATION ANAM" ? "Traitement..." : "Rejeter le plan de sûreté"}
                </Button>
            </Stack>
        </Box>
    );
}
export default function StateComite({ comite }: { comite?: Comite }) {
    const [value, setValue] = useState<number>(0);

    const handleChange = (event: SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <MainCard content={false}>
            <Box sx={{ width: '100%' }}>
            {/* Tabs seulement, contenu supprimé. variant="scrollable" permet de défiler entre les onglets */}
            {(() => {
            const tabLabels = [
                "PLAN DE SÛRETÉ",
                "COMITÉ DE PILOTAGE",
                "INSPECTION",
                "DG",
            ];

            // Couleurs par onglet — adaptez les hex ou noms de couleur
            const colors = ['#1976d2', '#9c27b0', '#ff9800', '#2e7d32'];

            return (
            <>
                <Tabs
                value={value}
                onChange={handleChange}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
                aria-label="navigation tabs"
                // l'indicateur (barre sous l'onglet) prend la couleur du tab actif
                TabIndicatorProps={{ style: { backgroundColor: colors[value] } }}
                sx={{ px: 3, pt: 1, '& .MuiTab-root': { mb: 0.5 } }}
                >
                {tabLabels.map((label, i) => (
                <Tab
                    key={label}
                    label={label}
                    // couleur du texte quand l'onglet est sélectionné
                    sx={{
                    '&.Mui-selected': { color: colors[i] },
                    // optionnel : couleur par défaut des onglets non sélectionnés
                    color: 'text.secondary'
                    }}
                />
                ))}
                </Tabs>

                {(() => {
                    switch (tabLabels[value]) {
                        case "PLAN DE SÛRETÉ":
                            return <PsOnglets comite={comite} />;
                        case "INSPECTION":
                            return <InspectionComite comite={comite} />;

                        case "COMITÉ DE PILOTAGE":
                            return <ComitePilotage comite={comite} />;
                        default:
                            return (
                                <Box sx={{ p: 3 }}>
                                    Vous êtes sur l&apos;onglet : <strong>{tabLabels[value] ?? &quot;&quot;}</strong>
                                </Box>
                            );
                    }
                })()}
            </>
            );
            })()}
            </Box>
        </MainCard>
    );
}
