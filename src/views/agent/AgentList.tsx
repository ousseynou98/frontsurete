'use client';

import { useState, Fragment, useEffect } from 'react';

// material-ui
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// third-party
import { LabelKeyObject } from 'react-csv/lib/core';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState
} from '@tanstack/react-table';
import {
  DebouncedInput,
  HeaderSort,
  RowSelection,
  SelectColumnSorting,
  TablePagination
} from 'components/third-party/react-table';
// project-imports
import MainCard from 'components/MainCard';

// assets
import { Add, Edit, Trash, User, UserRemove } from '@wandersonalwes/iconsax-react';

// material-ui
import Stack from '@mui/system/Stack';
import { IconButton } from '@mui/material';
import AgentModal from './AgentModal';
import { AgentList } from 'types/agent';
import { AgentService } from 'services/agent/agent';
import Dot from 'components/@extended/Dot';
import Swal from 'sweetalert2';
import { swalService } from 'services/swalService';
interface Props {
  columns: ColumnDef<any>[];
  data: any[];
  modalToggler: () => void;
}

// ==============================|| REACT TABLE - LIST ||============================== //
function ReactTable({ data, columns, modalToggler }: Props) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'name', desc: false }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data,
    columns,
    state: { columnFilters, sorting, rowSelection, globalFilter },
    enableRowSelection: true,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getRowCanExpand: () => true,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    debugTable: true
  });

  const headers: LabelKeyObject[] = [];
  table.getAllColumns().map((column) => {
    const accessorKey = (column.columnDef as { accessorKey?: string }).accessorKey;
    headers.push({
      label: typeof column.columnDef.header === 'string' ? column.columnDef.header : '#',
      key: accessorKey ?? ''
    });
  });


  return (
    <MainCard content={false} sx={{ mb: 4 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{ gap: 2, p: 3, alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}
      >
        <DebouncedInput
          value={globalFilter ?? ''}
          onFilterChange={(value) => setGlobalFilter(String(value))}
          placeholder={`Rechercher un agent`}
          sx={{ width: { xs: 1, sm: 'auto' } }}
        />

        <Stack
          direction="row"
          sx={{ width: { xs: 1, sm: 'auto' }, gap: 2, alignItems: 'center', justifyContent: { xs: 'space-between', sm: 'flex-end' } }}
        >
          <SelectColumnSorting {...{ getState: table.getState, getAllColumns: table.getAllColumns, setSorting }} />
          <Stack direction="row" sx={{ gap: 2, alignItems: 'center' }}>
            <Button variant="contained" startIcon={<Add />} onClick={modalToggler} size="large">
              Ajouter un  Agent
            </Button>
          </Stack>
        </Stack>
      </Stack>
      <Stack>
        <RowSelection selected={Object.keys(rowSelection).length} />
        <TableContainer>
          <Table>
            <TableHead>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableCell key={header.id} {...header.column.columnDef.meta}>
                        {header.isPlaceholder ? null : (
                          <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {header.column.getCanSort() && <HeaderSort column={header.column} />}
                          </Stack>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableHead>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <Fragment key={row.id}>
                  <TableRow>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} {...cell.column.columnDef.meta}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <>
          <Divider />
          <Box sx={{ p: 2 }}>
            <TablePagination
              {...{
                setPageSize: table.setPageSize,
                setPageIndex: table.setPageIndex,
                getState: table.getState,
                getPageCount: table.getPageCount
              }}
            />
          </Box>
        </>
      </Stack>
    </MainCard>
  );
}
export default function Create() {
  const [openModal, setOpenModal] = useState<'agent' | 'check' | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<AgentList | null>(null);
  const [agentData, setAgentsData] = useState<any[]>([]);
  const agentService = new AgentService();
  const handleOpenAgentModal = (agent: AgentList | null = null) => {
    setOpenModal('agent');

    if (agent) {
      // Séparer le code pays et le numéro
      let countryCode = '';
      let contact = '';

      if (agent.phone && agent.phone.startsWith('+')) {
        const match = agent.phone.match(/^(\+\d{1,3})(\d+)$/);
        if (match) {
          countryCode = match[1]; // ex: +221
          contact = match[2];     // ex: 09876554
        }
      }
      const selectAgent = {
        id: agent.id,
        phone: '',
        agence: '',
        firstname: agent.firstname || '',
        lastname: agent.lastname || '',
        mat: agent.mat || '',
        contact: contact || '',
        countryCode: countryCode || '+221',
        active: agent.active ?? true,
        agenceId: agent.agence?.id || '',
      }
      setSelectedAgent(selectAgent);
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await agentService.getAllAgents(); // à adapter selon ton API
      setAgentsData(response); // supporte les deux formats
    } catch (error) {
      console.error('Erreur lors du chargement des agréments :', error);
    }
  };
  const handleActivateAgent = async (id: string) => {
    const confirmed = await swalService.confirm(
      'Activer cet Agent ?',
      'Il pourra de nouveau se connecter.',
      'Oui, activer'
    );
    if (!confirmed) return;

    try {
      await agentService.updateAgentStatus(id, { active: true });
      swalService.toast('Agent activé avec succès', 'success');
      fetchAgents(); // Recharger la liste
    } catch (error) {
      swalService.toast('Erreur lors de l’activation', 'error');
    }
  };

  const handleDeactivateAgent = async (id: string) => {
    const confirmed = await swalService.confirm(
      'Désactiver cet agent ?',
      'Il ne pourra plus etre affecter.',
      'Oui, désactiver'
    );
    if (!confirmed) return;

    try {
      await agentService.updateAgentStatus(id, { active: false });
      swalService.toast('Agent désactivé avec succès', 'success');
      fetchAgents();
    } catch (error) {
      swalService.toast('Erreur lors de la désactivation', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Supprimer ?',
      text: 'Êtes-vous sûr de vouloir supprimer cet agent ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    });

    if (result.isConfirmed) {
      try {
        await agentService.deleteAgent(id);
        swalService.toast('Agent supprimer avec succès', 'success');
        fetchAgents();
      } catch (e) {
        swalService.toast('Erreur de suppression', 'success');
        fetchAgents();
      }
    }
  };
  const handleCloseModal = () => {
    setOpenModal(null);
    setSelectedAgent(null);
  };

  // Appel automatique au chargement du composant
  useEffect(() => {
    fetchAgents();
  }, []);
  const columns: ColumnDef<any>[] = [
    {
      header: 'Nom',
      accessorKey: 'lastname',
    },
    {
      header: 'Prénom',
      accessorKey: 'firstname',
    },
    {
      header: 'Matricule',
      accessorKey: 'mat',
    },
    {
      header: 'Téléphone',
      accessorKey: 'phone',
    },
    {
      header: 'Status',
      accessorKey: 'active',
      cell: ({ row }) => (
        <Stack direction="row" sx={{ gap: 0.5, alignItems: 'center' }}>
          <Dot
            color={row.original.active ? 'success' : 'error'}
            size={6}
          />
          <Typography
            sx={{ color: row.original.active ? 'success.main' : 'error.main' }}
            variant="caption"
          >
            {row.original.active ? 'Active' : 'Inactive'}
          </Typography>
        </Stack>
      )
    },
    {
      header: 'Actions',
      meta: { align: 'center' },
      id: 'actions',
      cell: ({ row }: { row: any }) => {
        const agent = row.original;
        return (
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
            {/* Activer / Désactiver */}
            {agent.active ? (
              <Tooltip title="Désactiver l'agent">
                <IconButton
                  color="success"
                  onClick={() => handleDeactivateAgent(agent.id)} //  utiliser agent.id
                >
                  <User />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="Activer l'agent">
                <IconButton
                  color="error"
                  onClick={() => handleActivateAgent(agent.id)} //  utiliser agent.id
                >
                  <UserRemove />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Modifier">
              <IconButton color="primary"
                onClick={() => handleOpenAgentModal(agent)}>
                <Edit />
              </IconButton>
            </Tooltip>

            <Tooltip title="Supprimer">
              <IconButton color="error" onClick={() => handleDelete(agent.id)}>
                <Trash />
              </IconButton>
            </Tooltip>
          </Stack>
        );
      },
    }

  ];


  return (
    <>
      <MainCard>
        <Grid sx={{ mt: 3 }}>
          <ReactTable {...{
            data: agentData, columns, modalToggler: () => {
              handleOpenAgentModal(null)
            }
          }} />
        </Grid>
        <AgentModal
          open={openModal === 'agent'}
          modalToggler={handleCloseModal}
          agent={selectedAgent}
          onRefresh={fetchAgents}
        />

      </MainCard>
    </>
  );
}
