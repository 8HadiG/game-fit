export default function App() {
  const gameDetail = {
    title: "Boom Beach",
    developer: "Supercell",
    installs: "25M",
    score: 4.5,
    price: 0,
    iap: true,
    ads: true
  };

  return (
    <Card {...gameDetail} />
  );
}

function Card({ title, developer, installs, score, price, iap, ads }) {
  return (
    <>
      <h3>{title}</h3>
      <h4>{developer}</h4>
      <p>{installs}</p>
      <p>{score}</p>
      <p>{price}</p>
      <p>{iap}</p>
      <p>{ads}</p>
    </>
  );
}
