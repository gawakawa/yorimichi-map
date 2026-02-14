import './ReturnRouteButton.css';

export function ReturnRouteButton() {
	const handleClick = () => {
		console.log('経由地を逆順に変換');
		// TODO: 将来的にはAPIを呼び出して帰路ルートを作成
	};

	return (
		<button className="return-route-button" onClick={handleClick}>
			🔄 帰路ルートを作成
		</button>
	);
}
