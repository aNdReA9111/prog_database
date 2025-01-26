from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from enum import Enum
from typing import Optional
from db import get_db_connection

router = APIRouter(
    prefix="/api/products",
    tags=["products"],
    responses={404: {"description": "Product not found"}},
)

class Categoria(str, Enum):
    schede_video = "SchedeVideo"
    ram = "RAM"
    processore = "Processore"
    scheda_madre = "SchedaMadre"
    memoria_archiviazione = "MemoriaArchiviazione"

class ProductBase(BaseModel):
    nome: str
    descrizione: str
    prezzo: float

class ProductSchedeVideo(ProductBase):
    marca: str
    modello: str
    tipo_memoria: str
    quantita_memoria: str
    numero_porte: int
    potenza_necessaria: float
    compatibilita: str

class ProductRAM(ProductBase):
    tecnologia: str
    capacita: str
    velocita: str
    tensione_operativa: str
    latenza: str

class ProductProcessore(ProductBase):
    architettura: str
    numero_core: int
    frequenza_base: float
    frequenza_boost: Optional[float]
    cache: str
    compatibilita_socket: str

class ProductSchedaMadre(ProductBase):
    tipo_socket: str
    chipset: str
    formato: str
    numero_slot_ram: int
    numero_porte_pcie: int
    supporto_velocita_ram: str
    connettivita: str

class ProductMemoriaArchiviazione(ProductBase):
    tipo: str
    capacita_memoria: str
    velocita_rw: str
    interfaccia: str

@router.post("/add/{categoria}")
async def add_product(
    categoria: Categoria,
    product_data: dict,
    conn=Depends(get_db_connection)
):
    cursor = conn.cursor()
    try:
        # Inserimento base
        cursor.execute(
            '''
            INSERT INTO Prodotto (Nome, Descrizione, Prezzo)
            VALUES (?, ?, ?)
            ''',
            (product_data["nome"], product_data["descrizione"], product_data["prezzo"])
        )
        product_id = cursor.lastrowid

        # Inserimento specifico
        if categoria == Categoria.schede_video:
            cursor.execute(
                '''
                INSERT INTO SchedeVideo (
                    Codice, Marca, Modello, TipoDiMemoria,
                    QuantitàDiMemoria, NumeroDiPorte, 
                    PotenzaNecessaria, Compatibilità
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''',
                (
                    product_id, product_data["marca"], product_data["modello"],
                    product_data["tipo_memoria"], product_data["quantita_memoria"],
                    product_data["numero_porte"], product_data["potenza_necessaria"],
                    product_data["compatibilita"]
                )
            )
        elif categoria == Categoria.ram:
            cursor.execute(
                '''
                INSERT INTO RAM (
                    Codice, Tecnologia, Capacità, Velocità,
                    TensioneOperativa, Latenza
                ) VALUES (?, ?, ?, ?, ?, ?)
                ''',
                (
                    product_id, product_data["tecnologia"], 
                    product_data["capacita"], product_data["velocita"], 
                    product_data["tensione_operativa"], product_data["latenza"]
                )
            )

        elif categoria == Categoria.processore:
            cursor.execute(
                '''
                INSERT INTO Processore (
                    Codice, Architettura, NumeroDiCore,
                    FrequenzaBase, FrequenzaBoost, Cache,
                    CompatibilitàConSocket
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
                ''',
                (
                    product_id, product_data["architettura"], 
                    product_data["numero_core"], product_data["frequenza_base"], 
                    product_data.get("frequenza_boost"),  # Campo opzionale
                    product_data["cache"], product_data["compatibilita_socket"]
                )
            )

        elif categoria == Categoria.scheda_madre:
            cursor.execute(
                '''
                INSERT INTO SchedaMadre (
                    Codice, TipoDiSocket, Chipset, Formato,
                    NumeroDiSlotRAM, NumeroDiPortePCIe,
                    SupportoPerVelocitàRAM, Connettività
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''',
                (
                    product_id, product_data["tipo_socket"], 
                    product_data["chipset"], product_data["formato"], 
                    product_data["numero_slot_ram"], product_data["numero_porte_pcie"], 
                    product_data["supporto_velocita_ram"], product_data["connettivita"]
                )
            )

        elif categoria == Categoria.memoria_archiviazione:
            cursor.execute(
                '''
                INSERT INTO MemoriaArchiviazione (
                    Codice, Tipo, Capacità, VelocitàRW, Interfaccia
                ) VALUES (?, ?, ?, ?, ?)
                ''',
                (
                    product_id, product_data["tipo"], 
                    product_data["capacita_memoria"], product_data["velocita_rw"], 
                    product_data["interfaccia"]
                )
            )


        conn.commit()
        response = {"message": "Prodotto inserito con successo", "id": product_id}
        return {
            "body": response,
            "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
            }
        }
    except KeyError as e:
        conn.rollback()
        raise HTTPException(
            status_code=400, detail=f"Campo mancante: {e.args[0]}"
        )
    except Exception as e:
        conn.rollback()
        raise HTTPException(
            status_code=500, detail=f"Errore interno: {str(e)}"
        )
    finally:
        conn.close()
