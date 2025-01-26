import ProductsForm from '../components/ProductsForm';

function Products() {
  // const products = [
  //   { id: 1, name: "Prodotto 1", price: 99.99 },
  //   { id: 2, name: "Prodotto 2", price: 149.99 },
  //   { id: 3, name: "Prodotto 3", price: 199.99 }
  // ];

  return (
    <>
      {/* <h2>I Nostri Prodotti</h2>
      <Row xs={1} md={3} className="g-4">
        {products.map(product => (
          <Col key={product.id}>
            <Card>
              <Card.Body>
                <Card.Title>{product.name}</Card.Title>
                <Card.Text>Prezzo: €{product.price}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row> */}

      <h2>Inserisci prodotto</h2>
      < ProductsForm />


    </>
  );
}

export default Products;