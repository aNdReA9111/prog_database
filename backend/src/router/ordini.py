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

@router.get("/shops/{shop_id}/available-products")
async def get_shop_available_products(shop_id: int, conn=Depends(get_db_connection)):
    cursor = conn.cursor()
    try:
        cursor.execute("""
            WITH MagazziniNegozio AS (
                SELECT DISTINCT m.Codice 
                FROM Magazzino m
                JOIN Rifornimento r ON m.Codice = r.Magazzino
                WHERE r.Negozio = ?
            )
            SELECT 
                p.Codice,
                p.Nome,
                p.Descrizione,
                p.Prezzo,
                SUM(s.Quantita) as QuantitàTotale,
                GROUP_CONCAT(s.Magazzino || ':' || s.Quantita) as DistribuzioneMagazzini
            FROM Prodotto p
            JOIN Stoccaggio s ON p.Codice = s.Prodotto
            WHERE s.Magazzino IN (SELECT Codice FROM MagazziniNegozio)
            GROUP BY p.Codice
            HAVING QuantitàTotale > 0
        """, (shop_id,))
        return [dict(zip(['Codice', 'Nome', 'Descrizione', 'Prezzo', 'QuantitaDisponibile', 'DistribuzioneMagazzini'], row)) 
                for row in cursor.fetchall()]
    finally:
        conn.close()

@router.get("/clients")
async def get_clients(conn=Depends(get_db_connection)):
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT c.Codice, cp.Nome, c.Cognome, cp.Indirizzo, c.IndirizzoMail
            FROM Cliente c
            JOIN Controparte cp ON c.Codice = cp.Codice
        """)
        return [dict(zip(['Codice', 'Nome', 'Cognome', 'Indirizzo', 'Email'], row)) 
                for row in cursor.fetchall()]
    finally:
        conn.close()

import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ProductSale(BaseModel):
    Codice: int
    Quantita: int
    DistribuzioneMagazzini: str

class SaleOrder(BaseModel):
    shop_id: int
    client_id: int
    products: List[ProductSale]
    employee_id: int

@router.post("/sale")
async def create_sale_order(order: SaleOrder, conn=Depends(get_db_connection)):
    cursor = conn.cursor()
    try:
        logger.info(f"Creazione vendita per cliente {order.client_id} in negozio {order.shop_id}")
        cursor.execute("BEGIN TRANSACTION")

        # Crea ordine
        cursor.execute(
            "INSERT INTO Ordine (Data, Negozio) VALUES (date('now'), ?)",
            (order.shop_id,)
        )
        order_id = cursor.lastrowid
        logger.info(f"Ordine creato con ID: {order_id}")

        # Crea vendita con tutti i campi richiesti
        cursor.execute("""
            INSERT INTO Vendita (Codice, Cliente, Responsabile)
            VALUES (?, ?, ?)
        """, (order_id, order.client_id, order.employee_id))
        logger.info(f"Vendita creata per ordine {order_id}")

        # Gestisci prodotti
        for product in order.products:
            logger.info(f"Processando prodotto {product.Codice}, quantità {product.Quantita}")
            cursor.execute("""
                INSERT INTO Composizione (Ordine, Prodotto, Quantità)
                VALUES (?, ?, ?)
            """, (order_id, product.Codice, product.Quantita))

            # Aggiorna magazzini
            magazzini = dict(m.split(':') for m in product.DistribuzioneMagazzini.split(','))
            quantita_rimanente = product.Quantita

            for magazzino_id, quantita_disponibile in magazzini.items():
                quantita_da_rimuovere = min(int(quantita_disponibile), quantita_rimanente)
                
                cursor.execute("""
                    UPDATE Stoccaggio
                    SET Quantita = Quantita - ?
                    WHERE Magazzino = ? AND Prodotto = ?
                """, (quantita_da_rimuovere, magazzino_id, product.Codice))
                
                logger.info(f"Rimosso {quantita_da_rimuovere} dal magazzino {magazzino_id}")
                quantita_rimanente -= quantita_da_rimuovere
                if quantita_rimanente == 0:
                    break

        conn.commit()
        logger.info("Transazione completata con successo")
        return {"message": "Vendita creata con successo", "order_id": order_id}
    except Exception as e:
        logger.error(f"Errore durante la creazione della vendita: {str(e)}")
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()
        
@router.get("/shops")
async def get_shops(conn=Depends(get_db_connection)):
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT Codice, Denominazione, IndirizzoSede
            FROM Negozio
        """)
        return [dict(zip(['Codice', 'Denominazione', 'Indirizzo'], row)) 
                for row in cursor.fetchall()]
    finally:
        conn.close()
        
@router.get("/shops/{shop_id}/employees")
async def get_shop_employees(shop_id: int, conn=Depends(get_db_connection)):
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT Numero, Nome, Cognome, PosizioneLavorativa
            FROM Dipendente
            WHERE Negozio = ?
        """, (shop_id,))
        return [dict(zip(['Numero', 'Nome', 'Cognome', 'Posizione'], row)) 
                for row in cursor.fetchall()]
    finally:
        conn.close()