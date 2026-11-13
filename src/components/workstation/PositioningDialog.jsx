import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import PositionSimulation from '@/components/workstation/PositionSimulation';
import PositionGuidelines from '@/components/workstation/PositionGuidelines';

export default function PositioningDialog({ ws, open, onOpenChange }) {
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto rounded-sm border-border bg-ws-surface p-0">
      <DialogHeader className="border-b border-border px-4 py-3">
        <DialogTitle className="text-sm">{ws.rayidOn ? 'PATIENT / TUBE POSITIONING' : 'EXAMINATION REFERENCE'}</DialogTitle>
        <DialogDescription className="text-xs">Adjust the positioning inputs; the camera view and RAYID guidance update immediately.</DialogDescription>
      </DialogHeader>
      <div className="pb-4">
        {ws.rayidOn && <PositionSimulation ws={ws} />}
        <PositionGuidelines projection={ws.projection} />
      </div>
    </DialogContent>
  </Dialog>;
}