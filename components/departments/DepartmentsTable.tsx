"use client"

import { useState, useMemo } from "react"
import type { Department, User } from "@/types/database"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Edit, Trash2, Eye, Building, Plus, Filter } from "lucide-react"
import Link from "next/link"

interface DepartmentWithManager extends Department {
  manager?: User
}

interface DepartmentsTableProps {
  departments: DepartmentWithManager[]
}

export function DepartmentsTable({ departments }: DepartmentsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [managerFilter, setManagerFilter] = useState<string>("all")
  const [budgetFilter, setBudgetFilter] = useState<string>("all")

  const filteredDepartments = useMemo(() => {
    return departments.filter((dept) => {
      const matchesSearch =
        !searchTerm.trim() ||
        dept.name?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
        dept.description?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
        dept.manager?.name?.toLowerCase()?.includes(searchTerm.toLowerCase())

      const matchesManager =
        managerFilter === "all" ||
        (managerFilter === "with_manager" && dept.manager) ||
        (managerFilter === "without_manager" && !dept.manager)

      const matchesBudget =
        budgetFilter === "all" ||
        (budgetFilter === "with_budget" && dept.budget && dept.budget > 0) ||
        (budgetFilter === "without_budget" && (!dept.budget || dept.budget <= 0))

      return matchesSearch && matchesManager && matchesBudget
    })
  }, [departments, searchTerm, managerFilter, budgetFilter])

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "N/A"
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  const handleDelete = async (departmentId: string, departmentName: string) => {
    if (!confirm(`Tem certeza que deseja eliminar o departamento "${departmentName}"?`)) return

    try {
      const response = await fetch(`/api/departments/${departmentId}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (response.ok && result.success) {
        // Refresh the page to show updated data
        window.location.reload()
      } else {
        alert("Erro ao eliminar departamento: " + (result.error || "Erro desconhecido"))
      }
    } catch (error) {
      console.error("Error deleting department:", error)
      alert("Erro ao eliminar departamento")
    }
  }

  if (departments.length === 0) {
    return (
      <Card className="border-border">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <Building className="h-10 w-10 text-muted-foreground" />
          </div>
          <CardTitle className="mt-6 text-xl text-foreground">Nenhum departamento encontrado</CardTitle>
          <CardDescription className="mt-2 max-w-sm">
            Comece por adicionar o primeiro departamento para organizar a sua frota.
          </CardDescription>
          <Button className="mt-6 hover:bg-primary/90 transition-colors">
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Primeiro Departamento
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Pesquisar departamentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-border focus-visible:ring-ring"
          />
        </div>
        <div className="flex gap-2 items-center">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={managerFilter} onValueChange={setManagerFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Gestor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="with_manager">Com gestor</SelectItem>
              <SelectItem value="without_manager">Sem gestor</SelectItem>
            </SelectContent>
          </Select>
          <Select value={budgetFilter} onValueChange={setBudgetFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Orçamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="with_budget">Com orçamento</SelectItem>
              <SelectItem value="without_budget">Sem orçamento</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Mostrando {filteredDepartments.length} de {departments.length} departamentos
      </div>

      <Card className="border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-muted/50">
                <TableHead className="text-foreground">Nome</TableHead>
                <TableHead className="text-foreground">Descrição</TableHead>
                <TableHead className="text-foreground">Gestor</TableHead>
                <TableHead className="text-foreground">Orçamento</TableHead>
                <TableHead className="text-foreground">Criado</TableHead>
                <TableHead className="text-right text-foreground">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDepartments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {departments.length === 0 ? (
                      <>
                        Nenhum departamento encontrado.{" "}
                        <Link href="/departments/new" className="text-primary hover:text-primary/80 transition-colors">
                          Adicione o primeiro departamento
                        </Link>
                      </>
                    ) : (
                      "Nenhum departamento corresponde aos filtros aplicados."
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredDepartments.map((department) => (
                  <TableRow key={department.id} className="border-border hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium text-foreground">{department.name}</TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">
                      {department.description || "N/A"}
                    </TableCell>
                    <TableCell>
                      {department.manager ? (
                        <div>
                          <div className="font-medium text-foreground">{department.manager.name}</div>
                          <div className="text-sm text-muted-foreground">{department.manager.email}</div>
                        </div>
                      ) : (
                        <Badge variant="outline" className="border-border text-muted-foreground">
                          Sem gestor
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-foreground">{formatCurrency(department.budget)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(department.created_at).toLocaleDateString("pt-PT")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/departments/${department.id}`}>
                          <Button variant="ghost" size="sm" className="hover:bg-accent hover:text-accent-foreground">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/departments/${department.id}/edit`}>
                          <Button variant="ghost" size="sm" className="hover:bg-accent hover:text-accent-foreground">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(department.id, department.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
