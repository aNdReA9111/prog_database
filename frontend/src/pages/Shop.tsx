import React, { useEffect, useState } from "react";
import { Card, Button, Container, Row, Col } from "react-bootstrap";

interface Shop {
  codice: number;
  indirizzo_sede: string;
  denominazione: string;
}

const Shop: React.FC = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const response = await fetch("http://15.204.245.166:8002/api/shops/");
        if (!response.ok) {
          throw new Error(`${response.status} - ${response.statusText}`);
        }
        const data: Shop[] = await response.json();
        setShops(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, []);

  if (loading) {
    return <p>Caricamento in corso...</p>;
  }

  if (error) {
    return <p>Errore: {error}</p>;
  }

  return (
    <Container>
      <h1 className="my-4">Negozi Disponibili</h1>
      <Row>
        {shops.map((shop) => (
          <Col md={4} key={shop.codice} className="mb-4">
            <Card>
              <Card.Body>
                <Card.Title>{shop.denominazione}</Card.Title>
                <Card.Text>{shop.indirizzo_sede}</Card.Text>
                <div className="d-flex gap-2">
                  <Button
                    variant="primary"
                    href={`http://15.204.245.166:5173/shop/${shop.codice}`}
                  >
                    Dettagli Negozio
                  </Button>
                  <Button
                    variant="success"
                    href={`http://15.204.245.166:5173/shop/${shop.codice}/products`}
                  >
                    Visita Negozio
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Shop;
