import { useEffect, useState } from 'react';
import { Video, Plus, Trash2, ExternalLink, Save, AlertCircle, Search } from 'lucide-react';
import { useAthletes } from '@/lib/athlete-context';
import { Card, SectionHeader, Spinner, EmptyState, ErrorState, Badge } from '@/components/ui';
import { Modal } from '@/components/Modal';
import { formatDate } from '@/lib/constants';
import { fetchVideos, createVideo, deleteVideo } from '@/lib/api';
import type { TechniqueVideo } from '@/lib/types';

const CATEGORIES = ['Sparring', 'Seni', 'Teknik Dasar', 'Pertandingan', 'Lainnya'];

function embedUrl(url: string): string | null {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,20})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const drive = url.match(/drive\.google\.com\/file\/d\/([\w-]+)/);
  if (drive) return `https://drive.google.com/file/d/${drive[1]}/preview`;
  return null;
}

const emptyForm = {
  title: '',
  video_url: '',
  category: 'Sparring',
  weakness_notes: '',
  recorded_at: '',
};

export default function VideoAnalysis() {
  const { selected, loading: athLoading, error: athError } = useAthletes();
  const [videos, setVideos] = useState<TechniqueVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<TechniqueVideo | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = async () => {
    if (!selected) {
      setVideos([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setVideos(await fetchVideos(selected.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memuat video');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id]);

  if (athLoading) return <Spinner label="Memuat…" />;
  if (athError) return <ErrorState message={athError} />;
  if (!selected) {
    return <EmptyState icon={<Video className="h-7 w-7" />} title="Pilih atlet dulu" hint="Gunakan pemilih atlet di kanan atas." />;
  }

  const submit = async () => {
    if (!form.title.trim() || !form.video_url.trim()) return;
    setSaving(true);
    setFormError(null);
    try {
      const created = await createVideo({
        athlete_id: selected.id,
        title: form.title.trim(),
        video_url: form.video_url.trim(),
        category: form.category,
        weakness_notes: form.weakness_notes.trim() || null,
        recorded_at: form.recorded_at || null,
      });
      setVideos((prev) => [created, ...prev]);
      setForm(emptyForm);
      setOpen(false);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Gagal menyimpan video');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await deleteVideo(id);
      setVideos((prev) => prev.filter((v) => v.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menghapus video');
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Video Analisis Teknik"
        subtitle="Rekaman sparring / jurus seni + evaluasi titik lemah oleh pelatih"
        action={
          <button onClick={() => { setForm(emptyForm); setFormError(null); setOpen(true); }} className="btn-primary text-xs">
            <Plus className="h-4 w-4" /> Tambah Video
          </button>
        }
      />

      {error && <ErrorState message={error} />}

      {loading ? (
        <Spinner label="Memuat video…" />
      ) : videos.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Video className="h-7 w-7" />}
            title="Belum ada video analisis"
            hint="Tempel tautan YouTube / Google Drive rekaman latihan, lalu tulis evaluasi titik lemahnya."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {videos.map((v) => (
            <Card key={v.id} className="card-hover flex flex-col !p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">{v.title}</p>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {v.recorded_at ? formatDate(v.recorded_at) : 'Tanpa tanggal'}
                  </p>
                </div>
                {v.category && <Badge color="accent">{v.category}</Badge>}
              </div>
              <button
                onClick={() => setPreview(v)}
                className="group relative mt-3 flex h-36 items-center justify-center overflow-hidden rounded-xl bg-ink-900/60"
              >
                <Video className="h-10 w-10 text-slate-600 transition group-hover:scale-110 group-hover:text-accent-400" />
                <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 bg-black/50 py-2 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100">
                  <ExternalLink className="h-3.5 w-3.5" /> Tonton / pratinjau
                </span>
              </button>
              {v.weakness_notes && (
                <div className="mt-3 rounded-xl border border-warning-500/30 bg-warning-500/10 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-warning-400">Evaluasi Titik Lemah</p>
                  <p className="mt-1 text-xs text-slate-300">{v.weakness_notes}</p>
                </div>
              )}
              <div className="mt-3 flex items-center justify-between">
                <a
                  href={v.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs font-semibold text-accent-300 hover:text-accent-200"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Buka tautan asli
                </a>
                <button
                  onClick={() => remove(v.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-danger-500/15 hover:text-danger-400"
                  aria-label="Hapus video"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add modal */}
      <Modal open={open} onClose={() => setOpen(false)} title="Tambah Video Analisis" size="md">
        <div className="space-y-4">
          {formError && (
            <div className="flex items-start gap-2 rounded-xl border border-danger-500/30 bg-danger-500/10 p-3 text-sm text-danger-400">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}
          <div>
            <label className="label">Judul</label>
            <input className="input" placeholder="mis. Sparring Try-Out 12 Nov" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} autoFocus />
          </div>
          <div>
            <label className="label">Tautan Video (YouTube / Google Drive)</label>
            <input className="input" placeholder="https://youtube.com/watch?v=…" value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Kategori</label>
              <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Tanggal Rekam (opsional)</label>
              <input type="date" className="input" value={form.recorded_at} onChange={(e) => setForm({ ...form, recorded_at: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">Evaluasi Titik Lemah (opsional)</label>
            <textarea className="input min-h-[80px]" placeholder="Tendangan sabit lambat, kuda-kuda sering lebar saat bertahan…" value={form.weakness_notes} onChange={(e) => setForm({ ...form, weakness_notes: e.target.value })} />
          </div>
          <button onClick={submit} disabled={saving || !form.title.trim() || !form.video_url.trim()} className="btn-primary w-full">
            <Save className="h-4 w-4" /> {saving ? 'Menyimpan…' : 'Simpan Video'}
          </button>
        </div>
      </Modal>

      {/* Preview modal */}
      <Modal open={preview !== null} onClose={() => setPreview(null)} title={preview?.title ?? 'Pratinjau'} size="lg">
        {preview && (
          <div className="space-y-3">
            <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
              {embedUrl(preview.video_url) ? (
                <iframe
                  src={embedUrl(preview.video_url)!}
                  className="h-full w-full"
                  allow="autoplay; encrypted-media; fullscreen"
                  allowFullScreen
                  title={preview.title}
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
                  <Search className="h-8 w-8 text-slate-600" />
                  <p className="text-sm text-slate-400">Tautan tidak dapat disematkan. Buka tautan asli untuk menonton.</p>
                  <a href={preview.video_url} target="_blank" rel="noopener noreferrer" className="btn-primary text-xs">
                    <ExternalLink className="h-4 w-4" /> Buka Tautan
                  </a>
                </div>
              )}
            </div>
            {preview.weakness_notes && (
              <div className="rounded-xl border border-warning-500/30 bg-warning-500/10 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-warning-400">Evaluasi Titik Lemah</p>
                <p className="mt-1 text-sm text-slate-300">{preview.weakness_notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
