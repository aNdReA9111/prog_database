import React, { useState, useEffect } from 'react';
import { Container, Form, Table, Button, Alert } from 'react-bootstrap';

interface Supplier {
    Codice: number;
    Nome: string;
    Indirizzo: string;
    Telefono: string;
}

interface Product {
    Codice: number;
    Nome: string;
    Descrizione: string;
    Prezzo: number;
    Quantita: number;
}

interface Warehouse {
    Codice: number;
    Indirizzo: string;
}

interface OrderData {
    shop_id: number;
    supplier_id: number;
    warehouse_id: number;
    products: Array<{
        Codice: number;
        Quantita: number;
    }>;
}

const SimulazioneOrdiniAcquisto: React.FC = () => {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [selectedSupplier, setSelectedSupplier] = useState<number>(0);
    const [products, setProducts] = useState<Product[]>([]);
    const [success, setSuccess] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [selectedWarehouse, setSelectedWarehouse] = useState<number>(0);

    useEffect(() => {
        fetch('http://15.204.245.166:8002/api/orders/warehouses')
            .then(res => res.json())
            .then(data => setWarehouses(data));
    }, []);

    useEffect(() => {
        setLoading(true);
        fetch('http://15.204.245.166:8002/api/orders/suppliers')
            .then(res => {
                if (!res.ok) throw new Error('Errore nel caricamento fornitori');
                return res.json();
            })
            .then(data => {
                if (!data || data.length === 0) {
                    setError('Nessun fornitore disponibile');
                }
                setSuppliers(data);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (selectedSupplier) {
            setLoading(true);
            console.log("Richiesta prodotti al fornitore:", selectedSupplier); // Debug
            fetch(`http://15.204.245.166:8002/api/orders/suppliers/${selectedSupplier}/products`)
                .then((res) => {
                    if (!res.ok) throw new Error('Errore nel caricamento prodotti');
                    return res.json();
                })
                .then((data) => {
                    if (!Array.isArray(data)) {
                        throw new Error('Formato dati non valido');
                    }
                    setProducts(data.map(p => ({ ...p, Quantita: 0 })));
                    setError('');
                })
                .catch((err) => {
                    console.error("Errore:", err);
                    setError(err.message);
                    setProducts([]);
                })
                .finally(() => setLoading(false));
        }
    }, [selectedSupplier]);

    const handleQuantityChange = (productId: number, quantity: number) => {
        setProducts(products.map(p =>
            p.Codice === productId ? { ...p, Quantita: quantity } : p
        ));
    };

    const handleSubmit = async () => {
        if (!selectedWarehouse) {
            setError('Seleziona un magazzino');
            return;
        }
    
        const orderData: OrderData = {
            shop_id: 1,
            supplier_id: selectedSupplier,
            warehouse_id: selectedWarehouse,
            products: products
                .filter(p => p.Quantita > 0)
                .map(p => ({
                    Codice: p.Codice,
                    Quantita: p.Quantita
                }))
        };
    
        try {
            const response = await fetch('http://15.204.245.166:8002/api/orders/purchase', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Errore nella creazione dell\'ordine');
            }
    
            setSuccess('Ordine creato con successo');
            setProducts(products.map(p => ({ ...p, Quantita: 0 })));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Errore sconosciuto');
        }
    };

    return (
        <Container>
            <h2 className="my-4">Simulazione Ordini di Acquisto</h2>

            {loading && <div>Caricamento fornitori...</div>}
            {error && <Alert variant="danger">{error}</Alert>}

            {!loading && suppliers.length > 0 && (
                <Form.Select
                    className="mb-4"
                    value={selectedSupplier}
                    onChange={(e) => setSelectedSupplier(Number(e.target.value))}
                >
                    <option value={0}>Seleziona un fornitore</option>
                    {suppliers.map(s => (
                        <option key={s.Codice} value={s.Codice}>
                            {s.Nome} - {s.Indirizzo}
                        </option>
                    ))}
                </Form.Select>
            )}

            <Form.Select
                className="mb-4"
                value={selectedWarehouse}
                onChange={(e) => setSelectedWarehouse(Number(e.target.value))}
            >
                <option value={0}>Seleziona un magazzino</option>
                {warehouses.map(w => (
                    <option key={w.Codice} value={w.Codice}>
                        {w.Indirizzo}
                    </option>
                ))}
            </Form.Select>

            {selectedSupplier > 0 && (
                <>
                    {loading ? (
                        <div>Caricamento prodotti...</div>
                    ) : products.length === 0 ? (
                        <Alert variant="info">Nessun prodotto disponibile per questo fornitore</Alert>
                    ) : (
                        <>
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>Prodotto</th>
                                        <th>Descrizione</th>
                                        <th>Prezzo</th>
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
                                            <td>
                                                <Form.Control
                                                    type="number"
                                                    min="0"
                                                    value={product.Quantita}
                                                    onChange={(e) => handleQuantityChange(product.Codice, Number(e.target.value))}
                                                />
                                            </td>
                                            <td>€{(product.Prezzo * product.Quantita).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                    <tr>
                                        <td colSpan={4}><strong>Totale Ordine</strong></td>
                                        <td>
                                            <strong>
                                                €{products
                                                    .reduce((acc, p) => acc + (p.Prezzo * p.Quantita), 0)
                                                    .toFixed(2)}
                                            </strong>
                                        </td>
                                    </tr>
                                </tbody>
                            </Table>
                            <Button variant="primary" onClick={handleSubmit}>
                                Conferma Ordine
                            </Button>
                        </>
                    )}
                </>
            )}
        </Container>
    );
};

export default SimulazioneOrdiniAcquisto;