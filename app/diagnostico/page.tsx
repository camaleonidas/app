import DiagnosticoAmbiente from "@/components/diagnostico-ambiente"

export default function DiagnosticoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Diagnóstico do Ambiente
          </h1>
          <p className="text-gray-600">
            Identifique onde está rodando e verifique a configuração
          </p>
        </div>
        
        <DiagnosticoAmbiente />
      </div>
    </div>
  )
}
