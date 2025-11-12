import EditPermission from '../../../../../views/permissions-view/EditPermission';
// import http from '../../../../../hooks/useCookie';

// ==============================|| PERMISSIONS - EDIT ||============================== //

type Props = {
  params: Promise<{
    id: string;
  }>;
};

// Composant de page pour la page d'édition des permissions
export default async function Page({ params }: Props) {
  const { id } = await params;

  return <EditPermission permissionId={id} />;
}
