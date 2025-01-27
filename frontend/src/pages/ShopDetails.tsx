import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Table, Button, Form, Modal } from 'react-bootstrap';

type Employee = {
  Numero: number;
  Cognome: string;
  Nome: string;
  PosizioneLavorativa: string;
  NumeroDiTelefono: string;
};

type Shop = {
  Codice: number;
  IndirizzoSede: string;
  Denominazione: string;
};

type Client = {
  Codice: number;
  Nome: string;
  Cognome: string;
  Email: string;
  Telefono: string;
};

const ShopDetails: React.FC = () => {
  const { id } = useParams();
  const [shop, setShop] = useState<Shop | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    Cognome: '',
    Nome: '',
    PosizioneLavorativa: '',
    NumeroDiTelefono: '',
  });

  useEffect(() => {
    // Fetch shop details
    fetch(`http://15.204.245.166:8002/api/shops/${id}`)
      .then((response) => response.json())
      .then((data) => setShop(data));
    // Fetch employees
    fetch(`http://15.204.245.166:8002/api/shops/${id}/employees`)
      .then((response) => response.json())
      .then((data) => setEmployees(data));
    // Fetch clients
    fetch(`http://15.204.245.166:8002/api/shops/${id}/clients`)
      .then(response => response.json())
      .then(data => setClients(data));
  }, [id]);

  const handleDelete = (employeeId: number) => {
    fetch(`http://15.204.245.166:8002/api/shops/employees/${employeeId}`, {
      method: 'DELETE',
    }).then(() => {
      setEmployees((prev) => prev.filter((e) => e.Numero !== employeeId));
    });
  };

  const handleAddEmployee = () => {
    fetch(`http://15.204.245.166:8002/api/shops/${id}/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEmployee),
    })
      .then((response) => response.json())
      .then((newEmp) => {
        setEmployees((prev) => [...prev, newEmp]);
        setShowModal(false);
      });
  };

  return (
    <div>
      {shop && (
        <>
          <h1>{shop.Denominazione}</h1>
          <p>Indirizzo: {shop.IndirizzoSede}</p>
        </>
      )}

      <h2>Dipendenti</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Cognome</th>
            <th>Posizione</th>
            <th>Telefono</th>
            <th>Azioni</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.Numero}>
              <td>{employee.Nome}</td>
              <td>{employee.Cognome}</td>
              <td>{employee.PosizioneLavorativa}</td>
              <td>{employee.NumeroDiTelefono}</td>
              <td>
                <Button
                  variant="danger"
                  onClick={() => handleDelete(employee.Numero)}
                >
                  Licenzia
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      
      <Button onClick={() => setShowModal(true)}>Aggiungi Dipendente</Button>

      <h2 className="mt-4">Clienti del Negozio</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Cognome</th>
            <th>Email</th>
            <th>Telefono</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client.Codice}>
              <td>{client.Nome}</td>
              <td>{client.Cognome}</td>
              <td>{client.Email}</td>
              <td>{client.Telefono}</td>
              <td>
                <Button 
                  variant="primary"
                  href={`/shop/${id}/client/${client.Codice}/orders`}
                >
                  Visualizza Ordini
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>


      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Aggiungi Dipendente</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nome</Form.Label>
              <Form.Control
                type="text"
                value={newEmployee.Nome}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, Nome: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Cognome</Form.Label>
              <Form.Control
                type="text"
                value={newEmployee.Cognome}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, Cognome: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Posizione Lavorativa</Form.Label>
              <Form.Control
                type="text"
                value={newEmployee.PosizioneLavorativa}
                onChange={(e) =>
                  setNewEmployee({
                    ...newEmployee,
                    PosizioneLavorativa: e.target.value,
                  })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Numero di Telefono</Form.Label>
              <Form.Control
                type="text"
                value={newEmployee.NumeroDiTelefono}
                onChange={(e) =>
                  setNewEmployee({
                    ...newEmployee,
                    NumeroDiTelefono: e.target.value,
                  })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Chiudi
          </Button>
          <Button variant="primary" onClick={handleAddEmployee}>
            Aggiungi
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ShopDetails;
