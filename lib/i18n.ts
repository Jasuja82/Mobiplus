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
