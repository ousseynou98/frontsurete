'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  Container,
  Stack,
  Typography,
  CircularProgress,
  Chip,
  Grid,
  Divider,
  Alert
} from '@mui/material';
import { TickCircle, CloseCircle, InfoCircle } from 'iconsax-react';

interface VerificationResult {
  valide: boolean;
  message: string;
  warning?: string;
  details?: string;
  statut?: string;
  diplome?: {
    numeroDiplome: string;
    titulaire: {
      nom: string;
      prenom: string;
      dateNaissance: string;
      lieuNaissance: string;
    };
    formation: {
      type: string;
      dateDebut: string;
      dateFin: string;
      lieu: string;
    };
    resultat: {
      note: number;
      statut: string;
      appreciation?: string;
    };
    validation: {
      dateValidation: string;
      validePar: string;
      autorite: string;
    };
  };
}

export default function VerificationDiplomePage() {
  const params = useParams();
  const numeroDiplome = params.numeroDiplome as string;
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<VerificationResult | null>(null);

  useEffect(() => {
    if (numeroDiplome) {
      verifierDiplome();
    }
  }, [numeroDiplome]);

  const verifierDiplome = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080/formations/verification/${numeroDiplome}`);
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Erreur lors de la vérification:', error);
      setResult({
        valide: false,
        message: 'Erreur lors de la vérification',
        warning: 'Impossible de contacter le serveur. Veuillez réessayer plus tard.'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default'
        }}
      >
        <Stack spacing={2} alignItems="center">
          <CircularProgress size={60} />
          <Typography variant="h6" color="text.secondary">
            Vérification du diplôme en cours...
          </Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        py: 6
      }}
    >
      <Container maxWidth="md">
        <Stack spacing={4}>
          {/* Header */}
          <Box textAlign="center">
            <img 
              src="/assets/images/auth/anam.png" 
              alt="Logo ANAM" 
              style={{ height: 80, marginBottom: 16 }}
            />
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Vérification de Diplôme ISPS
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Agence Nationale de l'Aviation Civile et de la Météorologie
            </Typography>
          </Box>

          {/* Numéro du diplôme */}
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Numéro du diplôme vérifié
              </Typography>
              <Typography variant="h6" fontFamily="monospace" color="primary">
                {numeroDiplome}
              </Typography>
            </CardContent>
          </Card>

          {/* Résultat de la vérification */}
          {result && (
            <>
              {/* Statut */}
              <Card
                sx={{
                  bgcolor: result.valide ? 'success.lighter' : 'error.lighter',
                  border: 2,
                  borderColor: result.valide ? 'success.main' : 'error.main'
                }}
              >
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    {result.valide ? (
                      <TickCircle size={48} variant="Bold" color="#2e7d32" />
                    ) : (
                      <CloseCircle size={48} variant="Bold" color="#d32f2f" />
                    )}
                    <Box>
                      <Typography variant="h5" fontWeight="bold" color={result.valide ? 'success.dark' : 'error.dark'}>
                        {result.message}
                      </Typography>
                      {result.warning && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {result.warning}
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              {/* Détails du diplôme si valide */}
              {result.valide && result.diplome && (
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      📋 Informations du Titulaire
                    </Typography>
                    <Divider sx={{ my: 2 }} />

                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Nom et Prénom
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {result.diplome.titulaire.prenom} {result.diplome.titulaire.nom}
                        </Typography>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Date de naissance
                        </Typography>
                        <Typography variant="body1">
                          {new Date(result.diplome.titulaire.dateNaissance).toLocaleDateString('fr-FR')}
                        </Typography>
                      </Grid>

                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Lieu de naissance
                        </Typography>
                        <Typography variant="body1">
                          {result.diplome.titulaire.lieuNaissance}
                        </Typography>
                      </Grid>
                    </Grid>

                    <Divider sx={{ my: 3 }} />

                    <Typography variant="h6" gutterBottom>
                      🎓 Formation
                    </Typography>

                    <Grid container spacing={3} sx={{ mt: 1 }}>
                      <Grid item xs={12}>
                        <Chip 
                          label={result.diplome.formation.type} 
                          color="primary" 
                          sx={{ fontWeight: 'bold' }}
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Période
                        </Typography>
                        <Typography variant="body1">
                          Du {new Date(result.diplome.formation.dateDebut).toLocaleDateString('fr-FR')}
                          {' au '}
                          {new Date(result.diplome.formation.dateFin).toLocaleDateString('fr-FR')}
                        </Typography>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Lieu
                        </Typography>
                        <Typography variant="body1">
                          {result.diplome.formation.lieu}
                        </Typography>
                      </Grid>
                    </Grid>

                    <Divider sx={{ my: 3 }} />

                    <Typography variant="h6" gutterBottom>
                      ⭐ Résultat
                    </Typography>

                    <Grid container spacing={3} sx={{ mt: 1 }}>
                      <Grid item xs={12} md={4}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Note obtenue
                        </Typography>
                        <Typography variant="h4" color="success.main" fontWeight="bold">
                          {result.diplome.resultat.note}/20
                        </Typography>
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Statut
                        </Typography>
                        <Chip 
                          label={result.diplome.resultat.statut} 
                          color="success" 
                          sx={{ mt: 1 }}
                        />
                      </Grid>

                      {result.diplome.resultat.appreciation && (
                        <Grid item xs={12} md={4}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Appréciation
                          </Typography>
                          <Typography variant="body1" fontStyle="italic">
                            "{result.diplome.resultat.appreciation}"
                          </Typography>
                        </Grid>
                      )}
                    </Grid>

                    <Divider sx={{ my: 3 }} />

                    <Typography variant="h6" gutterBottom>
                      ✅ Validation
                    </Typography>

                    <Grid container spacing={3} sx={{ mt: 1 }}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Date de validation
                        </Typography>
                        <Typography variant="body1">
                          {new Date(result.diplome.validation.dateValidation).toLocaleDateString('fr-FR')}
                        </Typography>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Validé par
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {result.diplome.validation.validePar}
                        </Typography>
                      </Grid>

                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Autorité de délivrance
                        </Typography>
                        <Typography variant="body1">
                          {result.diplome.validation.autorite}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              )}

              {/* Message d'avertissement si invalide */}
              {!result.valide && (
                <Alert severity="error" icon={<InfoCircle />}>
                  <Typography variant="body2">
                    {result.details || 'Ce diplôme n\'est pas reconnu dans notre base de données.'}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Pour toute question, veuillez contacter l'ANAM directement.
                  </Typography>
                </Alert>
              )}
            </>
          )}

          {/* Footer */}
          <Box textAlign="center" sx={{ pt: 4 }}>
            <Typography variant="caption" color="text.secondary">
              © {new Date().getFullYear()} ANAM - Tous droits réservés
            </Typography>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}

