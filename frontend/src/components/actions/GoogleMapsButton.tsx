interface Props {
	url: string;
}

export function GoogleMapsButton({ url }: Props) {
	return (
		<a
			href={url}
			target="_blank"
			rel="noopener noreferrer"
			style={{
				display: 'inline-block',
				padding: '10px 20px',
				backgroundColor: '#34A853',
				color: '#fff',
				borderRadius: '8px',
				textDecoration: 'none',
				fontSize: '14px',
				fontWeight: 'bold',
				marginTop: '8px',
			}}
		>
			Google Maps で開く
		</a>
	);
}
