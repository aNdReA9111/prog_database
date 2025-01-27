from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from db import get_db_connection

router = APIRouter(
    prefix="/api/controparti",
    tags=["controparti"],
)

class ControparteBase(BaseModel):
    nome: str
    indirizzo: str
    numeroDiTelefono: str

class Cliente(ControparteBase):
    indirizzoMail: str
    cognome: str

class Fornitore(ControparteBase):
    pass

@router.post("/add/{tipo}")
async def add_controparte(tipo: str, data: dict, conn=Depends(get_db_connection)):
    cursor = conn.cursor()
    try:
        # Inserisci prima nella tabella Controparte
        cursor.execute(
            """
            INSERT INTO Controparte (Nome, Indirizzo, NumeroDiTelefono)
            VALUES (?, ?, ?)
            """,
            (data["nome"], data["indirizzo"], data["numeroDiTelefono"])
        )
        
        codice = cursor.lastrowid

        if tipo == "cliente":
            cursor.execute(
                """
                INSERT INTO Cliente (Codice, IndirizzoMail, Cognome)
                VALUES (?, ?, ?)
                """,
                (codice, data["indirizzoMail"], data["cognome"])
            )
        elif tipo == "fornitore":
            cursor.execute(
                """
                INSERT INTO Fornitore (Codice)
                VALUES (?)
                """,
                (codice,)
            )
        
        conn.commit()
        return {"message": f"{tipo.capitalize()} aggiunto con successo", "codice": codice}
    
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()