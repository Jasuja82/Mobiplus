"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface VehicleEngineTransmissionProps {
  vehicle: any
}

export function VehicleEngineTransmission({ vehicle }: VehicleEngineTransmissionProps) {
  return (
    <div className="space-y-6">
      {/* Engine Details */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhes do grupo motopropulsor</CardTitle>
          <p className="text-sm text-muted-foreground">Informações sobre o motor</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="engine-brand">Marca do motor</Label>
              <Input id="engine-brand" value={vehicle.make || ""} readOnly />
            </div>

            <div className="space-y-2">
              <Label htmlFor="engine-model">Modelo do motor</Label>
              <Input id="engine-model" value={vehicle.model || ""} readOnly />
            </div>

            <div className="space-y-2">
              <Label htmlFor="engine-serial">Número de série do motor</Label>
              <Input id="engine-serial" readOnly />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="displacement">Deslocamento (cc)</Label>
              <Input id="displacement" type="number" readOnly />
            </div>

            <div className="space-y-2">
              <Label htmlFor="power">Potência (HP/kW)</Label>
              <Input id="power" readOnly />
            </div>

            <div className="space-y-2">
              <Label htmlFor="torque">Binário (Nm)</Label>
              <Input id="torque" readOnly />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="injection-system">Sistema de injeção</Label>
              <Input id="injection-system" readOnly />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emission-standard">Norma de emissão</Label>
              <Input id="emission-standard" readOnly />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="turbocharger">Turbocompressor</Label>
              <Select defaultValue="no">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">Não</SelectItem>
                  <SelectItem value="yes">Sim</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="intercooler">Intercooler</Label>
              <Select defaultValue="no">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">Não</SelectItem>
                  <SelectItem value="yes">Sim</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="particle-filter">Filtro de partículas</Label>
              <Select defaultValue="no">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">Não</SelectItem>
                  <SelectItem value="yes">Sim</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adblue-system">Sistema AdBlue</Label>
              <Select defaultValue="no">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">Não</SelectItem>
                  <SelectItem value="yes">Sim</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transmission */}
      <Card>
        <CardHeader>
          <CardTitle>Transmissão</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gearbox-type">Tipo de caixa de velocidades</Label>
              <Select defaultValue="manual">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="automatic">Automática</SelectItem>
                  <SelectItem value="semi-automatic">Semi-automática</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gearbox-brand">Marca da caixa de velocidades</Label>
              <Input id="gearbox-brand" readOnly />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gearbox-model">Modelo da caixa de velocidades</Label>
              <Input id="gearbox-model" readOnly />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gear-count">Número de engrenagens</Label>
              <Input id="gear-count" type="number" readOnly />
            </div>

            <div className="space-y-2">
              <Label htmlFor="retarder">Retardador</Label>
              <Select defaultValue="no">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">Não</SelectItem>
                  <SelectItem value="hydraulic">Hidráulico</SelectItem>
                  <SelectItem value="electric">Elétrico</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="retarder-type">Tipo de retardador</Label>
              <Select defaultValue="no">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">Não</SelectItem>
                  <SelectItem value="engine">Motor</SelectItem>
                  <SelectItem value="transmission">Transmissão</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rear Axle */}
      <Card>
        <CardHeader>
          <CardTitle>Eixo traseiro</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rear-axle-brand">Marca do eixo traseiro</Label>
              <Input id="rear-axle-brand" readOnly />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rear-axle-model">Modelo do eixo traseiro</Label>
              <Input id="rear-axle-model" readOnly />
            </div>

            <div className="space-y-2">
              <Label htmlFor="differential-ratio">Rácio diferencial</Label>
              <Input id="differential-ratio" readOnly />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
