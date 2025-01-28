from fastapi import APIRouter, Depends, HTTPException
from db import get_db_connection
from pydantic import BaseModel
from typing import List

router = APIRouter(
    prefix="/api/orders",
    tags=["orders"]
)

@router.get("/categories/{category}")
async def get_category_orders(category: str, conn=Depends(get_db_connection)):
    cursor = conn.cursor()
    try:
        query_map = {
            "video_cards": """
                SELECT p.Codice, p.Nome, p.Prezzo, sv.Marca, sv.Modello, 
                       sv.TipoDiMemoria, sv.QuantitàDiMemoria, sv.NumeroDiPorte,
                       sv.PotenzaNecessaria, sv.Compatibilità,
                       COALESCE(SUM(CASE 
                           WHEN a.Codice IS NOT NULL THEN cp.Quantità * p.Prezzo
                           ELSE 0
                       END), 0) as TotaleAcquisti,
                       COALESCE(SUM(CASE 
                           WHEN v.Codice IS NOT NULL THEN cp.Quantità * p.Prezzo
                           ELSE 0
                       END), 0) as TotaleVendite
                FROM Prodotto p
                JOIN SchedeVideo sv ON p.Codice = sv.Codice
                LEFT JOIN Composizione cp ON p.Codice = cp.Prodotto
                LEFT JOIN Ordine o ON cp.Ordine = o.Codice
                LEFT JOIN Acquisto a ON o.Codice = a.Codice
                LEFT JOIN Vendita v ON o.Codice = v.Codice
                GROUP BY p.Codice, sv.Marca, sv.Modello, sv.TipoDiMemoria, 
                         sv.QuantitàDiMemoria, sv.NumeroDiPorte, sv.PotenzaNecessaria, 
                         sv.Compatibilità
            """,
            "ram": """
                SELECT p.Codice, p.Nome, p.Prezzo, r.Tecnologia, r.Capacità,
                       r.Velocità, r.TensioneOperativa, r.Latenza,
                       COALESCE(SUM(CASE 
                           WHEN a.Codice IS NOT NULL THEN cp.Quantità * p.Prezzo
                           ELSE 0
                       END), 0) as TotaleAcquisti,
                       COALESCE(SUM(CASE 
                           WHEN v.Codice IS NOT NULL THEN cp.Quantità * p.Prezzo
                           ELSE 0
                       END), 0) as TotaleVendite
                FROM Prodotto p
                JOIN RAM r ON p.Codice = r.Codice
                LEFT JOIN Composizione cp ON p.Codice = cp.Prodotto
                LEFT JOIN Ordine o ON cp.Ordine = o.Codice
                LEFT JOIN Acquisto a ON o.Codice = a.Codice
                LEFT JOIN Vendita v ON o.Codice = v.Codice
                GROUP BY p.Codice, r.Tecnologia, r.Capacità, r.Velocità, 
                         r.TensioneOperativa, r.Latenza
            """,
            "processors": """
                SELECT p.Codice, p.Nome, p.Prezzo, pr.Architettura, pr.NumeroDiCore,
                       pr.FrequenzaBase, pr.FrequenzaBoost, pr.Cache,
                       pr.CompatibilitàConSocket,
                       COALESCE(SUM(CASE 
                           WHEN a.Codice IS NOT NULL THEN cp.Quantità * p.Prezzo
                           ELSE 0
                       END), 0) as TotaleAcquisti,
                       COALESCE(SUM(CASE 
                           WHEN v.Codice IS NOT NULL THEN cp.Quantità * p.Prezzo
                           ELSE 0
                       END), 0) as TotaleVendite
                FROM Prodotto p
                JOIN Processore pr ON p.Codice = pr.Codice
                LEFT JOIN Composizione cp ON p.Codice = cp.Prodotto
                LEFT JOIN Ordine o ON cp.Ordine = o.Codice
                LEFT JOIN Acquisto a ON o.Codice = a.Codice
                LEFT JOIN Vendita v ON o.Codice = v.Codice
                GROUP BY p.Codice, pr.Architettura, pr.NumeroDiCore, pr.FrequenzaBase,
                         pr.FrequenzaBoost, pr.Cache, pr.CompatibilitàConSocket
            """,
            "motherboards": """
                SELECT p.Codice, p.Nome, p.Prezzo, sm.TipoDiSocket, sm.Chipset,
                       sm.Formato, sm.NumeroDiSlotRAM, sm.NumeroDiPortePCIe,
                       sm.SupportoPerVelocitàRAM, sm.Connettività,
                       COALESCE(SUM(CASE 
                           WHEN a.Codice IS NOT NULL THEN cp.Quantità * p.Prezzo
                           ELSE 0
                       END), 0) as TotaleAcquisti,
                       COALESCE(SUM(CASE 
                           WHEN v.Codice IS NOT NULL THEN cp.Quantità * p.Prezzo
                           ELSE 0
                       END), 0) as TotaleVendite
                FROM Prodotto p
                JOIN SchedaMadre sm ON p.Codice = sm.Codice
                LEFT JOIN Composizione cp ON p.Codice = cp.Prodotto
                LEFT JOIN Ordine o ON cp.Ordine = o.Codice
                LEFT JOIN Acquisto a ON o.Codice = a.Codice
                LEFT JOIN Vendita v ON o.Codice = v.Codice
                GROUP BY p.Codice, sm.TipoDiSocket, sm.Chipset, sm.Formato,
                         sm.NumeroDiSlotRAM, sm.NumeroDiPortePCIe, 
                         sm.SupportoPerVelocitàRAM, sm.Connettività
            """,
            "storage": """
                SELECT p.Codice, p.Nome, p.Prezzo, ma.Tipo, ma.Capacità,
                       ma.VelocitàRW, ma.Interfaccia,
                       COALESCE(SUM(CASE 
                           WHEN a.Codice IS NOT NULL THEN cp.Quantità * p.Prezzo
                           ELSE 0
                       END), 0) as TotaleAcquisti,
                       COALESCE(SUM(CASE 
                           WHEN v.Codice IS NOT NULL THEN cp.Quantità * p.Prezzo
                           ELSE 0
                       END), 0) as TotaleVendite
                FROM Prodotto p
                JOIN MemoriaArchiviazione ma ON p.Codice = ma.Codice
                LEFT JOIN Composizione cp ON p.Codice = cp.Prodotto
                LEFT JOIN Ordine o ON cp.Ordine = o.Codice
                LEFT JOIN Acquisto a ON o.Codice = a.Codice
                LEFT JOIN Vendita v ON o.Codice = v.Codice
                GROUP BY p.Codice, ma.Tipo, ma.Capacità, ma.VelocitàRW, ma.Interfaccia
            """
        }
        
        if category not in query_map:
            raise HTTPException(status_code=404, detail="Categoria non trovata")
            
        cursor.execute(query_map[category])
        columns = [column[0] for column in cursor.description]
        results = []
        for row in cursor.fetchall():
            results.append(dict(zip(columns, row)))
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@router.get("/suppliers")
async def get_suppliers(conn=Depends(get_db_connection)):
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT f.Codice, c.Nome, c.Indirizzo, c.NumeroDiTelefono
            FROM Fornitore f
            JOIN Controparte c ON f.Codice = c.Codice
        """)
        suppliers = cursor.fetchall()
        return [{"Codice": s[0], "Nome": s[1], "Indirizzo": s[2], "Telefono": s[3]} for s in suppliers]
    finally:
        conn.close()

@router.get("/suppliers/{supplier_id}/products")
async def get_supplier_products(supplier_id: int, conn=Depends(get_db_connection)):
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT p.Codice, p.Nome, p.Descrizione, p.Prezzo
            FROM Prodotto p
            JOIN Disponibilità d ON p.Codice = d.Prodotto
            WHERE d.Fornitore = ?
        """, (supplier_id,))
        products = cursor.fetchall()
        return [{"Codice": p[0], "Nome": p[1], "Descrizione": p[2], "Prezzo": p[3]} for p in products]
    finally:
        conn.close()

@router.get("/warehouses")
async def get_warehouses(conn=Depends(get_db_connection)):
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT Codice, Indirizzo FROM Magazzino")
        warehouses = cursor.fetchall()
        return [{"Codice": w[0], "Indirizzo": w[1]} for w in warehouses]
    finally:
        conn.close()

class ProductOrder(BaseModel):
    Codice: int
    Quantita: int

class PurchaseOrder(BaseModel):
    shop_id: int
    supplier_id: int
    warehouse_id: int
    products: List[ProductOrder]

@router.post("/purchase")
async def create_purchase_order(order: PurchaseOrder, conn=Depends(get_db_connection)):
    cursor = conn.cursor()
    try:
        cursor.execute("BEGIN TRANSACTION;")
        cursor.execute(
            "INSERT INTO Ordine (Data, Negozio) VALUES (date('now'), ?)",
            (order.shop_id,)
        )
        order_id = cursor.lastrowid

        cursor.execute("""
            INSERT INTO Acquisto (Codice, DataDiConsegna, Stato, Fornitore)
            VALUES (?, date('now', '+7 days'), 'In elaborazione', ?)
        """, (order_id, order.supplier_id))

        for product in order.products:
            if product.Quantita <= 0:
                continue

            cursor.execute("""
                INSERT INTO Composizione (Ordine, Prodotto, Quantità)
                VALUES (?, ?, ?)
            """, (order_id, product.Codice, product.Quantita))

            cursor.execute("""
                SELECT Quantita FROM Stoccaggio 
                WHERE Magazzino = ? AND Prodotto = ?
            """, (order.warehouse_id, product.Codice))
            
            existing = cursor.fetchone()
            
            if existing:
                cursor.execute("""
                    UPDATE Stoccaggio 
                    SET Quantita = Quantita + ? 
                    WHERE Magazzino = ? AND Prodotto = ?
                """, (product.Quantita, order.warehouse_id, product.Codice))
            else:
                cursor.execute("""
                    INSERT INTO Stoccaggio (Magazzino, Prodotto, Quantita)
                    VALUES (?, ?, ?)
                """, (order.warehouse_id, product.Codice, product.Quantita))

        conn.commit()
        return {"message": "Ordine creato con successo", "order_id": order_id}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()