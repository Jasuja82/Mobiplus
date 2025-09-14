export type Language = "en" | "pt"

export const translations = {
  en: {
    nav: {
      dashboard: "Dashboard",
      vehicles: "Vehicles",
      drivers: "Drivers",
      refuel: "Refuel Records",
      maintenance: "Maintenance",
      locations: "Locations",
      departments: "Departments",
      assignments: "Assignments",
      analytics: "Analytics",
      import: "Import Data",
      settings: "Settings",
    },
    common: {
      loading: "Loading...",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      add: "Add",
      search: "Search...",
      export: "Export",
      filter: "Filter",
    },
    refuel: {
      title: "Refuel Entry Form",
      vehicle: "Vehicle",
      lastOdometer: "Last",
      lastRefuel: "Last refuel",
      avgEfficiency: "Avg efficiency",
      noRecords: "No previous records",
      date: "Date",
      odometer: "Odometer (km)",
      liters: "Liters",
      pricePerLiter: "Price per Liter (€)",
      totalCost: "Total Cost (€)",
      efficiency: "Efficiency",
      fuelStation: "Fuel Station",
      driver: "Driver",
      notes: "Notes (optional)",
      notesPlaceholder: "Additional notes about this refuel...",
      selectFuelStation: "Select fuel station",
      selectDriver: "Select driver",
      selectVehicle: "Select vehicle",
      distanceDriven: "Distance driven",
      historicalEntry: "Historical entry - ensure odometer value is correct for this date",
      saveDraft: "Save as Draft",
      saveRecord: "Save Refuel Record",
      saving: "Saving...",
    },
  },
  pt: {
    nav: {
      dashboard: "Dashboard",
      vehicles: "Veículos",
      drivers: "Condutores",
      refuel: "Abastecimentos",
      maintenance: "Manutenção",
      locations: "Localizações",
      departments: "Departamentos",
      assignments: "Atribuições",
      analytics: "Relatórios",
      import: "Importar Dados",
      settings: "Configurações",
    },
    common: {
      loading: "Carregando...",
      save: "Guardar",
      cancel: "Cancelar",
      delete: "Eliminar",
      edit: "Editar",
      add: "Adicionar",
      search: "Pesquisar...",
      export: "Exportar",
      filter: "Filtrar",
    },
    refuel: {
      title: "Formulário de Abastecimento",
      vehicle: "Veículo",
      lastOdometer: "Último",
      lastRefuel: "Último abastecimento",
      avgEfficiency: "Eficiência média",
      noRecords: "Sem registos anteriores",
      date: "Data",
      odometer: "Quilometragem (km)",
      liters: "Litros",
      pricePerLiter: "Preço por Litro (€)",
      totalCost: "Custo Total (€)",
      efficiency: "Eficiência",
      fuelStation: "Posto de Combustível",
      driver: "Condutor",
      notes: "Observações (opcional)",
      notesPlaceholder: "Observações adicionais sobre este abastecimento...",
      selectFuelStation: "Selecionar posto de combustível",
      selectDriver: "Selecionar condutor",
      selectVehicle: "Selecionar veículo",
      distanceDriven: "Distância percorrida",
      historicalEntry: "Entrada histórica - certifique-se de que o valor do odómetro está correto para esta data",
      saveDraft: "Guardar como Rascunho",
      saveRecord: "Guardar Registo de Abastecimento",
      saving: "A guardar...",
    },
  },
}

export function useTranslation(language: Language = "pt") {
  return {
    t: (key: string) => {
      const keys = key.split(".")
      let value: any = translations[language]

      for (const k of keys) {
        value = value?.[k]
      }

      return value || key
    },
    language,
  }
}
