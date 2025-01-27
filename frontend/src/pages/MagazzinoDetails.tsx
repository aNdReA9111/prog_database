import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Table, Button } from 'react-bootstrap';

// Aggiorna l'interfaccia Prodotto per assicurarsi che codice sia definito
interface Prodotto {
    codice: number;
    nome: string;
    descrizione: string;
    quantita: number;
}

const MagazzinoDetail: React.FC = () => {
    const { codice } = useParams<{ codice: string }>();
    const [prodotti, setProdotti] = useState<Prodotto[]>([]);
    const [error, setError] = useState<string>('');
    
    
    useEffect(() => {
        if (!codice) return;
        
        fetch(`http://15.204.245.166:8002/api/magazzini/${codice}`)
            .then(response => {
                if (!response.ok) throw new Error('Errore nel caricamento');
                return response.json();
            })
            .then(data => {
                if (Array.isArray(data)) {
                    setProdotti(data);
                    console.log('Prodotti:', data);
                } else {
                    throw new Error('Formato dati non valido');
                }
            })
            .catch(err => setError(err.message));
    }, [codice]);


// Aggiorna la funzione updateQuantity con validazione
const updateQuantity = async (codiceProdotto: number, newQuantity: number) => {
    if (!codice || !codiceProdotto) {
        setError('Codice prodotto non valido');
        return;
    }

    const payload = {
        codice_magazzino: Number(codice),
        codice_prodotto: Number(codiceProdotto),
        quantita: Number(newQuantity)
    };

    console.log('Payload:', payload);

    try {
        const response = await fetch("http://15.204.245.166:8002/api/magazzini/update-quantity", {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.detail || 'Errore durante l\'aggiornamento');
        }

        setProdotti(prev => prev.map(p => 
            p.codice === codiceProdotto ? {...p, quantita: newQuantity} : p
        ));
    } catch (err) {
        console.error('Errore:', err);
        setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    }
};

    return (
        <div className="container mt-4">
            {error && <div className="alert alert-danger">{error}</div>}
            
            <h2>Dettagli Magazzino {codice}</h2>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Descrizione</th>
                        <th>Quantità</th>
                        <th>Azioni</th>
                    </tr>
                </thead>
                <tbody>
                    {prodotti.map((prodotto) => (
                        <tr key={`${prodotto.codice}-${prodotto.nome}`}>
                            <td>{prodotto.nome}</td>
                            <td>{prodotto.descrizione}</td>
                            <td>
                                <input
                                    type="number"
                                    min="0"
                                    value={prodotto.quantita}
                                    onChange={(e) => {
                                        const newQuantity = Math.max(0, parseInt(e.target.value) || 0);
                                        setProdotti(prev => prev.map(p => 
                                            p.codice === prodotto.codice 
                                                ? {...p, quantita: newQuantity} 
                                                : p
                                        ));
                                    }}
                                />
                            </td>
                            <td>
                                <Button 
                                    variant="primary"
                                    onClick={() => updateQuantity(prodotto.codice, prodotto.quantita)}
                                >
                                    Aggiorna
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
};

export default MagazzinoDetail;