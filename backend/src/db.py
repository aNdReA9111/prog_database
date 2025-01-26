import sqlite3
from dotenv import load_dotenv
import os
from threading import Lock

# Load environment variables from the .env file located in the parent directory
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

# Get the database URL from the environment variables
DATABASE_URL_DEV = os.getenv("DATABASE_URL_DEV")

# class DatabaseConnection:
#     _instance = None
#     _lock = Lock()
#     _connection = None
#     _initialized = False

#     def __new__(cls):
#         if cls._instance is None:
#             with cls._lock:
#                 if cls._instance is None:
#                     cls._instance = super().__new__(cls)
#                     #cls._instance._initialize_db()
#         return cls._instance

#     def _initialize_db(self):
#         if not self._initialized:
#             with self as conn:
#                 cursor = conn.cursor()
#                 cursor.execute('''
#                     BEGIN TRANSACTION;
#                     CREATE TABLE IF NOT EXISTS Negozio (
#                         CodiceIdentificativo INTEGER PRIMARY KEY AUTOINCREMENT,
#                         IndirizzoSede TEXT NOT NULL,
#                         Denominazione TEXT NOT NULL
#                     );
#                     CREATE TABLE IF NOT EXISTS Prodotto (
#                         Codice INTEGER PRIMARY KEY AUTOINCREMENT,
#                         Nome TEXT NOT NULL,
#                         Descrizione TEXT NOT NULL,
#                         Prezzo REAL NOT NULL
#                     );
#                     CREATE TABLE IF NOT EXISTS SchedeVideo (
#                         Codice INTEGER PRIMARY KEY,
#                         Marca TEXT NOT NULL,
#                         Modello TEXT NOT NULL,
#                         TipoDiMemoria TEXT NOT NULL,
#                         QuantitàDiMemoria INTEGER NOT NULL,
#                         NumeroDiPorte INTEGER NOT NULL,
#                         PotenzaNecessaria INTEGER NOT NULL,
#                         Compatibilità TEXT NOT NULL,
#                         FOREIGN KEY (Codice) REFERENCES Prodotto(Codice) ON DELETE CASCADE
#                     );
#                     CREATE TABLE IF NOT EXISTS RAM (
#                         Codice INTEGER PRIMARY KEY,
#                         Tecnologia TEXT NOT NULL,
#                         Capacità INTEGER NOT NULL,
#                         Velocità INTEGER NOT NULL,
#                         TensioneOperativa REAL NOT NULL,
#                         Latenza REAL NOT NULL,
#                         FOREIGN KEY (Codice) REFERENCES Prodotto(Codice) ON DELETE CASCADE
#                     );
#                     CREATE TABLE IF NOT EXISTS Processore (
#                         Codice INTEGER PRIMARY KEY,
#                         Architettura TEXT NOT NULL,
#                         NumeroDiCore INTEGER NOT NULL,
#                         FrequenzaBase REAL NOT NULL,
#                         FrequenzaBoost REAL NOT NULL,
#                         Cache INTEGER NOT NULL,
#                         CompatibilitàConSocket TEXT NOT NULL,
#                         FOREIGN KEY (Codice) REFERENCES Prodotto(Codice) ON DELETE CASCADE
#                     );
#                     CREATE TABLE IF NOT EXISTS SchedaMadre (
#                         Codice INTEGER PRIMARY KEY,
#                         TipoDiSocket TEXT NOT NULL,
#                         Chipset TEXT NOT NULL,
#                         Formato TEXT NOT NULL,
#                         NumeroDiSlotRAM INTEGER NOT NULL,
#                         NumeroDiPortePCIe INTEGER NOT NULL,
#                         SupportoPerVelocitàRAM INTEGER NOT NULL,
#                         Connettività TEXT NOT NULL,
#                         FOREIGN KEY (Codice) REFERENCES Prodotto(Codice) ON DELETE CASCADE
#                     );
#                     CREATE TABLE IF NOT EXISTS MemoriaArchiviazione (
#                         Codice INTEGER PRIMARY KEY,
#                         Tipo TEXT NOT NULL,
#                         Capacità INTEGER NOT NULL,
#                         VelocitàRW REAL NOT NULL,
#                         Interfaccia TEXT NOT NULL,
#                         FOREIGN KEY (Codice) REFERENCES Prodotto(Codice) ON DELETE CASCADE
#                     );
#                     CREATE TABLE IF NOT EXISTS Fattura (
#                         NumeroFattura INTEGER PRIMARY KEY AUTOINCREMENT,
#                         Importo REAL NOT NULL,
#                         Iva REAL NOT NULL,
#                         MetodoPagamento TEXT NOT NULL,
#                         DataEmissione TEXT NOT NULL
#                     );
#                     CREATE TABLE IF NOT EXISTS Reso (
#                         Codice INTEGER PRIMARY KEY AUTOINCREMENT,
#                         Motivazione TEXT NOT NULL,
#                         Stato TEXT NOT NULL,
#                         Modalità TEXT NOT NULL
#                     );
#                     CREATE TABLE IF NOT EXISTS Dipendente (
#                         NumeroMatricola INTEGER PRIMARY KEY AUTOINCREMENT,
#                         Cognome TEXT NOT NULL,
#                         DataAssunzione TEXT NOT NULL,
#                         Nome TEXT NOT NULL,
#                         PosizioneLavorativa TEXT NOT NULL,
#                         NumeroDiTelefono TEXT NOT NULL
#                     );
#                     CREATE TABLE IF NOT EXISTS Magazzino (
#                         CodiceMagazzino INTEGER PRIMARY KEY AUTOINCREMENT,
#                         IndirizzoMagazzino TEXT NOT NULL
#                     );
#                     CREATE TABLE IF NOT EXISTS Controparte (
#                         Codice INTEGER PRIMARY KEY AUTOINCREMENT,
#                         Nome TEXT NOT NULL,
#                         Indirizzo TEXT NOT NULL,
#                         NumeroDiTelefono TEXT NOT NULL
#                     );
#                     CREATE TABLE IF NOT EXISTS Fornitore (
#                         Codice INTEGER PRIMARY KEY,
#                         FOREIGN KEY (Codice) REFERENCES Controparte(Codice) ON DELETE CASCADE
#                     );
#                     CREATE TABLE IF NOT EXISTS Cliente (
#                         Codice INTEGER PRIMARY KEY,
#                         IndirizzoMail TEXT NOT NULL,
#                         Cognome TEXT NOT NULL,
#                         FOREIGN KEY (Codice) REFERENCES Controparte(Codice) ON DELETE CASCADE
#                     );
#                     CREATE TABLE IF NOT EXISTS Ordine (
#                         Codice INTEGER PRIMARY KEY AUTOINCREMENT,
#                         Data TEXT NOT NULL
#                     );
#                     CREATE TABLE IF NOT EXISTS Acquisto (
#                         Codice INTEGER PRIMARY KEY,
#                         DataDiConsegna TEXT NOT NULL,
#                         Stato TEXT NOT NULL,
#                         FOREIGN KEY (Codice) REFERENCES Ordine(Codice) ON DELETE CASCADE
#                     );
#                     CREATE TABLE IF NOT EXISTS Vendita (
#                         Codice INTEGER PRIMARY KEY,
#                         ImportoTotale REAL NOT NULL,
#                         MetodoDiPagamento TEXT NOT NULL,
#                         FOREIGN KEY (Codice) REFERENCES Ordine(Codice) ON DELETE CASCADE
#                     );

#                     -- Tabelle per le relazioni
#                     CREATE TABLE IF NOT EXISTS Stoccaggio (
#                         Magazzino INTEGER,
#                         Prodotto INTEGER,
#                         PRIMARY KEY (Magazzino, Prodotto),
#                         FOREIGN KEY (Magazzino) REFERENCES Magazzino(CodiceMagazzino),
#                         FOREIGN KEY (Prodotto) REFERENCES Prodotto(Codice)
#                     );
#                     CREATE TABLE IF NOT EXISTS Rifornimento (
#                         Magazzino INTEGER,
#                         Negozio INTEGER,
#                         PRIMARY KEY (Magazzino, Negozio),
#                         FOREIGN KEY (Magazzino) REFERENCES Magazzino(CodiceMagazzino),
#                         FOREIGN KEY (Negozio) REFERENCES Negozio(CodiceIdentificativo)
#                     );
#                     CREATE TABLE IF NOT EXISTS Emissione (
#                         Negozio INTEGER,
#                         Ordine INTEGER,
#                         PRIMARY KEY (Negozio, Ordine),
#                         FOREIGN KEY (Negozio) REFERENCES Negozio(Codice),
#                         FOREIGN KEY (Ordine) REFERENCES Ordine(Codice)
#                     );
#                     CREATE TABLE IF NOT EXISTS Composizione (
#                         Ordine INTEGER,
#                         Prodotto INTEGER,
#                         PRIMARY KEY (Ordine, Prodotto),
#                         FOREIGN KEY (Ordine) REFERENCES Ordine(Codice),
#                         FOREIGN KEY (Prodotto) REFERENCES Prodotto(Codice)
#                     );
#                     CREATE TABLE IF NOT EXISTS Lavoro (
#                         Dipendente INTEGER,
#                         Negozio INTEGER,
#                         PRIMARY KEY (Dipendente, Negozio),
#                         FOREIGN KEY (Dipendente) REFERENCES Dipendente(NumeroMatricola),
#                         FOREIGN KEY (Negozio) REFERENCES Negozio(CodiceIdentificativo)
#                     );
#                     CREATE TABLE IF NOT EXISTS Responsabile (
#                         Dipendente INTEGER,
#                         Vendita INTEGER,
#                         PRIMARY KEY (Dipendente, Vendita),
#                         FOREIGN KEY (Dipendente) REFERENCES Dipendente(NumeroMatricola),
#                         FOREIGN KEY (Vendita) REFERENCES Vendita(Codice)
#                     );
#                     CREATE TABLE IF NOT EXISTS Conferma (
#                         Fattura INTEGER,
#                         Vendita INTEGER,
#                         PRIMARY KEY (Fattura, Vendita),
#                         FOREIGN KEY (Fattura) REFERENCES Fattura(NumeroFattura),
#                         FOREIGN KEY (Vendita) REFERENCES Vendita(Codice)
#                     );
#                     CREATE TABLE IF NOT EXISTS Inclusione (
#                         Fattura INTEGER,
#                         Prodotto INTEGER,
#                         PRIMARY KEY (Fattura, Prodotto),
#                         FOREIGN KEY (Fattura) REFERENCES Fattura(NumeroFattura),
#                         FOREIGN KEY (Prodotto) REFERENCES Prodotto(Codice)
#                     );
#                     CREATE TABLE IF NOT EXISTS Rilascio (
#                         Cliente INTEGER,
#                         Fattura INTEGER,
#                         PRIMARY KEY (Cliente, Fattura),
#                         FOREIGN KEY (Cliente) REFERENCES Cliente(Codice),
#                         FOREIGN KEY (Fattura) REFERENCES Fattura(NumeroFattura)
#                     );
#                     CREATE TABLE IF NOT EXISTS Stipulazione (
#                         Cliente INTEGER,
#                         Vendita INTEGER,
#                         PRIMARY KEY (Cliente, Vendita),
#                         FOREIGN KEY (Cliente) REFERENCES Cliente(Codice),
#                         FOREIGN KEY (Vendita) REFERENCES Vendita(Codice)
#                     );
#                     CREATE TABLE IF NOT EXISTS Trattativa (
#                         Fornitore INTEGER,
#                         Acquisto INTEGER,
#                         PRIMARY KEY (Fornitore, Acquisto),
#                         FOREIGN KEY (Fornitore) REFERENCES Fornitore(Codice),
#                         FOREIGN KEY (Acquisto) REFERENCES Acquisto(Codice)
#                     );
#                     CREATE TABLE IF NOT EXISTS Disponibilità (
#                         Fornitore INTEGER,
#                         Prodotto INTEGER,
#                         PRIMARY KEY (Fornitore, Prodotto),
#                         FOREIGN KEY (Fornitore) REFERENCES Fornitore(Codice),
#                         FOREIGN KEY (Prodotto) REFERENCES Prodotto(Codice)
#                     );
#                     CREATE TABLE IF NOT EXISTS Domanda (
#                         Cliente INTEGER,
#                         Reso INTEGER,
#                         PRIMARY KEY (Cliente, Reso),
#                         FOREIGN KEY (Cliente) REFERENCES Cliente(Codice),
#                         FOREIGN KEY (Reso) REFERENCES Reso(Codice)
#                     );
#                     CREATE TABLE IF NOT EXISTS Richiesta (
#                         Fattura INTEGER,
#                         Reso INTEGER,
#                         PRIMARY KEY (Fattura, Reso),
#                         FOREIGN KEY (Fattura) REFERENCES Fattura(NumeroFattura),
#                         FOREIGN KEY (Reso) REFERENCES Reso(Codice)
#                     );
#                     COMMIT;
#                 ''')
#                 self._initialized = True

#     def __enter__(self):
#         if self._connection is None:
#             try:
#                 self._connection = sqlite3.connect(
#                     DATABASE_URL_DEV, 
#                     check_same_thread=False,
#                     timeout=30
#                 )
#                 self._connection.row_factory = sqlite3.Row
#             except sqlite3.Error as e:
#                 raise Exception(f"Errore di connessione al database: {e}")
#         return self._connection

#     def __exit__(self, exc_type, exc_val, exc_tb):
#         if exc_type is not None:
#             self._connection.rollback()
#         else:
#             self._connection.commit()

#     def close(self):
#         if self._connection is not None:
#             try:
#                 self._connection.close()
#             except sqlite3.Error as e:
#                 print(f"Errore nella chiusura della connessione: {e}")
#             finally:
#                 self._connection = None

# Usage example:
# with DatabaseConnection() as conn:
#     # Use the connection
#     pass


def get_db_connection():
    conn = sqlite3.connect(DATABASE_URL_DEV, check_same_thread=False)
    conn.row_factory = sqlite3.Row  # return queries results as dict
    return conn
