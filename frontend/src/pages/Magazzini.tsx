import { useEffect, useState } from "react";
import { Card, Button, Row, Col } from "react-bootstrap";

const Magazzini = () => {
  const [magazzini, setMagazzini] = useState<any[]>([]);

useEffect(() => {
    fetch("http://15.204.245.166:8002/api/magazzini/", {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => setMagazzini(data))
    .catch(error => console.error(error));
}, []);

const addMagazzino = () => {
    const indirizzo = prompt("Inserisci l'indirizzo del nuovo magazzino:");
    if (indirizzo) {
        fetch("http://15.204.245.166:8002/api/magazzini/add", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ indirizzo })
        })
        .then(() => window.location.reload())
        .catch(error => console.error(error));
    }
};

const deleteMagazzino = async (codice: number) => {
  if (window.confirm('Sei sicuro di voler eliminare questo magazzino?')) {
      try {
          const response = await fetch(`http://15.204.245.166:8002/api/magazzini/${codice}`, {
              method: 'DELETE',
              headers: {
                  'Content-Type': 'application/json',
              }
          });
          
          if (response.ok) {
              setMagazzini(prev => prev.filter(m => m.codice !== codice));
          }
      } catch (error) {
          console.error('Errore durante l\'eliminazione:', error);
      }
  }
};

  return (
    <div>
      <h1>Magazzini</h1>
      <Button onClick={addMagazzino}>Aggiungi Magazzino</Button>
      <Row className="mt-4">
          {magazzini.map((magazzino) => (
              <Col key={magazzino.codice} sm={12} md={6} lg={4}>
                  <Card className="mb-4" style={{ height: '200px' }}>
                      <Card.Body className="d-flex flex-column justify-content-between">
                          <Card.Title>{magazzino.indirizzo}</Card.Title>
                          <div className="d-flex justify-content-between">
                              <Button
                                  variant="primary"
                                  href={`http://15.204.245.166:5173/magazzino/${magazzino.codice}`}
                              >
                                  Dettagli
                              </Button>
                              <Button
                                  variant="danger"
                                  onClick={() => deleteMagazzino(magazzino.codice)}
                              >
                                  Elimina
                              </Button>
                          </div>
                      </Card.Body>
                  </Card>
              </Col>
          ))}
      </Row>
  </div>
  );
};

export default Magazzini;
