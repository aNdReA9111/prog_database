import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Table, Container, Alert, Spinner } from 'react-bootstrap';

type Product = {
  Codice: number;
  Nome: string;
  Prezzo: number;
  MagazzinoCodice: number;
  MagazzinoIndirizzo: string;
  Quantita: number;
};

const ShopProducts: React.FC = () => {
  const { shopId } = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`http://15.204.245.166:8002/api/shops/${shopId}/products`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Errore nel caricamento dei prodotti');
        }
        return response.json();
      })
      .then(data => {
        if (!Array.isArray(data)) {
          throw new Error('Dati ricevuti non validi');
        }
        setProducts(data);
      })
      .catch(error => {
        console.error('Errore:', error);
        setError(error.message);
      })
      .finally(() => setLoading(false));
  }, [shopId]);

  if (loading) {
    return (
      <Container className="d-flex justify-content-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Caricamento...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert variant="danger" className="mt-3">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <h2 className="my-4">Prodotti Disponibili</h2>
      {products.length === 0 ? (
        <Alert variant="info">Nessun prodotto disponibile</Alert>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Codice</th>
              <th>Nome</th>
              <th>Prezzo</th>
              <th>Quantità Disponibile</th>
              <th>Magazzino</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.Codice}>
                <td>{product.Codice}</td>
                <td>{product.Nome}</td>
                <td>€{product.Prezzo.toFixed(2)}</td>
                <td>{product.Quantita}</td>
                <td>{product.MagazzinoIndirizzo}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default ShopProducts;