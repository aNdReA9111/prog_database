import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Table, Container, Accordion } from 'react-bootstrap';

type Order = {
  Codice: number;
  Data: string;
  NomeProdotto: string;
  Prezzo: number;
  Quantita: number;
};

interface GroupedOrders {
  [key: number]: {
    data: string;
    prodotti: Order[];
  }
}

const OrdiniVenditaCliente: React.FC = () => {
  const { shopId, clientId } = useParams();
  const [groupedOrders, setGroupedOrders] = useState<GroupedOrders>({});

  useEffect(() => {
    fetch(`http://15.204.245.166:8002/api/shops/${shopId}/clients/${clientId}/orders`)
      .then(response => response.json())
      .then(data => {
        const grouped = data.reduce((acc: GroupedOrders, order: Order) => {
          if (!acc[order.Codice]) {
            acc[order.Codice] = {
              data: order.Data,
              prodotti: []
            };
          }
          acc[order.Codice].prodotti.push(order);
          return acc;
        }, {});
        setGroupedOrders(grouped);
      })
      .catch(error => console.error('Errore:', error));
  }, [shopId, clientId]);

  const calcolaTotaleOrdine = (prodotti: Order[]) => {
    return prodotti.reduce((acc, prod) => acc + (prod.Prezzo * prod.Quantita), 0);
  };

  return (
    <Container>
      <h2 className="my-4">Dettaglio Ordini Cliente</h2>
      <Accordion>
        {Object.entries(groupedOrders).map(([codiceOrdine, ordine]) => (
          <Accordion.Item key={codiceOrdine} eventKey={codiceOrdine}>
            <Accordion.Header>
              Ordine #{codiceOrdine} - {new Date(ordine.data).toLocaleDateString('it-IT')} 
              - Totale: €{calcolaTotaleOrdine(ordine.prodotti).toFixed(2)}
            </Accordion.Header>
            <Accordion.Body>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Prodotto</th>
                    <th>Prezzo Unitario</th>
                    <th>Quantità</th>
                    <th>Totale</th>
                  </tr>
                </thead>
                <tbody>
                  {ordine.prodotti.map((prodotto: Order): JSX.Element => (
                    <tr key={`${codiceOrdine}-${prodotto.NomeProdotto}`}>
                      <td>{prodotto.NomeProdotto}</td>
                      <td>€{prodotto.Prezzo.toFixed(2)}</td>
                      <td>{prodotto.Quantita}</td>
                      <td>€{(prodotto.Prezzo * prodotto.Quantita).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>
    </Container>
  );
};

export default OrdiniVenditaCliente;