import { VistoriaProvider, useVistoria } from '../contexts/VistoriaContext'
import WizardProgress from '../components/WizardProgress'
import Step1Veiculo from './nova-vistoria/Step1Veiculo'
import Step2Cliente from './nova-vistoria/Step2Cliente'
import Step3Pneus from './nova-vistoria/Step3Pneus'
import Step4Danos from './nova-vistoria/Step4Danos'
import Step5Sujeira from './nova-vistoria/Step5Sujeira'
import Step6Fotos from './nova-vistoria/Step6Fotos'
import Step7Revisao from './nova-vistoria/Step7Revisao'
import Step8Assinaturas from './nova-vistoria/Step8Assinaturas'

function WizardContent() {
  const { step, setStep } = useVistoria()
  const next = () => setStep(step + 1)
  const back = () => setStep(step - 1)

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Nova Vistoria</h1>
        <p className="text-gray-500 text-sm">Preencha todos os dados do veículo</p>
      </div>

      <WizardProgress current={step} />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {step === 1 && <Step1Veiculo onNext={next} />}
        {step === 2 && <Step2Cliente onNext={next} onBack={back} />}
        {step === 3 && <Step3Pneus onNext={next} onBack={back} />}
        {step === 4 && <Step4Danos onNext={next} onBack={back} />}
        {step === 5 && <Step5Sujeira onNext={next} onBack={back} />}
        {step === 6 && <Step6Fotos onNext={next} onBack={back} />}
        {step === 7 && <Step7Revisao onNext={next} onBack={back} />}
        {step === 8 && <Step8Assinaturas onBack={back} />}
      </div>
    </div>
  )
}

export default function NovaVistoria() {
  return (
    <VistoriaProvider>
      <WizardContent />
    </VistoriaProvider>
  )
}
