import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Table, Container, Accordion, Badge } from 'react-bootstrap';

interface Order {
  Codice: number;
  Data: string;
  Prodotto: string;
  Prezzo: number;
  Quantita: number;
  Cliente: string;
  Importo: number;
  Iva: number;
}

interface GroupedOrder {
  Codice: number;
  Data: string;
  Cliente: string;
  Prodotti: Order[];
  TotaleImporto: number;
  TotaleIva: number;
}

const OrdiniDipendente: React.FC = () => {
  const { shopId, employeeId } = useParams();
  const [orders, setOrders] = useState<GroupedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`http://15.204.245.166:8002/api/shops/${shopId}/employees/${employeeId}/orders`)
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(data => {
        // Raggruppa ordini per codice
        const grouped = data.reduce((acc: { [key: number]: GroupedOrder }, curr: Order) => {
          if (!acc[curr.Codice]) {
            acc[curr.Codice] = {
              Codice: curr.Codice,
              Data: curr.Data,
              Cliente: curr.Cliente,
              Prodotti: [],
              TotaleImporto: 0,
              TotaleIva: curr.Iva
            };
          }
          acc[curr.Codice].Prodotti.push(curr);
          acc[curr.Codice].TotaleImporto += curr.Importo;
          return acc;
        }, {});

        setOrders(Object.values(grouped));
        setError(null);
      })
      .catch(error => setError(error.message))
      .finally(() => setLoading(false));
  }, [shopId, employeeId]);

  if (loading) return <div>Caricamento...</div>;
  if (error) return <div>Errore: {error}</div>;
  if (!orders.length) return <div>Nessun ordine trovato</div>;

  return (
    <Container>
      <h2 className="my-4">Ordini Evasi dal Dipendente</h2>
      <Accordion>
        {orders.map((order) => (
          <Accordion.Item key={order.Codice} eventKey={order.Codice.toString()}>
            <Accordion.Header>
              <div className="d-flex justify-content-between w-100 me-3">
                <span>Ordine #{order.Codice}</span>
                <span>Data: {new Date(order.Data).toLocaleDateString('it-IT')}</span>
                <span>Cliente: {order.Cliente}</span>
                <Badge bg="success">
                  Totale: €{(order.TotaleImporto * (1 + order.TotaleIva/100)).toFixed(2)}
                </Badge>
              </div>
            </Accordion.Header>
            <Accordion.Body>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Prodotto</th>
                    <th>Prezzo Unitario</th>
                    <th>Quantità</th>
                    <th>Subtotale</th>
                  </tr>
                </thead>
                <tbody>
                  {order.Prodotti.map((prodotto, idx) => (
                    <tr key={`${prodotto.Codice}-${idx}`}>
                      <td>{prodotto.Prodotto}</td>
                      <td>€{prodotto.Prezzo.toFixed(2)}</td>
                      <td>{prodotto.Quantita}</td>
                      <td>€{(prodotto.Prezzo * prodotto.Quantita).toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="table-info">
                    <td colSpan={3}><strong>Totale (IVA {order.TotaleIva}%)</strong></td>
                    <td>
                      <strong>
                        €{(order.TotaleImporto * (1 + order.TotaleIva/100)).toFixed(2)}
                      </strong>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>
    </Container>
  );
};

export default OrdiniDipendente;