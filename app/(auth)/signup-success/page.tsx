import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignupSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100">
            <span className="text-2xl">📧</span>
          </div>
          <CardTitle className="text-2xl">Obrigado por se registar!</CardTitle>
          <CardDescription>Verifique o seu email para confirmar</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center">
            Registou-se com sucesso. Por favor, verifique o seu email para confirmar a sua conta antes de fazer login.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
