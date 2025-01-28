from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List
from db import get_db_connection

router = APIRouter(
    prefix="/api/magazzini",
    tags=["magazzini"],
    responses={404: {"description": "Magazzino not found"}},
)

# Modello unificato per Magazzino
class Magazzino(BaseModel):
    codice: int = None  # opzionale per la creazione
    indirizzo: str

class QuantitaUpdate(BaseModel):
    codice_magazzino: int
    codice_prodotto: int
    quantita: int

    class Config:
        schema_extra = {
            "example": {
                "codice_magazzino": 1,
                "codice_prodotto": 1,
                "quantita": 10
            }
        }

@router.get("/")
async def get_magazzini(conn=Depends(get_db_connection)):
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM Magazzino;")
        magazzini = cursor.fetchall()
        
        result = [{"codice": m[0], "indirizzo": m[1]} for m in magazzini]
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore interno: {str(e)}")
    finally:
        conn.close()

class MagazzinoCreate(BaseModel):
    indirizzo: str
    negozi: List[int]

@router.post("/add")
async def add_magazzino(magazzino: MagazzinoCreate, conn=Depends(get_db_connection)):
    cursor = conn.cursor()
    try:
        # Inserisce il magazzino
        cursor.execute(
            "INSERT INTO Magazzino (Indirizzo) VALUES (?)", 
            (magazzino.indirizzo,)
        )
        magazzino_id = cursor.lastrowid

        # Crea le relazioni con i negozi
        for negozio_id in magazzino.negozi:
            cursor.execute(
                "INSERT INTO Rifornimento (Magazzino, Negozio) VALUES (?, ?)",
                (magazzino_id, negozio_id)
            )

        conn.commit()
        return {"message": "Magazzino aggiunto con successo", "id": magazzino_id}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/shops")
async def get_shops(conn=Depends(get_db_connection)):
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT Codice, Denominazione FROM Negozio")
        shops = cursor.fetchall()
        return [{"id": s[0], "nome": s[1]} for s in shops]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{codice}")
async def get_magazzino_detail(codice: int, conn=Depends(get_db_connection)):
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT p.Codice, p.Nome, p.Descrizione, s.Quantita 
            FROM Magazzino m 
            JOIN Stoccaggio s ON m.Codice = s.Magazzino 
            JOIN Prodotto p ON s.Prodotto = p.Codice 
            WHERE m.Codice = ?
        """, (codice,))
        prodotti = cursor.fetchall()
        return [{
            "codice": p[0],
            "nome": p[1],
            "descrizione": p[2],
            "quantita": p[3]
        } for p in prodotti]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{codice}")
async def delete_magazzino(codice: int, conn=Depends(get_db_connection)):
    cursor = conn.cursor()
    try:
        # Verifica esistenza magazzino
        cursor.execute("SELECT 1 FROM Magazzino WHERE Codice = ?", (codice,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Magazzino non trovato")

        # Elimina prima le relazioni in Stoccaggio
        cursor.execute("DELETE FROM Stoccaggio WHERE Magazzino = ?", (codice,))
        
        # Elimina il magazzino
        cursor.execute("DELETE FROM Magazzino WHERE Codice = ?", (codice,))
        
        conn.commit()
        return {"message": "Magazzino eliminato con successo"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@router.put("/update-quantity")
async def update_quantity(data: QuantitaUpdate, conn=Depends(get_db_connection)):
    cursor = conn.cursor()
    try:
        # Verifica esistenza del record
        cursor.execute(
            "SELECT 1 FROM Stoccaggio WHERE Magazzino = ? AND Prodotto = ?",
            (data.codice_magazzino, data.codice_prodotto)
        )
        if not cursor.fetchone():
            raise HTTPException(
                status_code=404,
                detail=f"Prodotto {data.codice_prodotto} non trovato nel magazzino {data.codice_magazzino}"
            )

        cursor.execute(
            "UPDATE Stoccaggio SET Quantita = ? WHERE Magazzino = ? AND Prodotto = ?",
            (data.quantita, data.codice_magazzino, data.codice_prodotto)
        )
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=400, detail="Nessun aggiornamento effettuato")
            
        conn.commit()
        return {"message": "Quantità aggiornata con successo"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

