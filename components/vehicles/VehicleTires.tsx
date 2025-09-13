"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Info } from "lucide-react"

interface VehicleTiresProps {
  vehicle: any
}

export function VehicleTires({ vehicle }: VehicleTiresProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gestão de pneus</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Gerir as especificações dos pneus para os diferentes eixos e posições no veículo.
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar pneu
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Eixo</TableHead>
                  <TableHead>POSIÇÃO</TableHead>
                  <TableHead>Marca de pneus</TableHead>
                  <TableHead>Dimensões</TableHead>
                  <TableHead>Pressão recomendada (bar)</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <Info className="h-4 w-4" />
                      <span>Não há pneus registados para este veículo</span>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
