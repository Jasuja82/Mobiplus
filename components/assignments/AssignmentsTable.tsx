"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Edit, Trash2, Eye, Tag } from "lucide-react"
import Link from "next/link"
import type { AssignmentType } from "@/lib/database"

interface AssignmentsTableProps {
  assignments: AssignmentType[]
}

export function AssignmentsTable({ assignments }: AssignmentsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredAssignments = assignments.filter(
    (assignment) =>
      assignment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDelete = async (assignmentId: string, assignmentName: string) => {
    if (!confirm(`Tem certeza que deseja eliminar a atribuição "${assignmentName}"?`)) return

    try {
      const response = await fetch(`/api/assignments/${assignmentId}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (response.ok && result.success) {
        // Refresh the page to show updated data
        window.location.reload()
      } else {
        alert("Erro ao eliminar atribuição: " + (result.error || "Erro desconhecido"))
      }
    } catch (error) {
      console.error("Error deleting assignment:", error)
      alert("Erro ao eliminar atribuição")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Pesquisar atribuições..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Criado</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAssignments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  {searchTerm ? "Nenhuma atribuição encontrada" : "Nenhuma atribuição encontrada"}
                  {!searchTerm && (
                    <Link href="/assignments/new" className="text-primary hover:underline ml-1">
                      Adicione a primeira atribuição
                    </Link>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              filteredAssignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      {assignment.name}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{assignment.description || "N/A"}</TableCell>
                  <TableCell>{new Date(assignment.created_at).toLocaleDateString("pt-PT")}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/assignments/${assignment.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/assignments/${assignment.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(assignment.id, assignment.name)}
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
      </div>
    </div>
  )
}
