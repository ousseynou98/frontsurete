import IncidentActions from 'views/incident/Actions';

// ==============================|| INCIDENT - ACTIONS ||============================== //

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <IncidentActions incidentId={id} />;
}
