import { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { resetAllStudies } from '@/lib/resetStudies';

export default function ResetStudiesButton() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function confirm() {
    setBusy(true); setError('');
    try {
      await resetAllStudies();
      window.location.reload();
    } catch (e) {
      setError('The worklist could not be reset. Please try again.');
      setBusy(false);
    }
  }

  return <AlertDialog>
    <AlertDialogTrigger asChild>
      <button type="button" disabled={busy} className="rounded-sm px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-slate-600 transition-colors hover:bg-white/[0.04] hover:text-slate-400 disabled:opacity-50">Reset all studies</button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Reset all patients and studies?</AlertDialogTitle>
        <AlertDialogDescription>This will return every patient and study to its initial scheduled state and clear all examination progress.</AlertDialogDescription>
      </AlertDialogHeader>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <AlertDialogFooter>
        <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
        <AlertDialogAction disabled={busy} onClick={(event) => { event.preventDefault(); confirm(); }} className="bg-rayid text-rayid-foreground hover:bg-rayid/90">{busy ? 'Resetting…' : 'Confirm reset'}</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>;
}