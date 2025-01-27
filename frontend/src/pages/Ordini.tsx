import React, { useState, useEffect } from 'react';
import { Container, Tabs, Tab, Table } from 'react-bootstrap';

type BaseProduct = {
  Codice: number;
  Nome: string;
  Prezzo: number;
  TotaleAcquisti: number;
  TotaleVendite: number;
};

type VideoCard = BaseProduct & {
  Marca: string;
  Modello: string;
  TipoDiMemoria: string;
  QuantitàDiMemoria: number;
  NumeroDiPorte: number;
  PotenzaNecessaria: number;
  Compatibilità: string;
};

type RAM = BaseProduct & {
  Tecnologia: string;
  Capacità: number;
  Velocità: number;
  TensioneOperativa: number;
  Latenza: number;
};

type Processor = BaseProduct & {
  Architettura: string;
  NumeroDiCore: number;
  FrequenzaBase: number;
  FrequenzaBoost: number;
  Cache: number;
  CompatibilitàConSocket: string;
};

type Motherboard = BaseProduct & {
  TipoDiSocket: string;
  Chipset: string;
  Formato: string;
  NumeroDiSlotRAM: number;
  NumeroDiPortePCIe: number;
  SupportoPerVelocitàRAM: number;
  Connettività: string;
};

type Storage = BaseProduct & {
  Tipo: string;
  Capacità: number;
  VelocitàRW: number;
  Interfaccia: string;
};

const Ordini: React.FC = () => {
    const [activeTab, setActiveTab] = useState('video_cards');
    const [products, setProducts] = useState<{
      video_cards: VideoCard[];
      ram: RAM[];
      processors: Processor[];
      motherboards: Motherboard[];
      storage: Storage[];
    }>({
      video_cards: [],
      ram: [],
      processors: [],
      motherboards: [],
      storage: [],
    });
  
    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await fetch(`http://15.204.245.166:8002/api/orders/categories/${activeTab}`);
          const data = await response.json();
          setProducts((prev) => ({ ...prev, [activeTab]: data }));
        } catch (error) {
          console.error('Errore nel caricamento dei dati:', error);
        }
      };
  
      fetchData();
    }, [activeTab]);
  
    const renderTable = () => {
      switch (activeTab) {
        case 'video_cards':
          return (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Marca</th>
                  <th>Modello</th>
                  <th>Memoria</th>
                  <th>Porte</th>
                  <th>Potenza</th>
                  <th>Compatibilità</th>
                  <th>Prezzo</th>
                  <th>Totale Acquisti</th>
                  <th>Totale Vendite</th>
                  <th>Margine</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(products.video_cards) ? (
                    products.video_cards.map((card) => (
                        <tr key={card.Codice}>
                            <td>{card.Nome}</td>
                            <td>{card.Marca}</td>
                            <td>{card.Modello}</td>
                            <td>{card.QuantitàDiMemoria}GB {card.TipoDiMemoria}</td>
                            <td>{card.NumeroDiPorte}</td>
                            <td>{card.PotenzaNecessaria}W</td>
                            <td>{card.Compatibilità}</td>
                            <td>€{card.Prezzo.toFixed(2)}</td>
                            <td>€{card.TotaleAcquisti.toFixed(2)}</td>
                            <td>€{card.TotaleVendite.toFixed(2)}</td>
                            <td>€{(card.TotaleVendite - card.TotaleAcquisti).toFixed(2)}</td>
                        </tr>
                    ))
                ) : null}
              </tbody>
            </Table>
          );
  
        case 'ram':
          return (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Tecnologia</th>
                  <th>Capacità</th>
                  <th>Velocità</th>
                  <th>Tensione</th>
                  <th>Latenza</th>
                  <th>Prezzo</th>
                  <th>Totale Acquisti</th>
                  <th>Totale Vendite</th>
                  <th>Margine</th>
                </tr>
              </thead>
              <tbody>
                {products.ram.map((ram) => (
                  <tr key={ram.Codice}>
                    <td>{ram.Nome}</td>
                    <td>{ram.Tecnologia}</td>
                    <td>{ram.Capacità}GB</td>
                    <td>{ram.Velocità}MHz</td>
                    <td>{ram.TensioneOperativa}V</td>
                    <td>CL{ram.Latenza}</td>
                    <td>€{ram.Prezzo.toFixed(2)}</td>
                    <td>€{ram.TotaleAcquisti.toFixed(2)}</td>
                    <td>€{ram.TotaleVendite.toFixed(2)}</td>
                    <td>€{(ram.TotaleVendite - ram.TotaleAcquisti).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          );
  
        case 'processors':
          return (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Architettura</th>
                  <th>Core</th>
                  <th>Frequenza Base</th>
                  <th>Frequenza Boost</th>
                  <th>Cache</th>
                  <th>Socket</th>
                  <th>Prezzo</th>
                  <th>Totale Acquisti</th>
                  <th>Totale Vendite</th>
                  <th>Margine</th>
                </tr>
              </thead>
              <tbody>
                {products.processors.map((processor) => (
                  <tr key={processor.Codice}>
                    <td>{processor.Nome}</td>
                    <td>{processor.Architettura}</td>
                    <td>{processor.NumeroDiCore}</td>
                    <td>{processor.FrequenzaBase}GHz</td>
                    <td>{processor.FrequenzaBoost}GHz</td>
                    <td>{processor.Cache}MB</td>
                    <td>{processor.CompatibilitàConSocket}</td>
                    <td>€{processor.Prezzo.toFixed(2)}</td>
                    <td>€{processor.TotaleAcquisti.toFixed(2)}</td>
                    <td>€{processor.TotaleVendite.toFixed(2)}</td>
                    <td>€{(processor.TotaleVendite - processor.TotaleAcquisti).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          );
  
        case 'motherboards':
          return (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Socket</th>
                  <th>Chipset</th>
                  <th>Formato</th>
                  <th>Slot RAM</th>
                  <th>Porte PCIe</th>
                  <th>Supporto RAM</th>
                  <th>Connettività</th>
                  <th>Prezzo</th>
                  <th>Totale Acquisti</th>
                  <th>Totale Vendite</th>
                  <th>Margine</th>
                </tr>
              </thead>
              <tbody>
                {products.motherboards.map((motherboard) => (
                  <tr key={motherboard.Codice}>
                    <td>{motherboard.Nome}</td>
                    <td>{motherboard.TipoDiSocket}</td>
                    <td>{motherboard.Chipset}</td>
                    <td>{motherboard.Formato}</td>
                    <td>{motherboard.NumeroDiSlotRAM}</td>
                    <td>{motherboard.NumeroDiPortePCIe}</td>
                    <td>{motherboard.SupportoPerVelocitàRAM}MHz</td>
                    <td>{motherboard.Connettività}</td>
                    <td>€{motherboard.Prezzo.toFixed(2)}</td>
                    <td>€{motherboard.TotaleAcquisti.toFixed(2)}</td>
                    <td>€{motherboard.TotaleVendite.toFixed(2)}</td>
                    <td>€{(motherboard.TotaleVendite - motherboard.TotaleAcquisti).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          );
  
        case 'storage':
          return (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Tipo</th>
                  <th>Capacità</th>
                  <th>Velocità RW</th>
                  <th>Interfaccia</th>
                  <th>Prezzo</th>
                  <th>Totale Acquisti</th>
                  <th>Totale Vendite</th>
                  <th>Margine</th>
                </tr>
              </thead>
              <tbody>
                {products.storage.map((storage) => (
                  <tr key={storage.Codice}>
                    <td>{storage.Nome}</td>
                    <td>{storage.Tipo}</td>
                    <td>{storage.Capacità}GB</td>
                    <td>{storage.VelocitàRW}MB/s</td>
                    <td>{storage.Interfaccia}</td>
                    <td>€{storage.Prezzo.toFixed(2)}</td>
                    <td>€{storage.TotaleAcquisti.toFixed(2)}</td>
                    <td>€{storage.TotaleVendite.toFixed(2)}</td>
                    <td>€{(storage.TotaleVendite - storage.TotaleAcquisti).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          );
  
        default:
          return <div>Seleziona una categoria</div>;
      }
    };
  
    return (
      <Container>
        <h2 className="my-4">Analisi Prodotti e Ordini</h2>
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k || 'video_cards')}
          className="mb-3"
        >
          <Tab eventKey="video_cards" title="Schede Video">
            {renderTable()}
          </Tab>
          <Tab eventKey="ram" title="RAM">
            {renderTable()}
          </Tab>
          <Tab eventKey="processors" title="Processori">
            {renderTable()}
          </Tab>
          <Tab eventKey="motherboards" title="Schede Madri">
            {renderTable()}
          </Tab>
          <Tab eventKey="storage" title="Storage">
            {renderTable()}
          </Tab>
        </Tabs>
      </Container>
    );
  };
  
  export default Ordini;