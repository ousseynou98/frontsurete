import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

type Props = {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  maxWidth?: false | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
};

const SimpleModal: React.FC<Props> = ({ open, onClose, title, actions, maxWidth = 'sm', children }) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth={maxWidth}>
      {title && <DialogTitle>{title}</DialogTitle>}
      <DialogContent dividers>
        {children ?? <Typography variant="body1">Aucun contenu</Typography>}
      </DialogContent>
      <DialogActions>
        {actions ?? <Button onClick={onClose}>Fermer</Button>}
      </DialogActions>
    </Dialog>
  );
};

export default SimpleModal;
