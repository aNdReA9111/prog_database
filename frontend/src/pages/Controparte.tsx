import React, { useState } from 'react';
import { Form, Button, Container } from 'react-bootstrap';

const Controparte = () => {
  const [tipo, setTipo] = useState('fornitore');
  const [formData, setFormData] = useState({
    nome: '',
    indirizzo: '',
    numeroDiTelefono: '',
    indirizzoMail: '',
    cognome: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://15.204.245.166:8002/api/controparti/add/${tipo}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        alert('Controparte aggiunta con successo');
        setFormData({
          nome: '',
          indirizzo: '',
          numeroDiTelefono: '',
          indirizzoMail: '',
          cognome: ''
        });
      }
    } catch (error) {
      console.error('Errore:', error);
    }
  };

  return (
    <Container>
      <h2>Aggiungi {tipo === 'fornitore' ? 'Fornitore' : 'Cliente'}</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Tipo</Form.Label>
          <Form.Select 
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
          >
            <option value="fornitore">Fornitore</option>
            <option value="cliente">Cliente</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Nome</Form.Label>
          <Form.Control
            type="text"
            value={formData.nome}
            onChange={(e) => setFormData({...formData, nome: e.target.value})}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Indirizzo</Form.Label>
          <Form.Control
            type="text"
            value={formData.indirizzo}
            onChange={(e) => setFormData({...formData, indirizzo: e.target.value})}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Numero di Telefono</Form.Label>
          <Form.Control
            type="tel"
            value={formData.numeroDiTelefono}
            onChange={(e) => setFormData({...formData, numeroDiTelefono: e.target.value})}
            required
          />
        </Form.Group>

        {tipo === 'cliente' && (
          <>
            <Form.Group className="mb-3">
              <Form.Label>Indirizzo Email</Form.Label>
              <Form.Control
                type="email"
                value={formData.indirizzoMail}
                onChange={(e) => setFormData({...formData, indirizzoMail: e.target.value})}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Cognome</Form.Label>
              <Form.Control
                type="text"
                value={formData.cognome}
                onChange={(e) => setFormData({...formData, cognome: e.target.value})}
                required
              />
            </Form.Group>
          </>
        )}

        <Button variant="primary" type="submit">
          Aggiungi {tipo === 'fornitore' ? 'Fornitore' : 'Cliente'}
        </Button>
      </Form>
    </Container>
  );
};

export default Controparte;