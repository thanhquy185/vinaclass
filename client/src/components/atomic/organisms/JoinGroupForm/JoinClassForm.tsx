import { useState, type FormEvent } from "react";
import { Overlay } from "../../molecules/Overlay/Overlay";
import { Button, Icon } from "../../atoms";
import { TextField } from "../../molecules/TextField/TextField";
import { useTranslation } from "react-i18next";

interface JoinClassFormProps {
  onSubmit: (inviteCode: string) => void;
  onCancel: () => void;
}

export function JoinClassForm({ onSubmit, onCancel }: JoinClassFormProps) {
  const { t } = useTranslation();
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");

  const handleChange = (value: string) => {
    setInviteCode(value);
    if (error) setError("");
  };

  const validate = () => {
    if (!inviteCode) return t("joinClassForm.validation.inviteRequired");
    if (!/^[a-zA-Z0-9]{8}$/.test(inviteCode))
      return t("joinClassForm.validation.inviteFormat");
    return "";
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    onSubmit(inviteCode);
  };

  return (
    <Overlay onClose={onCancel}>
      <form
        onSubmit={handleSubmit}
        className="flex w-[420px] flex-col overflow-hidden rounded-xl bg-background-paper shadow-2xl animate-in fade-in zoom-in-95"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-other-divider px-6 py-3">
          <h6 className="text-body-1 font-bold text-text-primary">
            {t("joinClassForm.title")}
          </h6>
          <Button
            type="button"
            variant="text"
            size="small"
            onClick={onCancel}
            className="min-w-0 p-1.5 text-text-secondary"
          >
            <Icon name="close" size={24} />
          </Button>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          <TextField
            label={t("joinClassForm.inviteCodeLabel")}
            placeholder={t("joinClassForm.inviteCodePlaceholder")}
            value={inviteCode}
            onChange={(e) => handleChange(e.target.value)}
            error={error}
            autoFocus
          />

          <p className="mt-3 text-sm text-text-secondary">
            {t("joinClassForm.helperText")}
          </p>

          <p className="mt-4 whitespace-pre-line text-xs italic text-text-secondary">
            {t("joinClassForm.guide")}
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end border-t border-other-divider px-5 py-3">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              color="standard"
              onClick={onCancel}
            >
              {t("joinClassForm.actions.close")}
            </Button>

            <Button type="submit" variant="contained" color="primary">
              {t("joinClassForm.actions.join")}
            </Button>
          </div>
        </div>
      </form>
    </Overlay>
  );
}
