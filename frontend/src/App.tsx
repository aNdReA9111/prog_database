import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar, Container, Nav } from 'react-bootstrap';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ShopDetails from './pages/ShopDetails';
import Magazzini from './pages/Magazzini';
import MagazzinoDetail from './pages/MagazzinoDetails';
import Products from './pages/Products';
import Controparte from './pages/Controparte';
import OrdiniVenditaCliente from './pages/OrdiniVenditaCliente';
import ShopProducts from './pages/ShopProducts';
import Ordini from './pages/Ordini';
import OrdiniDipendente from './pages/OrdiniDipendente';
import SimulazioneOrdiniAcquisto from './pages/SimulazioneOrdiniAcquisto';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <BrowserRouter>
      <Navbar bg="light" expand="lg">
        <Container>
          <Navbar.Brand href="/">E-Shop</Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link href="/">Home</Nav.Link>
            <Nav.Link href="/shop">Negozi</Nav.Link>
            <Nav.Link href="/magazzino">Magazzini</Nav.Link>
            <Nav.Link href="/products">Prodotti</Nav.Link>
            <Nav.Link href="/controparti">Controparti</Nav.Link>

            <Nav.Link href="/ordini">Analisi Ordini</Nav.Link>
            <Nav.Link href="/simulazioneOrdini">Simulazione Ordini Acquisto</Nav.Link>
          </Nav>
        </Container>
      </Navbar>

      <Container className="mt-4">
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/:shopId/products" element={<ShopProducts />} />
          <Route path="/shop/:id" element={<ShopDetails />} /> 
          <Route path="/shop/:shopId/client/:clientId/orders" element={<OrdiniVenditaCliente />} />
          <Route path="/shop/:shopId/employee/:employeeId/orders" element={<OrdiniDipendente />} />

          <Route path="/magazzino" element={<Magazzini />} />
          <Route path="/magazzino/:codice" element={<MagazzinoDetail />} />

          <Route path="/products" element={<Products />} />
          <Route path="/controparti" element={<Controparte />} />
          <Route path="/ordini" element={<Ordini />} />
          <Route path="/simulazioneOrdini" element={<SimulazioneOrdiniAcquisto />} />


        </Routes>
      </Container>
    </BrowserRouter>
  );
}

export default App;
