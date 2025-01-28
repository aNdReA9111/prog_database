import { useEffect, useState } from "react";
import { Card, Button, Row, Col, Modal, Form, Alert } from "react-bootstrap";

interface Shop {
    id: number;
    nome: string;
}

interface ErrorDetail {
    message: string;
    count?: number;
}

const Magazzini = () => {
    const [magazzini, setMagazzini] = useState<any[]>([]);
    const [shops, setShops] = useState<Shop[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [newMagazzino, setNewMagazzino] = useState({
        indirizzo: '',
        negozi: [] as number[]
    });
    const [error, setError] = useState<string | null>(null);

    const deleteMagazzino = async (codice: number) => {
        if (window.confirm('Sei sicuro di voler eliminare questo magazzino?')) {
            try {
                const response = await fetch(`http://15.204.245.166:8002/api/magazzini/${codice}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                const data = await response.json();

                if (response.ok) {
                    setMagazzini(prev => prev.filter(m => m.codice !== codice));
                } else if (response.status === 400) {
                    // Mostra messaggio personalizzato con conteggio prodotti
                    const errorDetail: ErrorDetail = data.detail;
                    setError(
                        `${errorDetail.message} (${errorDetail.count} ${errorDetail.count === 1 ? 'prodotto' : 'prodotti'} presenti)`
                    );
                } else {
                    throw new Error(typeof data.detail === 'string' ? data.detail : 'Errore sconosciuto');
                }
            } catch (error) {
                console.error('Errore durante l\'eliminazione:', error);
                setError(error instanceof Error ? error.message : 'Errore durante l\'eliminazione del magazzino');
            }
        }
    };

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

        // Carica lista negozi
        fetch("http://15.204.245.166:8002/api/magazzini/shops")
            .then(res => res.json())
            .then(data => setShops(data));
    }, []);


    const handleSubmit = async () => {
        try {
            const response = await fetch("http://15.204.245.166:8002/api/magazzini/add", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newMagazzino)
            });

            if (response.ok) {
                setShowModal(false);
                window.location.reload();
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            {error && (
                <Alert 
                    variant="danger" 
                    onClose={() => setError(null)} 
                    dismissible
                    className="mt-3 mb-3"
                >
                    {error}
                </Alert>
            )}
            <h1>Magazzini</h1>
            <Button onClick={() => setShowModal(true)}>Aggiungi Magazzino</Button>

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

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Nuovo Magazzino</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Indirizzo</Form.Label>
                            <Form.Control
                                type="text"
                                value={newMagazzino.indirizzo}
                                onChange={(e) => setNewMagazzino({
                                    ...newMagazzino,
                                    indirizzo: e.target.value
                                })}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Negozi</Form.Label>
                            {shops.map(shop => (
                                <Form.Check
                                    key={shop.id}
                                    type="checkbox"
                                    label={shop.nome}
                                    onChange={(e) => {
                                        const negozi = e.target.checked
                                            ? [...newMagazzino.negozi, shop.id]
                                            : newMagazzino.negozi.filter(id => id !== shop.id);
                                        setNewMagazzino({ ...newMagazzino, negozi });
                                    }}
                                />
                            ))}
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Annulla
                    </Button>
                    <Button variant="primary" onClick={handleSubmit}>
                        Salva
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Magazzini;
