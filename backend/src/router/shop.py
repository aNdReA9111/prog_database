from fastapi import APIRouter, Depends, HTTPException
from typing import List
from pydantic import BaseModel
from db import get_db_connection

router = APIRouter(
    prefix="/api/shops",
    tags=["shops"],
    responses={404: {"description": "Shop not found"}},
)

class Shop(BaseModel):
    codice: int
    indirizzo_sede: str
    denominazione: str

@router.get("/", response_model=List[Shop])
async def get_shops(conn=Depends(get_db_connection)):
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT Codice, IndirizzoSede, Denominazione FROM Negozio;")
        print("Ciao")
        shops = cursor.fetchall()

        if not shops:
            raise HTTPException(status_code=404, detail="Nessun negozio trovato")

        return [
            {"codice": row[0], "indirizzo_sede": row[1], "denominazione": row[2]}
            for row in shops
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore interno: {str(e)}")
    finally:
        conn.close()


@router.get("/{shop_id}")
async def get_shop_details(shop_id: int, conn=Depends(get_db_connection)):
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Negozio WHERE Codice = ?", (shop_id,))
    shop = cursor.fetchone()
    if not shop:
        raise HTTPException(status_code=404, detail="Negozio non trovato")
    
    return {"Codice": shop[0], "IndirizzoSede": shop[1], "Denominazione": shop[2]}


@router.get("/{shop_id}/employees")
async def get_employees(shop_id: int, conn=Depends(get_db_connection)):
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Dipendente WHERE Negozio = ?", (shop_id,))
    employees = cursor.fetchall()
    return [
        {
            "Numero": emp[0],
            "Cognome": emp[1],
            "Nome": emp[3],
            "PosizioneLavorativa": emp[4],
            "NumeroDiTelefono": emp[5],
        }
        for emp in employees
    ]


@router.post("/{shop_id}/employees")
async def add_employee(shop_id: int, employee_data: dict, conn=Depends(get_db_connection)):
    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            INSERT INTO Dipendente (Cognome, DataAssunzione, Nome, PosizioneLavorativa, NumeroDiTelefono, Negozio)
            VALUES (?, date('now'), ?, ?, ?, ?)
            """,
            (
                employee_data["Cognome"],
                employee_data["Nome"],
                employee_data["PosizioneLavorativa"],
                employee_data["NumeroDiTelefono"],
                shop_id,
            ),
        )
        conn.commit()
        new_id = cursor.lastrowid
        return {"Numero": new_id, **employee_data}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/employees/{employee_id}")
async def delete_employee(employee_id: int, conn=Depends(get_db_connection)):
    cursor = conn.cursor()
    cursor.execute("DELETE FROM Dipendente WHERE Numero = ?;", (employee_id,))
    conn.commit()
    return {"message": "Dipendente eliminato con successo"}


@router.get("/{shop_id}/clients")
async def get_shop_clients(shop_id: int, conn=Depends(get_db_connection)):
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT DISTINCT c.Codice, cp.Nome, c.Cognome, c.IndirizzoMail, cp.NumeroDiTelefono
            FROM Cliente c
            JOIN Controparte cp ON c.Codice = cp.Codice
            JOIN Vendita v ON c.Codice = v.Cliente
            JOIN Ordine o ON v.Codice = o.Codice
            WHERE o.Negozio = ?
        """, (shop_id,))
        
        clients = cursor.fetchall()
        
        if not clients:
            return []
            
        return [{
            "Codice": client[0],
            "Nome": client[1],
            "Cognome": client[2],
            "Email": client[3],
            "Telefono": client[4]
        } for client in clients]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@router.get("/{shop_id}/clients/{client_id}/orders")
async def get_client_orders(shop_id: int, client_id: int, conn=Depends(get_db_connection)):
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT o.Codice, o.Data, p.Nome, p.Prezzo, cp.Quantità
            FROM Ordine o
            JOIN Vendita v ON o.Codice = v.Codice
            JOIN Composizione cp ON o.Codice = cp.Ordine
            JOIN Prodotto p ON cp.Prodotto = p.Codice
            WHERE o.Negozio = ? AND v.Cliente = ?
        """, (shop_id, client_id))
        
        orders = cursor.fetchall()
        return [{
            "Codice": order[0],
            "Data": order[1],
            "NomeProdotto": order[2],
            "Prezzo": order[3],
            "Quantita": order[4]  # Manteniamo "Quantita" nel JSON per compatibilità frontend
        } for order in orders]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()
        
        
@router.get("/{shop_id}/products")
async def get_shop_products(shop_id: int, conn=Depends(get_db_connection)):
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT DISTINCT p.Codice, p.Nome, p.Prezzo, m.Codice, m.Indirizzo, mag.Quantita
            FROM Prodotto p
            JOIN Stoccaggio mag ON p.Codice = mag.Prodotto
            JOIN Magazzino m ON mag.Magazzino = m.Codice
            JOIN Rifornimento r ON m.Codice = r.Magazzino
            WHERE r.Negozio = ?
        """, (shop_id,))
        
        products = cursor.fetchall()
        return [{
            "Codice": prod[0],
            "Nome": prod[1],
            "Prezzo": prod[2],
            "MagazzinoCodice": prod[3],
            "MagazzinoIndirizzo": prod[4],
            "Quantita": prod[5]
        } for prod in products]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()
        
@router.get("/{shop_id}/employees/{employee_id}/orders")
async def get_employee_orders(shop_id: int, employee_id: int, conn=Depends(get_db_connection)):
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT o.Codice, o.Data, p.Nome as Prodotto, p.Prezzo, cp.Quantità,
                   c.Nome as Cliente, cl.Cognome as CognomeCliente,
                   COALESCE(f.Importo, p.Prezzo * cp.Quantità) as Importo, 
                   COALESCE(f.Iva, 22) as Iva
            FROM Ordine o
            JOIN Vendita v ON o.Codice = v.Codice
            JOIN Composizione cp ON o.Codice = cp.Ordine
            JOIN Prodotto p ON cp.Prodotto = p.Codice
            JOIN Cliente cl ON v.Cliente = cl.Codice
            JOIN Controparte c ON cl.Codice = c.Codice
            LEFT JOIN Fattura f ON v.Fattura = f.NumeroFattura
            WHERE o.Negozio = ? AND v.Responsabile = ?
        """, (shop_id, employee_id))
        
        orders = cursor.fetchall()
        return [{
            "Codice": order[0],
            "Data": order[1],
            "Prodotto": order[2],
            "Prezzo": float(order[3]),
            "Quantita": order[4],
            "Cliente": f"{order[5]} {order[6]}",
            "Importo": float(order[7]),
            "Iva": float(order[8])
        } for order in orders]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()