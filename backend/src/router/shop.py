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