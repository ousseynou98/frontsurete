import { useCallback, useMemo } from 'react';

// material-ui
import Modal from '@mui/material/Modal';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';

// project-imports
import { useGetCustomer } from 'api/customer';
import CircularWithPath from 'components/@extended/progress/CircularWithPath';
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';

// types
import FormAgentAdd from './FormAgentAdd';
import { AgentList } from 'types/agent';

interface Props {
  open: boolean;
  modalToggler: (state: boolean) => void;
  agent?: AgentList | null;
  onRefresh: () => void; //
}

// ==============================|| CUSTOMER ADD / EDIT ||============================== //

export default function AgentModal({ open, modalToggler, agent, onRefresh }: Props) {
  const { customersLoading: loading } = useGetCustomer();

  const closeModal = useCallback(() => modalToggler(false), [modalToggler]);

  const customerForm = useMemo(
    () => !loading && <FormAgentAdd agent={agent || null} closeModal={closeModal} onRefresh={onRefresh} />,
    [agent, loading, closeModal, onRefresh]
  );

  return (
    <>
      {open && (
        <Modal
          open={open}
          onClose={closeModal}
          aria-labelledby="modal-customer-add-label"
          aria-describedby="modal-customer-add-description"
          sx={{ '& .MuiPaper-root:focus': { outline: 'none' } }}
        >
          <MainCard
            sx={{ minWidth: { xs: 340, sm: 600, md: 680 }, maxWidth: 680, height: 'auto', maxHeight: 'calc(100vh - 48px)' }}
            modal
            content={false}
          >
            <SimpleBar
              sx={{ width: 1, maxHeight: `calc(100vh - 48px)`, '& .simplebar-content': { display: 'flex', flexDirection: 'column' } }}
            >
              {loading ? (
                <Box sx={{ p: 5 }}>
                  <Stack direction="row" sx={{ justifyContent: 'center' }}>
                    <CircularWithPath />
                  </Stack>
                </Box>
              ) : (
                customerForm
              )}
            </SimpleBar>
          </MainCard>
        </Modal>
      )}
    </>
  );
}
