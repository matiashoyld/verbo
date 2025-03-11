import { useRouter } from "next/navigation";
import React from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

interface PermissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  permissionsGranted: boolean;
  permissionError: string | null;
  permissionStep: "initial" | "microphone" | "screen";
  requestPermissions: () => Promise<void>;
}

const PermissionDialog: React.FC<PermissionDialogProps> = ({
  open,
  onOpenChange,
  permissionsGranted,
  permissionError,
  permissionStep,
  requestPermissions,
}) => {
  const router = useRouter();

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        // Only allow closing the dialog if permissions are granted
        if (!open && !permissionsGranted) {
          return;
        }
        onOpenChange(open);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-verbo-dark">
            Permission Required
          </DialogTitle>
          <DialogDescription>
            This assessment requires audio and screen recording to accurately
            evaluate your skills. Your session will be recorded for AI analysis.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col space-y-4 py-4">
          <div className="rounded-md bg-verbo-purple/10 p-4">
            <p className="text-sm text-verbo-dark">
              When you click "Allow Recording" below, your browser will ask for
              permission to:
            </p>
            <ul className="mt-2 list-disc pl-5 text-sm text-verbo-dark/80">
              <li>Access your microphone for audio recording</li>
              <li>Share your screen for visual assessment</li>
            </ul>

            {permissionStep === "screen" && (
              <div className="mt-3 rounded-md bg-verbo-green/10 p-3">
                <p className="text-sm font-medium text-verbo-dark">
                  Important:
                </p>
                <p className="mt-1 text-sm text-verbo-dark/80">
                  In the screen selection dialog that appears, please select the{" "}
                  <strong>"Entire screen"</strong> option and click "Share" to
                  ensure accurate assessment.
                </p>
                <div className="mt-2 overflow-hidden rounded border border-border/30">
                  <img
                    src="/images/screen-share-guide.png"
                    alt="Screen sharing guide"
                    className="w-full"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                </div>
              </div>
            )}

            <p className="mt-2 text-sm italic text-verbo-dark/70">
              Note: All recordings are used solely for the purpose of this
              assessment and will be processed securely.
            </p>
          </div>

          {permissionError && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">
                {permissionError}
              </p>
              <p className="mt-1 text-xs text-red-700">
                Tip: Check your browser settings to ensure that permissions for
                this site are not blocked.
              </p>
            </div>
          )}
        </div>
        <DialogFooter className="flex flex-col gap-2 sm:flex-row">
          <Button
            onClick={requestPermissions}
            className="w-full bg-verbo-purple text-white hover:bg-verbo-purple/90 sm:w-auto"
          >
            {permissionError ? "Retry" : "Allow Recording"}
          </Button>
          {permissionError && (
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="w-full sm:w-auto"
            >
              Return to Home
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PermissionDialog;
