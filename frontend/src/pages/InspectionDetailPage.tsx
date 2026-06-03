import { useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import SignatureCanvas from 'react-signature-canvas'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import {
  ArrowLeft, Pencil, Plus, Trash2, Camera, FileText,
  CheckCircle2, Clock, PenLine, Download
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useForm } from 'react-hook-form'
import api from '../api'
import type { Inspection } from '../types'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import Badge from '../components/Badge'
import Button from '../components/Button'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import Select from '../components/Select'
import Textarea from '../components/Textarea'

const ITEM_TYPES = [
  { value: 'arranhão', label: 'Arranhão' },
  { value: 'amassado', label: 'Amassado' },
  { value: 'trinca', label: 'Trinca' },
  { value: 'quebrado', label: 'Quebrado' },
  { value: 'faltando', label: 'Faltando' },
  { value: 'outro', label: 'Outro' },
]

const LOCATIONS = [
  { value: 'para-choque dianteiro', label: 'Para-choque Dianteiro' },
  { value: 'para-choque traseiro', label: 'Para-choque Traseiro' },
  { value: 'capô', label: 'Capô' },
  { value: 'teto', label: 'Teto' },
  { value: 'porta dianteira esquerda', label: 'Porta Dianteira Esquerda' },
  { value: 'porta dianteira direita', label: 'Porta Dianteira Direita' },
  { value: 'porta traseira esquerda', label: 'Porta Traseira Esquerda' },
  { value: 'porta traseira direita', label: 'Porta Traseira Direita' },
  { value: 'lateral esquerda', label: 'Lateral Esquerda' },
  { value: 'lateral direita', label: 'Lateral Direita' },
  { value: 'mala', label: 'Mala' },
  { value: 'parabrisa', label: 'Parabrisa' },
  { value: 'vidro traseiro', label: 'Vidro Traseiro' },
  { value: 'outro', label: 'Outro' },
]

const SEVERITY = [
  { value: 'low', label: 'Leve' },
  { value: 'medium', label: 'Moderado' },
  { value: 'high', label: 'Grave' },
]

interface ItemForm {
  type: string
  location: string
  severity: 'low' | 'medium' | 'high'
  notes: string
}

function SeverityBadge({ s }: { s: string }) {
  const map: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'neutral' }> = {
    low: { label: 'Leve', variant: 'success' },
    medium: { label: 'Moderado', variant: 'warning' },
    high: { label: 'Grave', variant: 'danger' },
  }
  const v = map[s] ?? { label: s, variant: 'neutral' as const }
  return <Badge variant={v.variant}>{v.label}</Badge>
}

export default function InspectionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const pdfRef = useRef<HTMLDivElement>(null)

  const [itemModal, setItemModal] = useState(false)
  const [sigModal, setSigModal] = useState<'employee' | 'client' | null>(null)
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null)
  const [photoInputRef, setPhotoInputRef] = useState<HTMLInputElement | null>(null)
  const sigRef = useRef<SignatureCanvas>(null)

  const { data: inspection, isLoading } = useQuery<Inspection>({
    queryKey: ['inspection', id],
    queryFn: () => api.get(`/inspections/${id}`).then((r) => r.data),
  })

  const {
    register,
    handleSubmit,
    reset: resetItemForm,
    formState: { errors: itemErrors },
  } = useForm<ItemForm>({ defaultValues: { severity: 'low' } })

  const addItem = useMutation({
    mutationFn: (data: ItemForm) => api.post(`/inspections/${id}/items`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inspection', id] })
      setItemModal(false)
      resetItemForm({ severity: 'low', type: '', location: '', notes: '' })
    },
  })

  const removeItem = useMutation({
    mutationFn: (itemId: string) => api.delete(`/inspections/${id}/items/${itemId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inspection', id] })
      setDeleteItemId(null)
    },
  })

  const addPhoto = useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData()
      fd.append('file', file)
      return api.post(`/inspections/${id}/photos`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inspection', id] }),
  })

  const deletePhoto = useMutation({
    mutationFn: (photoId: string) => api.delete(`/inspections/${id}/photos/${photoId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inspection', id] }),
  })

  const sign = useMutation({
    mutationFn: ({ type, data }: { type: string; data: string }) =>
      api.post(`/inspections/${id}/sign`, { type, data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inspection', id] })
      setSigModal(null)
    },
  })

  const handleSign = () => {
    if (!sigRef.current || sigRef.current.isEmpty()) return
    const data = sigRef.current.toDataURL('image/png')
    sign.mutate({ type: sigModal!, data })
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) addPhoto.mutate(file)
    e.target.value = ''
  }

  const generatePDF = async () => {
    if (!pdfRef.current) return
    const canvas = await html2canvas(pdfRef.current, { scale: 2, useCORS: true })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pageW = pdf.internal.pageSize.getWidth()
    const pageH = (canvas.height * pageW) / canvas.width
    pdf.addImage(imgData, 'PNG', 0, 0, pageW, pageH)
    pdf.save(`vistoria-${inspection?.plate ?? id}.pdf`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full" />
      </div>
    )
  }

  if (!inspection) {
    return <p className="text-center text-slate-500 py-16">Vistoria não encontrada</p>
  }

  const isSigned = inspection.status === 'signed'
  const hasEmpSig = inspection.signatures?.some((s) => s.type === 'employee')
  const hasClientSig = inspection.signatures?.some((s) => s.type === 'client')

  return (
    <div>
      <PageHeader
        title={`Vistoria — ${inspection.plate}`}
        subtitle={`${inspection.brand} ${inspection.model}${inspection.year ? ` (${inspection.year})` : ''}`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => navigate('/inspections')}>
              <ArrowLeft className="w-4 h-4" /> Voltar
            </Button>
            {!isSigned && (
              <Button variant="secondary" size="sm" onClick={() => navigate(`/inspections/${id}/edit`)}>
                <Pencil className="w-4 h-4" /> Editar
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={generatePDF}>
              <Download className="w-4 h-4" /> PDF
            </Button>
          </div>
        }
      />

      <div ref={pdfRef} className="space-y-5">
        {/* Status bar */}
        <Card className="p-4 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            {isSigned ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            ) : (
              <Clock className="w-5 h-5 text-amber-500" />
            )}
            <Badge variant={isSigned ? 'success' : 'warning'}>
              {isSigned ? 'Assinada' : 'Em Aberto'}
            </Badge>
          </div>
          {isSigned && inspection.signed_at && (
            <span className="text-xs text-slate-500">
              Assinada em {format(new Date(inspection.signed_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
            </span>
          )}
          <div className="ml-auto flex items-center gap-3 text-xs text-slate-500">
            <span>Inspetor: <strong>{inspection.employee_name}</strong></span>
            <span>Data: <strong>{format(new Date(inspection.created_at), "dd/MM/yyyy", { locale: ptBR })}</strong></span>
          </div>
        </Card>

        {/* Info cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Card className="p-5">
            <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2 text-sm">
              <FileText className="w-4 h-4" /> Dados do Cliente
            </h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Nome</dt>
                <dd className="font-medium text-slate-800">{inspection.client_name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">CPF</dt>
                <dd className="font-mono text-slate-700">{inspection.client_cpf}</dd>
              </div>
              {inspection.mileage != null && (
                <div className="flex justify-between">
                  <dt className="text-slate-500">Quilometragem</dt>
                  <dd className="text-slate-700">{inspection.mileage.toLocaleString('pt-BR')} km</dd>
                </div>
              )}
            </dl>
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold text-slate-800 mb-3 text-sm">Veículo</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Placa</dt>
                <dd className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">{inspection.plate}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Marca / Modelo</dt>
                <dd className="text-slate-700">{inspection.brand} {inspection.model}</dd>
              </div>
              {inspection.year && (
                <div className="flex justify-between">
                  <dt className="text-slate-500">Ano</dt>
                  <dd className="text-slate-700">{inspection.year}</dd>
                </div>
              )}
              {inspection.color && (
                <div className="flex justify-between">
                  <dt className="text-slate-500">Cor</dt>
                  <dd className="text-slate-700 capitalize">{inspection.color}</dd>
                </div>
              )}
            </dl>
          </Card>
        </div>

        {inspection.notes && (
          <Card className="p-5">
            <h3 className="font-semibold text-slate-800 mb-2 text-sm">Observações</h3>
            <p className="text-sm text-slate-600 whitespace-pre-line">{inspection.notes}</p>
          </Card>
        )}

        {/* Items */}
        <Card>
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
              Itens da Vistoria
              <Badge variant="neutral">{inspection.items?.length ?? 0}</Badge>
            </h3>
            {!isSigned && (
              <Button size="sm" variant="secondary" onClick={() => setItemModal(true)}>
                <Plus className="w-4 h-4" /> Adicionar Item
              </Button>
            )}
          </div>
          {!inspection.items?.length ? (
            <div className="py-8 text-center text-sm text-slate-400">Nenhum item registrado</div>
          ) : (
            <div className="divide-y divide-slate-50">
              {inspection.items.map((item) => (
                <div key={item.id} className="px-5 py-3 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-slate-800 capitalize">{item.type}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-600 capitalize">{item.location}</span>
                      <SeverityBadge s={item.severity} />
                    </div>
                    {item.notes && <p className="text-xs text-slate-400 mt-0.5">{item.notes}</p>}
                  </div>
                  {!isSigned && (
                    <button
                      onClick={() => setDeleteItemId(item.id)}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                      aria-label="Remover item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Photos */}
        <Card>
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
              Fotos
              <Badge variant="neutral">{inspection.photos?.length ?? 0}</Badge>
            </h3>
            {!isSigned && (
              <>
                <Button size="sm" variant="secondary" onClick={() => photoInputRef?.click()}>
                  <Camera className="w-4 h-4" /> Adicionar Foto
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={(el) => setPhotoInputRef(el)}
                  onChange={handlePhotoChange}
                />
              </>
            )}
          </div>
          {!inspection.photos?.length ? (
            <div className="py-8 text-center text-sm text-slate-400">Nenhuma foto anexada</div>
          ) : (
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {inspection.photos.map((photo) => (
                <div key={photo.id} className="relative group aspect-square rounded-xl overflow-hidden bg-slate-100">
                  <img
                    src={`/uploads/${photo.filename}`}
                    alt={photo.original_name}
                    className="w-full h-full object-cover"
                  />
                  {!isSigned && (
                    <button
                      onClick={() => deletePhoto.mutate(photo.id)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      aria-label="Remover foto"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Signatures */}
        <Card className="p-5">
          <h3 className="font-semibold text-slate-800 mb-4 text-sm flex items-center gap-2">
            <PenLine className="w-4 h-4" /> Assinaturas
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(['employee', 'client'] as const).map((type) => {
              const has = type === 'employee' ? hasEmpSig : hasClientSig
              const sig = inspection.signatures?.find((s) => s.type === type)
              return (
                <div key={type} className="border border-slate-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                    {type === 'employee' ? 'Inspetor' : 'Cliente'}
                  </p>
                  {has ? (
                    <div className="flex items-center gap-2 text-emerald-600">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-sm font-medium">Assinado</span>
                      {sig && (
                        <span className="text-xs text-slate-400 ml-auto">
                          {format(new Date(sig.created_at), "dd/MM HH:mm")}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-slate-400 mb-2">Aguardando assinatura</p>
                      {!isSigned && (
                        <Button size="sm" variant="secondary" onClick={() => setSigModal(type)}>
                          <PenLine className="w-3.5 h-3.5" /> Assinar
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* Add Item Modal */}
      <Modal open={itemModal} onClose={() => setItemModal(false)} title="Adicionar Item" size="md">
        <form onSubmit={handleSubmit((d) => addItem.mutate(d))} noValidate className="space-y-4">
          <Select
            label="Tipo de Dano"
            placeholder="Selecione..."
            options={ITEM_TYPES}
            error={itemErrors.type?.message}
            {...register('type', { required: 'Selecione o tipo' })}
          />
          <Select
            label="Localização"
            placeholder="Selecione..."
            options={LOCATIONS}
            error={itemErrors.location?.message}
            {...register('location', { required: 'Selecione a localização' })}
          />
          <Select
            label="Severidade"
            options={SEVERITY}
            {...register('severity')}
          />
          <Textarea
            label="Observações (opcional)"
            placeholder="Descreva o dano..."
            {...register('notes')}
          />
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="secondary" type="button" onClick={() => setItemModal(false)}>Cancelar</Button>
            <Button type="submit" loading={addItem.isPending}>Adicionar</Button>
          </div>
        </form>
      </Modal>

      {/* Signature Modal */}
      <Modal
        open={!!sigModal}
        onClose={() => setSigModal(null)}
        title={sigModal === 'employee' ? 'Assinatura do Inspetor' : 'Assinatura do Cliente'}
        size="lg"
      >
        <div className="space-y-4">
          <div className="border-2 border-dashed border-slate-200 rounded-xl overflow-hidden">
            <SignatureCanvas
              ref={sigRef}
              canvasProps={{ width: 500, height: 200, className: 'w-full' }}
              backgroundColor="white"
            />
          </div>
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => sigRef.current?.clear()}
              className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
            >
              Limpar
            </button>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setSigModal(null)}>Cancelar</Button>
              <Button onClick={handleSign} loading={sign.isPending}>Confirmar Assinatura</Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Item Confirm */}
      <ConfirmDialog
        open={!!deleteItemId}
        onClose={() => setDeleteItemId(null)}
        onConfirm={() => deleteItemId && removeItem.mutate(deleteItemId)}
        loading={removeItem.isPending}
        title="Remover Item"
        description="Deseja remover este item da vistoria?"
        confirmLabel="Remover"
      />
    </div>
  )
}
