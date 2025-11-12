'use client';

import { useMemo, useState, MouseEvent } from 'react';

// material-ui
import Chip from '@mui/material/Chip';
import ListItemButton from '@mui/material/ListItemButton';
import Menu from '@mui/material/Menu';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

// project-imports
import Avatar from 'components/@extended/Avatar';
import IconButton from 'components/@extended/IconButton';
import MoreIcon from 'components/@extended/MoreIcon';
import MainCard from 'components/MainCard';
import makeData from 'data/react-table';

// assets
import { ArrowUp, Star1, Wallet3, ArrowDown } from '@wandersonalwes/iconsax-react';


const icons = [Star1, ArrowDown, Wallet3, ArrowUp];

function StatusChip({ status }: { status?: string }) {
    switch (status) {
        case 'CLOTURÉ':
            return <Chip color="success" label="CLOTURÉ" size="small" variant="light" sx={{ borderRadius: 1 }} />;
        case 'EN ATTENTE':
            return <Chip color="warning" label="EN ATTENTE" size="small" variant="light" sx={{ borderRadius: 1 }} />;
        case 'BLOCAGE':
            return <Chip color="error" label="BLOCAGE" size="small" variant="light" sx={{ borderRadius: 1 }} />;
        default:
            return <Chip color="warning" label="EN COURS" size="small" variant="light" sx={{ borderRadius: 1 }} />;
    }
}
const data = [
    { id: '1', name: 'Comité de pilotage 2', desc: 'Comité clôturé', status: 'CLOTURÉ' },
    { id: '2', name: 'Comité de pilotage 1', desc: 'En attente de dépot plan de surete', status: 'EN ATTENTE' },
    { id: '2', name: 'Comité de pilotage 2', desc: 'Vous devez soumettre le plan de sureté', status: 'CLOTURÉ' },
    { id: '3', name: 'Comité de pilotage 2', desc: 'Inspection n a pas été éffecutés', status: 'BLOCAGE' },
    { id: '4', name: 'Comité de pilotage 1', desc: 'Validation DG en cours', status: 'EN ATTENTE' },
];

export default function InfoComite() {

    function randomIntFromInterval(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    return (
        <MainCard content={false}>
            <Stack sx={{ gap: 3, p: 3 }}>
                <Stack direction="row" sx={{ gap: 1, alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h5">Informations</Typography>
                    <IconButton
                        color="secondary"
                        id="info-button"
                        aria-controls={open ? 'info-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? 'true' : undefined}
                        onClick={handleClick}
                    >
                        <MoreIcon />
                    </IconButton>
                    <Menu
                        id="info-menu"
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                        slotProps={{ list: { 'aria-labelledby': 'info-button', sx: { p: 1.25, minWidth: 150 } } }}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    >
                        <ListItemButton onClick={handleClose}>CLOTURÉ</ListItemButton>
                        <ListItemButton onClick={handleClose}>EN ATTENTE</ListItemButton>
                        <ListItemButton onClick={handleClose}>BLOCAGE</ListItemButton>
                    </Menu>
                </Stack>

                <Stack>
                    {data.map((row,index) => {
                        const Icons = icons[randomIntFromInterval(0, icons.length - 1)];
                        const name = (row as any).name ?? '';
                        const desc = (row as any).desc ?? '';
                        const status = (row as any).status ?? '';

                        return (
                            <Box key={row.id}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        py: 1.25
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Avatar variant="rounded" color="secondary" size="sm" sx={{ bgcolor: 'background.paper' }}>
                                            <Icons />
                                        </Avatar>
                                        <Box>
                                            <Typography variant="subtitle1">{name}</Typography>
                                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                               {desc}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box>
                                        <StatusChip status={status} />
                                    </Box>
                                </Box>

                                {index < data.length - 1 && <Divider />}
                            </Box>
                        );
                    })}
                </Stack>
            </Stack>
        </MainCard>
    );
}
