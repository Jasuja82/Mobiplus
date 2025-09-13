"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { CalendarIcon } from "lucide-react"

interface VehicleBasicDetailsProps {
  vehicle: any
}

const statusLabels = {
  active: "Ativo",
  maintenance: "Manutenção",
  inactive: "Inativo",
  retired: "Retirado",
}

const fuelTypeLabels = {
  gasoline: "Gasolina",
  diesel: "Diesel",
  electric: "Elétrico",
  hybrid: "Híbrido",
}

export function VehicleBasicDetails({ vehicle }: VehicleBasicDetailsProps) {
  return (
    <div className="space-y-6">
      {/* Registration and Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Registo e configuração</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-sm text-muted-foreground mb-4">Informações de registo</div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="registration-date">Data de registo *</Label>
              <div className="relative">
                <Input id="registration-date" type="date" value={vehicle.purchase_date || ""} readOnly />
                <CalendarIcon className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Idade</Label>
              <Input
                id="age"
                value={vehicle.year ? `${new Date().getFullYear() - vehicle.year} anos` : "N/A"}
                readOnly
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emission-certificate">Certificado de emissão</Label>
              <Input id="emission-certificate" value={vehicle.inspection_expiry || "N/A"} readOnly />
            </div>
          </div>

          {/* Passenger Capacity */}
          <div className="space-y-4">
            <h3 className="font-medium">Capacidade de passageiros</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="seated">Sentado *</Label>
                <Input id="seated" type="number" placeholder="0" readOnly />
              </div>

              <div className="space-y-2">
                <Label htmlFor="standing">De pé</Label>
                <Input id="standing" type="number" placeholder="0" readOnly />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="driver" className="rounded" />
                <Label htmlFor="driver">Condutor</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input type="checkbox" id="reviewer" className="rounded" />
                <Label htmlFor="reviewer">Revisor</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="total-capacity">Total</Label>
              <Input id="total-capacity" value="0" readOnly className="bg-muted" />
            </div>
          </div>

          {/* Classification */}
          <div className="space-y-4">
            <h3 className="font-medium">CLASSIFICAÇÃO</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="service-type">Tipo de serviço *</Label>
                <Select value={vehicle.category?.name || ""}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar o tipo de serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="passenger">Passageiros</SelectItem>
                    <SelectItem value="cargo">Carga</SelectItem>
                    <SelectItem value="mixed">Misto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicle-type">Tipo de veículo *</Label>
                <Select value={vehicle.fuel_type || ""}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar o tipo de veículo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gasoline">Gasolina</SelectItem>
                    <SelectItem value="diesel">Diesel</SelectItem>
                    <SelectItem value="electric">Elétrico</SelectItem>
                    <SelectItem value="hybrid">Híbrido</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="in-circulation">Em Circulação</Label>
                <div className="flex items-center space-x-2">
                  <Switch id="in-circulation" checked={vehicle.status === "active"} disabled />
                  <span className="text-sm">{statusLabels[vehicle.status] || "Ativo"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="space-y-4">
            <h3 className="font-medium">ESPECIFICAÇÕES TÉCNICAS</h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="chassis-number">Número do chassis *</Label>
                <Input id="chassis-number" value={vehicle.vin || ""} readOnly />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gross-weight">Peso em ordem de marcha (t)</Label>
                <Input id="gross-weight" type="number" step="0.1" readOnly />
              </div>

              <div className="space-y-2">
                <Label htmlFor="net-weight">Peso bruto (t)</Label>
                <Input id="net-weight" type="number" step="0.1" readOnly />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tire-config">Configuração dos pneus</Label>
                <Input id="tire-config" readOnly />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <div className="border rounded-md">
              <div className="flex items-center gap-2 p-2 border-b bg-muted/50">
                <select className="text-sm border-none bg-transparent">
                  <option>Normal</option>
                </select>
                <select className="text-sm border-none bg-transparent">
                  <option>Sans Serif</option>
                </select>
                <div className="flex items-center gap-1 ml-2">
                  <button className="p-1 hover:bg-muted rounded">
                    <strong>B</strong>
                  </button>
                  <button className="p-1 hover:bg-muted rounded">
                    <em>I</em>
                  </button>
                  <button className="p-1 hover:bg-muted rounded">
                    <u>U</u>
                  </button>
                </div>
              </div>
              <Textarea
                id="notes"
                value={vehicle.notes || ""}
                className="border-none resize-none min-h-[100px]"
                readOnly
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
