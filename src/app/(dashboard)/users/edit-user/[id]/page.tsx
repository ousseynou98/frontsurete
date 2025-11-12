import EditUser from '../../../../../views/users-view/EditUser';
// import http from '../../../../../hooks/useCookie';

// ==============================|| USERS - EDIT ||============================== //

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function Page({ params }: Props) {
  const { id } = await params;

  return <EditUser userId={id} />;
}
