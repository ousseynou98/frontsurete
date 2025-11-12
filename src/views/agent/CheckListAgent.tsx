'use client';

import * as yup from 'yup';
import { Formik, Form } from 'formik';
import {
  Box,
  Grid,
  Stack,
  TextField,
  InputLabel,
  FormControl,
  FormHelperText,
  Button,
  IconButton,
  Autocomplete,
} from '@mui/material';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import DialogActions from '@mui/material/DialogActions';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import MainCard from 'components/MainCard';
import { useEffect, useMemo, useState } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  IndeterminateCheckbox,
  RowSelection,
  TablePagination,

} from 'components/third-party/react-table';
import { Edit, Trash, } from '@wandersonalwes/iconsax-react';
import { AgentService } from 'services/agent/agent';
import dayjs from 'dayjs';
import { CheckEvent, CheckEventService } from 'services/checkEvent/checkEvent';
import Swal from 'sweetalert2';
import { swalService } from 'services/swalService';


// ==============================|| VALIDATION SCHEMA ||============================== //

const validationSchema = yup.object({
  agents: yup
    .array()
    .min(1, 'Veuillez sélectionner au moins un agent')
    .required('La sélection des agents est obligatoire'),

  checkIn: yup
    .date()
    .typeError('La date et l’heure de début sont obligatoires')
    .required('La date et l’heure de début sont obligatoires'),

  checkOut: yup
    .date()
    .typeError('La date et l’heure de fin sont obligatoires')
    .when('checkIn', (checkIn, schema) =>
      checkIn
        ? schema.min(checkIn, "La date et l’heure de fin ne peuvent pas précéder la date et l’heure de début")
        : schema
    )
    .required('La date et l’heure de fin sont obligatoires')
});

// ==============================|| TYPES ||============================== //

interface Agent {
  id: string;
  firstname: string;
  lastname: string;
  phone?: string;
  agence?: { name?: string };
  active?: boolean;
}

interface FormProps {
  lists: Agent[];
  selectedAgents: string[]; // liste d'ID d'agents sélectionnés depuis le tableau
  onAgentsChange: (ids: string[]) => void;
  onRefresh: () => void;
}

// ==============================|| FORMULAIRE DE CRÉATION ||============================== //

function CreateForm({ lists, selectedAgents, onAgentsChange, onRefresh }: FormProps) {
  const checkEventService = new CheckEventService();

  return (
    <Formik
      enableReinitialize
      initialValues={{
        agents: selectedAgents || [],
        checkIn: new Date(),
        checkOut: null
      }}
      validationSchema={validationSchema}
      onSubmit={async (values, { resetForm }) => {
        try {
          const payload: CheckEvent = {
            checkIn: values.checkIn ? dayjs(values.checkIn).toISOString() : undefined,
            checkOut: values.checkOut ? dayjs(values.checkOut).toISOString() : undefined,
            agentIds: values.agents || []
          };

          let response;
          if ((values as any).id) {
            response = await checkEventService.updateCheckEvent((values as any).id, payload);
          } else {
            response = await checkEventService.createCheckEvent(payload);
          }
          swalService.toast('Agent enregistrés avec succès', 'success');
          resetForm();
          onRefresh();
          onAgentsChange([]); // réinitialiser la sélection
        } catch (error) {
          console.error('Erreur lors de l’enregistrement :', error);
          swalService.toast('Erreur lors de l’enregistrement', 'success');
        }
      }}
    >
      {({ handleSubmit, errors, touched, values, setFieldValue }) => {
        // synchronise la sélection du tableau avec le champ agents
        useEffect(() => {
          setFieldValue('agents', selectedAgents);
        }, [selectedAgents]);

        return (
          <Form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {/* Sélection des agents */}
              <Grid size={{ xs: 12 }}>
                <Stack spacing={1}>
                  <InputLabel>Agents</InputLabel>
                  <Autocomplete
                    multiple
                    id="agents"
                    options={lists}
                    getOptionLabel={(option) => `${option.firstname} ${option.lastname}`}
                    value={lists.filter((a) => values.agents.includes(a.id))}
                    onChange={(event, newValue) => {
                      const ids = newValue.map((opt) => opt.id);
                      setFieldValue('agents', ids);
                      onAgentsChange(ids); // met à jour le parent aussi
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Sélectionnez les agents"
                        error={Boolean(touched.agents && errors.agents)}
                        helperText={touched.agents && (errors.agents as string)}
                      />
                    )}
                  />
                </Stack>
              </Grid>

              {/* Date et heure de Check-In */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Stack spacing={1}>
                  <InputLabel>Date & Heure de Début</InputLabel>
                  <FormControl fullWidth error={Boolean(touched.checkIn && errors.checkIn)}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DateTimePicker
                        value={values.checkIn}
                        onChange={(newValue) => setFieldValue('checkIn', newValue)}
                        format="dd/MM/yyyy HH:mm"
                      />
                    </LocalizationProvider>
                  </FormControl>
                  {touched.checkIn && errors.checkIn && (
                    <FormHelperText error>{errors.checkIn as string}</FormHelperText>
                  )}
                </Stack>
              </Grid>

              {/* Date et heure de Check-Out */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Stack spacing={1}>
                  <InputLabel>Date & Heure de fin</InputLabel>
                  <FormControl fullWidth error={Boolean(touched.checkOut && errors.checkOut)}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DateTimePicker
                        value={values.checkOut}
                        onChange={(newValue) => setFieldValue('checkOut', newValue)}
                        format="dd/MM/yyyy HH:mm"
                      />
                    </LocalizationProvider>
                  </FormControl>
                  {touched.checkOut && errors.checkOut && (
                    <FormHelperText error>{errors.checkOut as string}</FormHelperText>
                  )}
                </Stack>
              </Grid>

              {/* Boutons */}
              <DialogActions sx={{ p: 2.5 }}>
                <Grid container sx={{ justifyContent: 'flex-end', alignItems: 'center', width: 1 }}>
                  <Grid>
                    <Stack direction="row" spacing={2} >
                      <Button color="error" onClick={() => onAgentsChange([])}>
                        Annuler
                      </Button>
                      <Button type="submit" variant="contained">
                        Enregistrer
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </DialogActions>
            </Grid>
          </Form>
        );
      }}
    </Formik>
  );
}

// ==============================|| TABLE ||============================== //

function ReactTable({ data, columns, onSelectionChange }: any) {
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    state: { rowSelection },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  });

  useEffect(() => {
    const selected = table.getSelectedRowModel().rows.map((r: any) => r.original.agent.id);
    onSelectionChange(selected);
  }, [rowSelection]);

  return (
    <MainCard title="Agents assignés" content={false}>
      <Stack>
        <RowSelection selected={Object.keys(rowSelection).length} />
        <TableContainer>
          <Table>
            <TableHead>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((header) => (
                    <TableCell key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableHead>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
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
      </Stack>
    </MainCard>
  );
}

// ==============================|| PAGE CREATE ||============================== //

export default function Create() {
  const [agentData, setAgentData] = useState<any[]>([]);
  const [checkEventData, setCheckEventData] = useState<any[]>([]);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [_currentEvent, setCurrentEvent] = useState<any>(null);
  const agentService = new AgentService();
  const checkEventService = new CheckEventService();
  const fetchData = async () => {
    const agents = await agentService.getAllAgentsByUser();
    const checks = await checkEventService.getAllCheckEventByUser();
    setAgentData(agents);
    setCheckEventData(checks);
  };
  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (row: any) => {
    setCurrentEvent(row);
    setSelectedAgents([row.agent.id]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  // === Supprimer un checkEvent ===
  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Supprimer ?',
      text: 'Êtes-vous sûr de vouloir supprimer cet enregistrement ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    });

    if (result.isConfirmed) {
      try {
        await checkEventService.deleteCheckEvent(id);
        swalService.toast('Agent supprimé avec succès', 'success');
        fetchData();
      } catch (e) {
        swalService.toast('Erreur de suppression', 'success');
      }
    }
  };

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <IndeterminateCheckbox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler()
            }}
          />
        ),
        cell: ({ row }) => (
          <IndeterminateCheckbox
            {...{ checked: row.getIsSelected(), onChange: row.getToggleSelectedHandler() }}
          />
        )
      },
      { header: 'Nom', accessorKey: 'agent.lastname' },
      { header: 'Prénom', accessorKey: 'agent.firstname' },
      {
        header: 'Date & Heure de début',
        accessorKey: 'checkIn',
        cell: ({ row }: any) => dayjs(row.original.checkIn).format('DD/MM/YYYY HH:mm')
      },
      {
        header: 'Date & Heure de fin',
        accessorKey: 'checkOut',
        cell: ({ row }: any) =>
          row.original.checkOut ? dayjs(row.original.checkOut).format('DD/MM/YYYY HH:mm') : '—'
      },
      {
        header: 'Actions',
        cell: ({ row }) => (
          <Stack direction="row" spacing={1}>
            <Tooltip title="Modifier">
              <IconButton color="primary" onClick={() => handleEdit(row.original)}>
                <Edit />
              </IconButton>
            </Tooltip>
            <Tooltip title="Supprimer">
              <IconButton color="error" onClick={() => handleDelete(row.original.id)}>
                <Trash />
              </IconButton>
            </Tooltip>
          </Stack>
        )
      }
    ],
    []
  );

  return (
    <MainCard>
      <CreateForm
        lists={agentData}
        selectedAgents={selectedAgents}
        onAgentsChange={setSelectedAgents}
        onRefresh={fetchData}
      />
      <Divider sx={{ my: 3 }} />
      <Typography variant="h6" sx={{ mb: 2 }}>
        Liste des agents assignés
      </Typography>
      <ReactTable data={checkEventData} columns={columns} onSelectionChange={setSelectedAgents} />
    </MainCard>
  );
}
