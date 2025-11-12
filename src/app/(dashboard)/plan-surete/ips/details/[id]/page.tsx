'use client';
import { useParams } from 'next/navigation';
import React, { useEffect } from 'react';
import { IpService } from 'services/plan-surete/ip.service';
import { Ip } from 'types/ip';
import IpDetailsData from 'views/surete/ip/details/IpDetails';

const ipService = new IpService();

export default function IpDetails() {
	const params = useParams();
	const id = params?.id as string;
	const [ip, setIp] = React.useState<Ip | null>(null);
	const [loading, setLoading] = React.useState<boolean>(true);
	const [error, setError] = React.useState<string | null>(null);

	React.useEffect(() => {
		if (!id) return;
		setLoading(true);
		ipService.getIpById(id)
			.then((data) => {
				setIp(data);
				setError(null);
			})
			.catch(() => {
				setError('Erreur lors de la récupération des données IP.');
				setIp(null);
			})
			.finally(() => setLoading(false));
	}, [id]);

	if (error) return <div style={{color: 'red'}}>{error}</div>;
	if (!ip) return <div>Aucune donnée trouvée</div>;

	return (
		<IpDetailsData key={ip.id}
          showAvatarStack={true}
          borderLeft={true}
          ip={ip}/>
	);
}

