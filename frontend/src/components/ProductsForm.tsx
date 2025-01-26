import React, { useState } from "react";

interface FormData {
  categoria: string;
  nome: string;
  descrizione: string;
  prezzo: string;
  [key: string]: string; // Supporto per campi dinamici
}

const fieldsByCategory: Record<
  string,
  { label: string; name: string; type: string }[]
> = {
  SchedeVideo: [
    { label: "Marca", name: "marca", type: "text" },
    { label: "Modello", name: "modello", type: "text" },
    { label: "Tipo di Memoria", name: "tipo_memoria", type: "text" },
    { label: "Quantità di Memoria", name: "quantita_memoria", type: "text" },
    { label: "Numero di Porte", name: "numero_porte", type: "number" },
    { label: "Potenza Necessaria", name: "potenza_necessaria", type: "number" },
    { label: "Compatibilità", name: "compatibilita", type: "text" },
  ],
  RAM: [
    { label: "Tecnologia", name: "tecnologia", type: "text" },
    { label: "Capacità", name: "capacita", type: "text" },
    { label: "Velocità", name: "velocita", type: "text" },
    { label: "Tensione Operativa", name: "tensione_operativa", type: "text" },
    { label: "Latenza", name: "latenza", type: "text" },
  ],
  Processore: [
    { label: "Architettura", name: "architettura", type: "text" },
    { label: "Numero di Core", name: "numero_core", type: "number" },
    { label: "Frequenza Base", name: "frequenza_base", type: "number" },
    { label: "Frequenza Boost", name: "frequenza_boost", type: "number" },
    { label: "Cache", name: "cache", type: "text" },
    { label: "Compatibilità con Socket", name: "compatibilita_socket", type: "text" },
  ],
  SchedaMadre: [
    { label: "Tipo di Socket", name: "tipo_socket", type: "text" },
    { label: "Chipset", name: "chipset", type: "text" },
    { label: "Formato", name: "formato", type: "text" },
    { label: "Numero di Slot RAM", name: "numero_slot_ram", type: "number" },
    { label: "Numero di Porte PCIe", name: "numero_porte_pcie", type: "number" },
    { label: "Supporto per Velocità RAM", name: "supporto_velocita_ram", type: "text" },
    { label: "Connettività", name: "connettivita", type: "text" },
  ],
  MemoriaArchiviazione: [
    { label: "Tipo", name: "tipo", type: "text" },
    { label: "Capacità", name: "capacita_memoria", type: "text" },
    { label: "Velocità RW", name: "velocita_rw", type: "text" },
    { label: "Interfaccia", name: "interfaccia", type: "text" },
  ],
};

const ProductForm: React.FC = () => {
  const [category, setCategory] = useState<string>("RAM");
  const [formData, setFormData] = useState<FormData>({
    categoria: "RAM",
    nome: "",
    descrizione: "",
    prezzo: "",
  });

  const categoryFields = fieldsByCategory[category] || [];

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const categoria = e.target.value;
    setFormData({ ...formData, categoria });
    setCategory(categoria);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `http://15.204.245.166:8002/api/products/add/${formData.categoria}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if(!data.error)
          alert(`Prodotto inserito con successo.`);
    } catch (error) {
      console.error("Errore durante l'inserimento del prodotto", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="row">
        <div className="col-md-6">
          <div className="form-group" id="categoria">
            <label>Categoria</label>
            <select
              name="categoria"
              value={formData.categoria}
              onChange={handleCategoryChange}
              className="form-control"
              required
            >
              <option value="">Seleziona una categoria</option>
              {Object.keys(fieldsByCategory).map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="col-md-6">
          <div className="form-group" id="nome">
            <label>Nome</label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleInputChange}
              className="form-control"
              required
            />
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12">
          <div className="form-group" id="descrizione">
            <label>Descrizione</label>
            <textarea
              name="descrizione"
              value={formData.descrizione}
              onChange={handleInputChange}
              className="form-control"
              required
            />
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="form-group" id="prezzo">
            <label>Prezzo</label>
            <div className="input-group">
              <input
                type="number"
                step="0.01"
                name="prezzo"
                value={formData.prezzo}
                onChange={handleInputChange}
                className="form-control"
                required
              />
            </div>
          </div>
        </div>
      </div>

      {categoryFields.map((field) => (
        <div className="row" key={field.name}>
          <div className="col-md-6">
            <div className="form-group" id={field.name}>
              <label>{field.label}</label>
              <input
                type={field.type}
                name={field.name}
                value={formData[field.name] || ""}
                onChange={handleInputChange}
                className="form-control"
              />
            </div>
          </div>
        </div>
      ))}

      <button type="submit" className="btn btn-primary">
        Inserisci Prodotto
      </button>
    </form>
  );
};

export default ProductForm;
