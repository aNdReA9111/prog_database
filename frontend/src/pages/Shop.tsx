import { Card, Row, Col } from 'react-bootstrap';

function Shop() {
  const shops = [
    { id: 1, name: "Negozio 1", location: "Milano" },
    { id: 2, name: "Negozio 2", location: "Roma" },
    { id: 3, name: "Negozio 3", location: "Napoli" }
  ];

  return (
    <>
      <h2>I Nostri Negozi</h2>
      <Row xs={1} md={3} className="g-4">
        {shops.map(shop => (
          <Col key={shop.id}>
            <Card>
              <Card.Body>
                <Card.Title>{shop.name}</Card.Title>
                <Card.Text>Località: {shop.location}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );
}

export default Shop;