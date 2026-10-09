import React from "react";
import { AlertDialog, Button, Spinner } from "@heroui/react";

export interface ConfirmationDialogProps {
  isOpen: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: React.ReactNode;
  children?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  status?: "danger" | "accent" | "warning" | "success";
  confirmVariant?: "primary" | "danger" | "secondary" | "tertiary" | "outline";
  isPending?: boolean;
  confirmIcon?: React.ReactNode;
  dialogClassName?: string;
}

/**
 * Reusable Confirmation Dialog for the Admin & Staff Portals.
 * Uses HeroUI React v3 AlertDialog under the hood for accessible, animated modal confirmations.
 */
export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onOpenChange,
  onClose,
  onConfirm,
  title,
  description,
  children,
  confirmText = "Confirm",
  cancelText = "Cancel",
  status = "accent",
  confirmVariant,
  isPending = false,
  confirmIcon,
  dialogClassName = "sm:max-w-[460px]",
}) => {
  const effectiveConfirmVariant =
    confirmVariant || (status === "danger" ? "danger" : "primary");

  return (
    <AlertDialog.Backdrop
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open && !isPending) {
          onClose();
        }
        onOpenChange?.(open);
      }}
      className="z-[70]"
    >
      <AlertDialog.Container>
        <AlertDialog.Dialog className={dialogClassName}>
          <AlertDialog.CloseTrigger isDisabled={isPending} onPress={onClose} />
          <AlertDialog.Header>
            <AlertDialog.Icon status={status} />
            <AlertDialog.Heading>{title}</AlertDialog.Heading>
          </AlertDialog.Header>
          <AlertDialog.Body>
            {description && (
              <div className="space-y-2 text-sm">
                {description}
              </div>
            )}
            {children}
          </AlertDialog.Body>
          <AlertDialog.Footer>
            <Button
              variant="tertiary"
              onPress={onClose}
              isDisabled={isPending}
            >
              {cancelText}
            </Button>
            <Button
              variant={effectiveConfirmVariant}
              onPress={onConfirm}
              isDisabled={isPending}
              className={`gap-1.5 ${
                status === "danger"
                  ? ""
                  : "bg-sky-600 hover:bg-sky-500 text-white"
              }`}
            >
              {isPending ? (
                <Spinner size="sm" />
              ) : (
                confirmIcon
              )}
              <span>{confirmText}</span>
            </Button>
          </AlertDialog.Footer>
        </AlertDialog.Dialog>
      </AlertDialog.Container>
    </AlertDialog.Backdrop>
  );
};

export default ConfirmationDialog;
