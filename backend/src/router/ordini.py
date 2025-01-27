from fastapi import APIRouter, Depends, HTTPException
from db import get_db_connection

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