import React, { useState, useEffect } from 'react';
import { Container, Form, Table, Button, Alert } from 'react-bootstrap';

interface Client {
    Codice: number;
    Nome: string;
    Cognome: string;
    Indirizzo: string;
    Email: string;
}

interface Product {
    Codice: number;
    Nome: string;
    Descrizione: string;
    Prezzo: number;
    QuantitaDisponibile: number;
    DistribuzioneMagazzini: string;
    QuantitaSelezionata: number;
}

interface Shop {
    Codice: number;
    Denominazione: string;
    Indirizzo: string;
}

interface Employee {
    Numero: number;
    Nome: string;
    Cognome: string;
    Posizione: string;
}

const SimulazioneOrdineVendita: React.FC = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [selectedClient, setSelectedClient] = useState<number>(0);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');
    const [shops, setShops] = useState<Shop[]>([]);
    const [selectedShop, setSelectedShop] = useState<number>(0);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<number>(0);


    useEffect(() => {
        // Carica negozi
        fetch('http://15.204.245.166:8002/api/orders/shops')
            .then(res => res.json())
            .then(data => setShops(data));

        // Carica clienti
        fetch('http://15.204.245.166:8002/api/orders/clients')
            .then(res => res.json())
            .then(data => setClients(data));
    }, []);

    useEffect(() => {
        if (selectedShop) {
            fetch(`http://15.204.245.166:8002/api/orders/shops/${selectedShop}/employees`)
                .then(res => res.json())
                .then(data => setEmployees(data));
        } else {
            setEmployees([]);
            setSelectedEmployee(0);
        }
    }, [selectedShop]);

    useEffect(() => {
        if (selectedClient && selectedShop) {
            setLoading(true);
            fetch(`http://15.204.245.166:8002/api/orders/shops/${selectedShop}/available-products`)
                .then(res => res.json())
                .then(data => setProducts(data.map((p: Product) => ({ ...p, QuantitaSelezionata: 0 }))))
                .finally(() => setLoading(false));
        }
    }, [selectedClient, selectedShop]);

    useEffect(() => {
        if (selectedClient) {
            setLoading(true);
            fetch(`http://15.204.245.166:8002/api/orders/shops/1/available-products`)
                .then(res => res.json())
                .then(data => setProducts(data.map((p: Product) => ({ ...p, QuantitaSelezionata: 0 }))))
                .finally(() => setLoading(false));
        }
    }, [selectedClient]);

    const handleQuantityChange = (productId: number, quantity: number) => {
        setProducts(products.map(p => 
            p.Codice === productId ? 
            { ...p, QuantitaSelezionata: Math.min(Math.max(0, quantity), p.QuantitaDisponibile) } : 
            p
        ));
    };

    const handleSubmit = async () => {
        if (!selectedClient) {
            setError('Seleziona un cliente');
            return;
        }

        const productsToOrder = products
            .filter(p => p.QuantitaSelezionata > 0)
            .map(p => ({
                Codice: p.Codice,
                Quantita: p.QuantitaSelezionata,
                DistribuzioneMagazzini: p.DistribuzioneMagazzini
            }));

        if (!productsToOrder.length) {
            setError('Seleziona almeno un prodotto');
            return;
        }

        try {
            const response = await fetch('http://15.204.245.166:8002/api/orders/sale', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    shop_id: 1,
                    client_id: selectedClient,
                    products: productsToOrder,
                    employee_id: selectedEmployee
                })
            });

            if (!response.ok) throw new Error('Errore nella creazione della vendita');

            setSuccess('Vendita creata con successo');
            setProducts(products.map(p => ({ ...p, QuantitaSelezionata: 0 })));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Errore sconosciuto');
        }
    };

    return (
        <Container>
            <h2 className="my-4">Simulazione Ordine di Vendita</h2>

            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <Form.Select 
                className="mb-4"
                value={selectedShop}
                onChange={(e) => setSelectedShop(Number(e.target.value))}
            >
                <option value={0}>Seleziona un negozio</option>
                {shops.map(s => (
                    <option key={s.Codice} value={s.Codice}>
                        {s.Denominazione} - {s.Indirizzo}
                    </option>
                ))}
            </Form.Select>

            <Form.Select 
                className="mb-4"
                value={selectedClient}
                onChange={(e) => setSelectedClient(Number(e.target.value))}
                disabled={!selectedShop}
            >
                <option value={0}>Seleziona un cliente</option>
                {clients.map(c => (
                    <option key={c.Codice} value={c.Codice}>
                        {c.Nome} {c.Cognome} - {c.Email}
                    </option>
                ))}
            </Form.Select>

            <Form.Select 
                className="mb-4"
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(Number(e.target.value))}
                disabled={!selectedShop}
            >
                <option value={0}>Seleziona un responsabile</option>
                {employees.map(e => (
                    <option key={e.Numero} value={e.Numero}>
                        {e.Nome} {e.Cognome} - {e.Posizione}
                    </option>
                ))}
            </Form.Select>

            {selectedClient > 0 && !loading && (
                <>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Prodotto</th>
                                <th>Descrizione</th>
                                <th>Prezzo</th>
                                <th>Disponibilità</th>
                                <th>Quantità</th>
                                <th>Totale</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product.Codice}>
                                    <td>{product.Nome}</td>
                                    <td>{product.Descrizione}</td>
                                    <td>€{product.Prezzo.toFixed(2)}</td>
                                    <td>{product.QuantitaDisponibile}</td>
                                    <td>
                                        <Form.Control
                                            type="number"
                                            min="0"
                                            max={product.QuantitaDisponibile}
                                            value={product.QuantitaSelezionata}
                                            onChange={(e) => handleQuantityChange(product.Codice, Number(e.target.value))}
                                        />
                                    </td>
                                    <td>€{(product.Prezzo * product.QuantitaSelezionata).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>

                    <Button 
                        variant="primary"
                        onClick={handleSubmit}
                        disabled={!products.some(p => p.QuantitaSelezionata > 0)}
                    >
                        Conferma Vendita
                    </Button>
                </>
            )}
        </Container>
    );
};

export default SimulazioneOrdineVendita;