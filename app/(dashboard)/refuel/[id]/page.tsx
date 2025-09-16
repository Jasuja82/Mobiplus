import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Trash2 } from "lucide-react"
import Link from "next/link"

interface RefuelDetailPageProps {
  params: {
    id: string
  }
}

export default async function RefuelDetailPage({ params }: RefuelDetailPageProps) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  // Get refuel record with all related data
  const { data: refuelRecord, error } = await supabase
    .from("refuel_records")
    .select(`
      *,
      vehicle:vehicles(
        id,
        license_plate, 
        make, 
        model,
        vehicle_number,
        internal_number
      ),
      driver:drivers(
        id,
        name,
        internal_number,
        license_number
      ),
      fuel_station:fuel_stations(
        id,
        name,
        brand,
        address
      ),
      created_by_user:users!refuel_records_created_by_fkey(name)
    `)
    .eq("id", params.id)
    .single()

  if (error || !refuelRecord) {
    redirect("/refuel")
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-PT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatVehicleNumber = (vehicleNumber?: string) => {
    if (!vehicleNumber) return ""
    if (!/^\d+$/.test(vehicleNumber)) return vehicleNumber

    const num = Number.parseInt(vehicleNumber)
    if (num >= 1 && num <= 9) {
      return `0${num}`
    }
    return vehicleNumber
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/refuel">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Detalhes do Abastecimento</h1>
            <p className="text-muted-foreground">Registo de {formatDate(refuelRecord.refuel_date)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 bg-transparent">
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Vehicle Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Veículo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Veículo</label>
              <p className="text-lg font-semibold">
                {formatVehicleNumber(refuelRecord.vehicle?.vehicle_number || refuelRecord.vehicle?.internal_number)} -{" "}
                {refuelRecord.vehicle?.license_plate}
              </p>
              <p className="text-sm text-muted-foreground">
                {refuelRecord.vehicle?.make} {refuelRecord.vehicle?.model}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Quilometragem</label>
              <p className="text-lg">{refuelRecord.odometer_reading?.toLocaleString()} km</p>
            </div>
            {refuelRecord.distance_since_last_refuel && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Distância desde último abastecimento
                </label>
                <p className="text-lg">{refuelRecord.distance_since_last_refuel.toLocaleString()} km</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Driver Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Condutor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Condutor</label>
              <p className="text-lg font-semibold">{refuelRecord.driver?.name || "N/A"}</p>
              {refuelRecord.driver?.internal_number && (
                <p className="text-sm text-muted-foreground">Nº {refuelRecord.driver.internal_number}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Carta de Condução</label>
              <p className="text-lg">{refuelRecord.driver?.license_number || "N/A"}</p>
            </div>
          </CardContent>
        </Card>

        {/* Fuel Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Combustível</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Litros</label>
                <p className="text-lg font-semibold">{refuelRecord.liters.toFixed(1)}L</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Preço por Litro</label>
                <p className="text-lg">€{refuelRecord.cost_per_liter.toFixed(3)}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Custo Total</label>
              <p className="text-2xl font-bold text-green-600">€{refuelRecord.total_cost.toFixed(2)}</p>
            </div>
            {refuelRecord.fuel_efficiency_l_per_100km && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Consumo (L/100km)</label>
                <p className="text-lg">{refuelRecord.fuel_efficiency_l_per_100km.toFixed(2)} L/100km</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Station Information */}
        <Card>
          <CardHeader>
            <CardTitle>Posto de Combustível</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Posto</label>
              {refuelRecord.fuel_station ? (
                <div>
                  <p className="text-lg font-semibold">{refuelRecord.fuel_station.brand}</p>
                  <p className="text-sm text-muted-foreground">{refuelRecord.fuel_station.name}</p>
                  {refuelRecord.fuel_station.address && (
                    <p className="text-sm text-muted-foreground">{refuelRecord.fuel_station.address}</p>
                  )}
                </div>
              ) : (
                <p className="text-lg">N/A</p>
              )}
            </div>
            {refuelRecord.receipt_number && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Número do Recibo</label>
                <p className="text-lg">{refuelRecord.receipt_number}</p>
              </div>
            )}
            {refuelRecord.invoice_number && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Número da Fatura</label>
                <p className="text-lg">{refuelRecord.invoice_number}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Information */}
      {refuelRecord.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">{refuelRecord.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Registo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Criado por</label>
              <p className="text-lg">{refuelRecord.created_by_user?.name || "N/A"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Data de criação</label>
              <p className="text-lg">{formatDate(refuelRecord.created_at)}</p>
            </div>
          </div>
          {refuelRecord.updated_at !== refuelRecord.created_at && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Última atualização</label>
              <p className="text-lg">{formatDate(refuelRecord.updated_at)}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
