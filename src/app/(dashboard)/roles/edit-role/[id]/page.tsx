import EditRole from '../../../../../views/roles-view/EditRole';
// ==============================|| ROLES - EDIT ||============================== //

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function Page({ params }: Props) {
  const { id } = await params;

  return <EditRole roleId={id} />;
}
