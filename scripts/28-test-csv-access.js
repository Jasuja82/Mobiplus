console.log("[v0] Testing CSV access...")

const csvUrl =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/test%20batch%20for%20parsing-TR2wxjuge3CH7BjLCj7xLRiw3dKLtS.csv"

try {
  console.log("[v0] Fetching CSV from:", csvUrl)

  const response = await fetch(csvUrl)
  console.log("[v0] Response status:", response.status)
  console.log("[v0] Response ok:", response.ok)

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  const csvText = await response.text()
  console.log("[v0] CSV length:", csvText.length)
  console.log("[v0] First 200 characters:", csvText.substring(0, 200))

  // Parse CSV
  const lines = csvText.trim().split("\n")
  console.log("[v0] Total lines:", lines.length)

  if (lines.length > 0) {
    const headers = lines[0].split(";")
    console.log("[v0] Headers:", headers)

    if (lines.length > 1) {
      const firstRecord = lines[1].split(";")
      console.log("[v0] First record:", firstRecord)
    }
  }

  console.log("[v0] CSV access test completed successfully!")
} catch (error) {
  console.error("[v0] CSV access test failed:", error.message)
  console.error("[v0] Full error:", error)
}
