import React, { useState } from 'react';
import { X, Calendar, Image as ImageIcon, MessageSquare, Stamp, AlertCircle, Upload, Trash2 } from 'lucide-react';
import { Establishment, CheckIn, UserProfile } from '../types';
import { saveCheckInAsync } from '../services/passport';

interface CheckInModalProps {
  isOpen: boolean;
  establishment: Establishment | null;
  user: UserProfile | null;
  onClose: () => void;
  onSuccess: (updatedCheckIns: CheckIn[]) => void;
  onRequestAuth: () => void;
}

const compressImageFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 800; // max width/height
        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.75));
        } else {
          reject(new Error('Canvas context failed'));
        }
      };
      img.onerror = reject;
      img.src = event.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const CheckInModal: React.FC<CheckInModalProps> = ({
  isOpen,
  establishment,
  user,
  onClose,
  onSuccess,
  onRequestAuth,
}) => {
  const [visitDate, setVisitDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [experienceNote, setExperienceNote] = useState('');
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !establishment) return null;

  if (!user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/80 backdrop-blur-sm p-4 overflow-y-auto">
        <div className="relative w-full max-w-md bg-stone-50 border-2 border-red-900/30 rounded-2xl p-6 text-center shadow-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 bg-red-100 text-red-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-300">
            <Stamp className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-xl font-bold text-stone-900 mb-2">
            Autenticação Necessária
          </h3>
          <p className="text-sm text-stone-600 mb-6">
            Para carimbar sua visita em <strong className="text-red-900">{establishment.name}</strong> e salvar no seu passaporte, você precisa estar conectado à sua conta.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 border border-stone-300 text-stone-700 text-sm font-medium rounded-xl hover:bg-stone-100"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                onClose();
                onRequestAuth();
              }}
              className="flex-1 py-2.5 bg-red-900 text-amber-50 text-sm font-medium rounded-xl hover:bg-red-950 shadow"
            >
              Entrar / Cadastrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 3 - photoUrls.length;
    if (remainingSlots <= 0) return;

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    setLoading(true);

    try {
      const newUrls = [...photoUrls];
      for (const file of filesToProcess) {
        const compressed = await compressImageFile(file);
        newUrls.push(compressed);
      }
      setPhotoUrls(newUrls.slice(0, 3));
    } catch (err) {
      console.error('Erro ao processar imagens:', err);
      setError('Erro ao carregar imagens. Tente novamente.');
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotoUrls(photoUrls.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!experienceNote.trim()) {
      setError('Por favor, escreva um breve relato da sua experiência.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newCheckIn: CheckIn = {
        id: `checkin_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        userId: user.uid,
        userEmail: user.email || undefined,
        authorName: user.displayName || user.email?.split('@')[0] || 'Companheiro(a)',
        establishmentId: establishment.id,
        visitDate,
        experienceNote: experienceNote.trim(),
        photoUrl: photoUrls[0] || undefined,
        photoUrls: photoUrls.length > 0 ? photoUrls : undefined,
        createdAt: new Date().toISOString(),
        status: 'pending',
      };

      const checkIns = await saveCheckInAsync(newCheckIn);
      onSuccess(checkIns);
      onClose();
    } catch (err) {
      console.error('Erro ao salvar check-in:', err);
      setError('Não foi possível registrar a visita. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-stone-50 border-2 border-red-900/30 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="bg-stone-900 text-stone-100 p-5 relative border-b border-stone-800 flex items-center gap-3">
          <div className="p-2.5 bg-red-900 text-amber-200 rounded-xl border border-red-700 shrink-0">
            <Stamp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-sans font-semibold uppercase tracking-widest text-red-300">
              Carimbando Passaporte
            </span>
            <h3 className="font-serif text-lg font-bold text-amber-100 leading-tight">
              {establishment.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="ml-auto p-2 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-red-800" />
              Data da Visita
            </label>
            <input
              type="date"
              required
              value={visitDate}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setVisitDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-red-800" />
              Relato da Experiência
            </label>
            <textarea
              required
              rows={4}
              maxLength={1000}
              placeholder="O que você experimentou aqui? Pratos marcantes, conversa com produtores, ambiente..."
              value={experienceNote}
              onChange={(e) => setExperienceNote(e.target.value)}
              className="w-full p-3 bg-white border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-800 resize-none"
            />
            <span className="text-[11px] text-stone-400 text-right block mt-1">
              {experienceNote.length}/1000 caracteres
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-red-800" />
                Fotos da Visita ({photoUrls.length}/3)
              </label>
              <span className="text-[11px] text-stone-500">
                Hospedagem gratuita na nuvem
              </span>
            </div>

            {/* Upload Area / Previews */}
            <div className="space-y-3">
              {photoUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {photoUrls.map((url, idx) => (
                    <div key={idx} className="relative rounded-xl overflow-hidden h-24 border border-stone-300 bg-stone-100 group">
                      <img
                        src={url}
                        alt={`Foto ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        className="absolute top-1 right-1 p-1 bg-stone-900/80 text-white rounded-full opacity-90 hover:opacity-100 transition-opacity"
                        title="Remover foto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {photoUrls.length < 3 && (
                <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-stone-300 rounded-xl bg-white hover:bg-stone-50 transition-colors cursor-pointer text-center">
                  <Upload className="w-6 h-6 text-stone-400 mb-1" />
                  <span className="text-xs font-semibold text-stone-700">
                    Clique para selecionar do dispositivo
                  </span>
                  <span className="text-[10px] text-stone-500 mt-0.5">
                    JPEG, PNG ou WEBP (até 3 fotos)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFilesSelected}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-stone-300 text-stone-700 font-medium text-sm rounded-xl hover:bg-stone-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 bg-red-900 hover:bg-red-950 text-amber-50 font-medium text-sm rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-amber-100 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Stamp className="w-4 h-4 text-amber-300" />
                  Carimbar no Passaporte
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
