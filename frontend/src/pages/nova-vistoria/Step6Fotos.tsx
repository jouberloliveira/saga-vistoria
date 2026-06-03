import { useState, useRef } from 'react'
import { useVistoria } from '../../contexts/VistoriaContext'
import { uploadFoto } from '../../api/vistorias'
import type { Foto } from '../../api/vistorias'
import { Camera, Upload, X, Loader2, Image } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Step6Fotos({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { data } = useVistoria()
  const [fotos, setFotos] = useState<Foto[]>([])
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return
    if (!data.vistoriaId) {
      toast.error('Salve a vistoria antes de enviar fotos')
      return
    }
    setUploading(true)
    try {
      const formData = new FormData()
      Array.from(files).forEach((f) => formData.append('fotos', f))
      const uploaded = await uploadFoto(data.vistoriaId, formData)
      setFotos((prev) => [...prev, ...uploaded])
      toast.success(`${uploaded.length} foto(s) enviada(s)`)
    } catch {
      toast.error('Erro ao enviar fotos')
    } finally {
      setUploading(false)
    }
  }

  const removePhoto = (id: string) => setFotos((prev) => prev.filter((f) => f.id !== id))

  return (
    <div className="space-y-5">
      {/* Upload zone */}
      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
        className="border-2 border-dashed border-gray-300 hover:border-[#f97316] rounded-2xl p-10 text-center cursor-pointer transition-colors"
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {uploading ? (
          <Loader2 className="w-10 h-10 text-gray-400 animate-spin mx-auto mb-3" />
        ) : (
          <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
        )}
        <p className="text-sm font-medium text-gray-700">Clique ou arraste fotos aqui</p>
        <p className="text-xs text-gray-500 mt-1">JPG, PNG, HEIC — múltiplos arquivos</p>
      </div>

      {/* Camera button (mobile) */}
      <button
        type="button"
        onClick={() => {
          if (fileRef.current) {
            fileRef.current.capture = 'environment'
            fileRef.current.click()
          }
        }}
        className="md:hidden flex items-center justify-center gap-2 w-full border border-[#1e3a5f] text-[#1e3a5f] font-semibold py-3 rounded-xl hover:bg-blue-50 transition-colors min-h-[48px]"
      >
        <Camera className="w-4 h-4" />
        Tirar foto
      </button>

      {/* Preview grid */}
      {fotos.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {fotos.map((foto) => (
            <div key={foto.id} className="relative group rounded-xl overflow-hidden bg-gray-100 aspect-square">
              <img src={foto.url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(foto.id)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
              {foto.danoId && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-2 py-1 truncate">
                  Dano vinculado
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-2xl text-gray-400">
          <Image className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">Nenhuma foto adicionada</p>
        </div>
      )}

      {!data.vistoriaId && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
          As fotos serão salvas após a finalização da vistoria. Você pode prosseguir sem elas.
        </div>
      )}

      <div className="flex justify-between pt-4">
        <button type="button" onClick={onBack} className="px-8 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors min-h-[48px]">
          Voltar
        </button>
        <button type="button" onClick={onNext} className="bg-[#1e3a5f] hover:bg-[#2d5a8e] text-white font-semibold px-8 py-3 rounded-xl transition-colors min-h-[48px]">
          Próximo
        </button>
      </div>
    </div>
  )
}
