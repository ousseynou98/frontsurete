import EditIncident from 'views/incident/Edit';
import type { ComponentType } from 'react';

// ==============================|| INCIDENTS - EDIT ||============================== //

type Props = {
  params: Promise<{
    id: string;
  }>;
};

const EditIncidentTyped = EditIncident as ComponentType<{ incidentId: string }>;

export default async function Page({ params }: Props) {
  const { id } = await params;

  return <EditIncidentTyped incidentId={id} />;
}
