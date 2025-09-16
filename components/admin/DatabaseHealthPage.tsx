"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Database, CheckCircle, AlertTriangle, XCircle, RefreshCw, Download, Play, Activity } from "lucide-react"
import { databaseValidator, type ValidationResult } from "@/lib/utils/database-validator"
import { odometerValidator } from "@/lib/validations/odometer"

export function DatabaseHealthPage() {
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([])
  const [loading, setLoading] = useState(false)
  const [sanitizing, setSanitizing] = useState(false)
  const [report, setReport] = useState<string>("")
  const [overallScore, setOverallScore] = useState<number>(0)

  useEffect(() => {
    runValidation()
  }, [])

  const runValidation = async () => {
    setLoading(true)
    try {
      const results = await databaseValidator.validateDatabase()
      setValidationResults(results)

      // Calculate overall score
      let totalScore = 0
      let totalRecords = 0

      results.forEach((result) => {
        totalScore += result.score * result.totalRecords
        totalRecords += result.totalRecords
      })

      const overall = totalRecords > 0 ? Math.round(totalScore / totalRecords) : 100
      setOverallScore(overall)

      // Generate report
      const reportText = await databaseValidator.generateReport()
      setReport(reportText)
    } catch (error) {
      console.error("Validation error:", error)
    } finally {
      setLoading(false)
    }
  }

  const runSanitization = async () => {
    setSanitizing(true)
    try {
      // Run odometer sanitization
      const sanitizationResult = await odometerValidator.sanitizeOdometerData()

      console.log(`Fixed ${sanitizationResult.fixed} records`)
      if (sanitizationResult.warnings.length > 0) {
        console.warn("Sanitization warnings:", sanitizationResult.warnings)
      }

      // Re-run validation after sanitization
      await runValidation()
    } catch (error) {
      console.error("Sanitization error:", error)
    } finally {
      setSanitizing(false)
    }
  }

  const downloadReport = () => {
    const blob = new Blob([report], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `database-health-report-${new Date().toISOString().split("T")[0]}.md`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="h-5 w-5 text-green-600" />
    if (score >= 70) return <AlertTriangle className="h-5 w-5 text-yellow-600" />
    return <XCircle className="h-5 w-5 text-red-600" />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Database Health</h1>
          <p className="text-muted-foreground">Monitor and maintain database integrity</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={downloadReport} variant="outline" size="sm" disabled={!report}>
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
          <Button onClick={runSanitization} variant="outline" size="sm" disabled={sanitizing}>
            {sanitizing ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
            Sanitize Database
          </Button>
          <Button onClick={runValidation} size="sm" disabled={loading}>
            {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Activity className="h-4 w-4 mr-2" />}
            Run Validation
          </Button>
        </div>
      </div>

      {/* Overall Health Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Overall Database Health
          </CardTitle>
          <CardDescription>Comprehensive health score based on data quality and integrity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            {getScoreIcon(overallScore)}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Health Score</span>
                <span className={`text-2xl font-bold ${getScoreColor(overallScore)}`}>{overallScore}/100</span>
              </div>
              <Progress value={overallScore} className="h-2" />
            </div>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            {overallScore >= 90 && "Excellent! Your database is in great condition."}
            {overallScore >= 70 && overallScore < 90 && "Good, but there are some issues that should be addressed."}
            {overallScore < 70 && "Attention needed! Several data quality issues detected."}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Detailed Results</TabsTrigger>
          <TabsTrigger value="report">Full Report</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {validationResults.map((result) => (
              <Card key={result.table}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    {result.table.replace("_", " ").toUpperCase()}
                    {getScoreIcon(result.score)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Records:</span>
                      <span className="font-medium">{result.totalRecords.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Score:</span>
                      <span className={`font-medium ${getScoreColor(result.score)}`}>{result.score}/100</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Issues:</span>
                      <span className="font-medium">{result.issues.reduce((sum, issue) => sum + issue.count, 0)}</span>
                    </div>
                    <Progress value={result.score} className="h-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          {validationResults.map((result) => (
            <Card key={result.table}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {result.table.replace("_", " ").toUpperCase()}
                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-bold ${getScoreColor(result.score)}`}>{result.score}/100</span>
                    {getScoreIcon(result.score)}
                  </div>
                </CardTitle>
                <CardDescription>{result.totalRecords.toLocaleString()} total records</CardDescription>
              </CardHeader>
              <CardContent>
                {result.issues.length > 0 ? (
                  <div className="space-y-3">
                    {result.issues.map((issue, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {issue.type === "error" && <XCircle className="h-4 w-4 text-red-500" />}
                          {issue.type === "warning" && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                          {issue.type === "info" && <CheckCircle className="h-4 w-4 text-blue-500" />}
                          <div>
                            <p className="font-medium">{issue.description}</p>
                            <p className="text-sm text-muted-foreground">Field: {issue.field}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              issue.severity === "critical"
                                ? "destructive"
                                : issue.severity === "high"
                                  ? "destructive"
                                  : issue.severity === "medium"
                                    ? "secondary"
                                    : "outline"
                            }
                          >
                            {issue.severity}
                          </Badge>
                          <span className="font-bold">{issue.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p>No issues found! This table is in excellent condition.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="report" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Full Validation Report</CardTitle>
              <CardDescription>Detailed markdown report of all validation results</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg overflow-auto max-h-96">
                {report || "Run validation to generate report..."}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
