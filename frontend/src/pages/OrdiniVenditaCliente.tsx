import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Table, Container, Accordion, Button, Modal, Alert } from 'react-bootstrap';

interface Invoice {
  Numero: number;
  Importo: number;
  Iva: number;
  Data: string;
  NomeCliente: string;
  CognomeCliente: string;
  Indirizzo: string;
}
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

interface OrderStatus {
  hasInvoice: boolean;
  hasReturn: boolean;
}

const OrdiniVenditaCliente: React.FC = () => {
  const { shopId, clientId } = useParams();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [groupedOrders, setGroupedOrders] = useState<GroupedOrders>({});
  const [orderStatuses, setOrderStatuses] = useState<{ [key: string]: OrderStatus }>({});
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  useEffect(() => {
    const fetchOrderStatuses = async () => {
      for (const orderId of Object.keys(groupedOrders)) {
        try {
          const response = await fetch(
            `http://15.204.245.166:8002/api/shops/${shopId}/orders/${orderId}/status`
          );
          const status = await response.json();
          setOrderStatuses(prev => ({
            ...prev,
            [orderId]: status
          }));
        } catch (error) {
          console.error(`Errore stato ordine ${orderId}:`, error);
        }
      }
    };
    fetchOrderStatuses();
  }, [groupedOrders, shopId]);

  const handleGenerateInvoice = async (orderId: number) => {
    try {
      const response = await fetch(
        `http://15.204.245.166:8002/api/shops/${shopId}/orders/${orderId}/invoice`,
        { method: 'POST' }
      );
      if (response.ok) {
        setOrderStatuses(prev => ({
          ...prev,
          [orderId]: { ...prev[orderId], hasInvoice: true }
        }));
      }
    } catch (error) {
      console.error('Errore:', error);
    }
  };

  const handleViewInvoice = async (orderId: number) => {
    try {
      const response = await fetch(
        `http://15.204.245.166:8002/api/shops/${shopId}/orders/${orderId}/invoice`
      );
      const invoice = await response.json();
      setSelectedInvoice(invoice);
      setShowInvoiceModal(true);
    } catch (error) {
      console.error('Errore:', error);
    }
  };

  const handleReturn = async (orderId: number) => {
    const motivazione = prompt('Inserisci la motivazione del reso:');
    if (!motivazione) return;

    try {
      const response = await fetch(
        `http://15.204.245.166:8002/api/shops/${shopId}/orders/${orderId}/return`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ motivazione })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400) {
          setError(data.detail.message || 'È necessario generare una fattura prima di richiedere il reso');
          return;
        }
        throw new Error(data.detail?.message || 'Errore sconosciuto');
      }

      setOrderStatuses(prev => ({
        ...prev,
        [orderId]: { ...prev[orderId], hasReturn: true }
      }));
      setSuccess('Reso richiesto con successo');
    } catch (err) {
      console.error('Errore:', err);
      setError(err instanceof Error ? err.message : 'Errore nella richiesta del reso');
    }
  };

  const renderActionButtons = (orderId: number) => {
    const status = orderStatuses[orderId];

    return (
      <div className="mt-3 d-flex align-items-center">
        {status?.hasReturn ? (
          <span className="text-warning me-3">
            <i className="bi bi-exclamation-triangle"></i> Reso già richiesto
          </span>
        ) : (
          <Button
            variant="warning"
            className="me-2"
            onClick={() => handleReturn(orderId)}
          >
            Richiedi Reso
          </Button>
        )}

        {!status?.hasInvoice ? (
          <Button
            variant="primary"
            onClick={() => handleGenerateInvoice(orderId)}
            disabled={status?.hasReturn}
          >
            Genera Fattura
          </Button>
        ) : (
          <Button
            variant="info"
            onClick={() => handleViewInvoice(orderId)}
          >
            Visualizza Fattura
          </Button>
        )}
      </div>
    );
  };

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
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" onClose={() => setSuccess(null)} dismissible>
          {success}
        </Alert>
      )}
      <h2 className="my-4">Dettaglio Ordini Cliente</h2>
      <Accordion>
        {Object.entries(groupedOrders).map(([codiceOrdine, ordine]) => (
          <Accordion.Item key={codiceOrdine} eventKey={codiceOrdine}>
            <Accordion.Header>
              Ordine #{codiceOrdine} - {new Date(ordine.data).toLocaleDateString('it-IT')}
              - Totale (senza IVA): €{calcolaTotaleOrdine(ordine.prodotti).toFixed(2)}
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

              {renderActionButtons(Number(codiceOrdine))}

            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>
      <Modal show={showInvoiceModal} onHide={() => setShowInvoiceModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Fattura #{selectedInvoice?.Numero}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedInvoice && (
            <div className="p-3">
              <h4>Dettagli Cliente</h4>
              <p>Nome: {selectedInvoice.NomeCliente} {selectedInvoice.CognomeCliente}</p>
              <p>Indirizzo: {selectedInvoice.Indirizzo}</p>

              <hr />

              <h4>Dettagli Fattura</h4>
              <p>Data: {new Date(selectedInvoice.Data).toLocaleDateString('it-IT')}</p>
              <p>Imponibile: €{selectedInvoice.Importo.toFixed(2)}</p>
              <p>IVA ({selectedInvoice.Iva}%): €{(selectedInvoice.Importo * selectedInvoice.Iva / 100).toFixed(2)}</p>
              <p className="h5">Totale: €{(selectedInvoice.Importo * (1 + selectedInvoice.Iva / 100)).toFixed(2)}</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowInvoiceModal(false)}>
            Chiudi
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default OrdiniVenditaCliente;