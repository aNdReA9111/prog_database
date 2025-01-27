import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar, Container, Nav } from 'react-bootstrap';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ShopDetails from './pages/ShopDetails';
import Magazzini from './pages/Magazzini';
import MagazzinoDetail from './pages/MagazzinoDetails';
import Products from './pages/Products';
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
          </Nav>
        </Container>
      </Navbar>

      <Container className="mt-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/:id" element={<ShopDetails />} /> 
          <Route path="/magazzino" element={<Magazzini />} />
          <Route path="/magazzino/:codice" element={<MagazzinoDetail />} />
          <Route path="/products" element={<Products />} />
        </Routes>
      </Container>
    </BrowserRouter>
  );
}

export default App;
