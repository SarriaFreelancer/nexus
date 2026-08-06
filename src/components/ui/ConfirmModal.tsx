import React, { useEffect } from "react";
import { X, FileText, Folder, AlertTriangle, RefreshCw, Trash2, File } from "lucide-react";

export type ConfirmVariant = "danger" | "warning" | "success" | "info";

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  subtitle?: string;
  itemName?: string;
  description?: React.ReactNode;
  warningText?: React.ReactNode;
  confirmText: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  icon?: "file" | "folder" | "alert" | "restore" | "trash";
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  subtitle,
  itemName,
  description,
  warningText,
  confirmText,
  cancelText = "Cancelar",
  variant = "danger",
  icon = "alert",
  isLoading = false,
}: ConfirmModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose, isLoading]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isLoading) onClose();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          iconBg: "bg-red-50 dark:bg-red-500/10",
          iconColor: "text-red-500 dark:text-red-400",
          buttonBg: "bg-red-600 hover:bg-red-700 text-white",
          titleColor: "text-red-600 dark:text-red-400",
        };
      case "warning":
        return {
          iconBg: "bg-orange-50 dark:bg-orange-500/10",
          iconColor: "text-orange-500 dark:text-orange-400",
          buttonBg: "bg-orange-500 hover:bg-orange-600 text-white",
          titleColor: "text-slate-800 dark:text-slate-100",
        };
      case "success":
        return {
          iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
          iconColor: "text-emerald-500 dark:text-emerald-400",
          buttonBg: "bg-emerald-500 hover:bg-emerald-600 text-white",
          titleColor: "text-slate-800 dark:text-slate-100",
        };
      default:
        return {
          iconBg: "bg-blue-50 dark:bg-blue-500/10",
          iconColor: "text-blue-500 dark:text-blue-400",
          buttonBg: "bg-blue-600 hover:bg-blue-700 text-white",
          titleColor: "text-slate-800 dark:text-slate-100",
        };
    }
  };

  const styles = getVariantStyles();

  const IconComponent = () => {
    switch (icon) {
      case "file": return <FileText className={`w-8 h-8 ${styles.iconColor}`} strokeWidth={1.5} />;
      case "folder": return <Folder className={`w-8 h-8 ${styles.iconColor}`} strokeWidth={1.5} />;
      case "restore": return <RefreshCw className={`w-8 h-8 ${styles.iconColor}`} strokeWidth={1.5} />;
      case "trash": return <Trash2 className={`w-8 h-8 ${styles.iconColor}`} strokeWidth={1.5} />;
      default: return <AlertTriangle className={`w-8 h-8 ${styles.iconColor}`} strokeWidth={1.5} />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] p-4 animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-[400px] bg-white dark:bg-[#1A1F2E] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-center p-5 relative">
          <h2 className={`text-sm font-extrabold ${variant === 'danger' && title.includes('permanentemente') ? styles.titleColor : 'text-slate-900 dark:text-slate-100'}`}>
            {title}
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="absolute right-4 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 flex flex-col items-center text-center pb-6">
          <div className={`w-20 h-20 rounded-full ${styles.iconBg} flex items-center justify-center mb-6`}>
            <IconComponent />
          </div>
          
          {subtitle && (
            <p className="text-[13px] text-slate-500 dark:text-slate-400 mb-1 font-medium">{subtitle}</p>
          )}
          
          {itemName && (
            <p className="text-[15px] font-bold text-slate-900 dark:text-slate-100 mb-4">{itemName}</p>
          )}
          
          {description && (
            <div className="text-[13px] text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
              {description}
            </div>
          )}

          {warningText && (
            <div className="w-full bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl p-3 text-left mb-2">
              <p className="text-[12px] font-medium text-red-800 dark:text-red-300">
                {warningText}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-2 flex flex-col-reverse sm:flex-row gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f1424] text-slate-700 dark:text-slate-300 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all disabled:opacity-70 ${styles.buttonBg}`}
          >
            {isLoading ? "Procesando..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
