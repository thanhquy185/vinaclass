import { ColorPicker } from "@/components/atomic/atoms";
import ThemeToggle from "@/components/atomic/molecules/ToggleTheme/ToggleTheme";

export default function TestDesignSystem() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background-body text-text-primary">
      {/* ── Header ── */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-other-divider bg-background-paper px-6">
        <span className="text-h5">Design System Preview</span>
        <div className="flex items-center gap-3">
          <ColorPicker />
          <ThemeToggle />
        </div>
      </header>

      {/* ── Content grid ── */}
      <main className="grid flex-1 grid-cols-3 gap-4 overflow-hidden p-4">
        {/* Column 1 — Typography */}
        <section className="flex flex-col gap-2 overflow-auto rounded-lg border border-other-outlined-border bg-background-paper p-4">
          <p className="text-body-2 font-semibold text-text-secondary">
            Typography
          </p>
          <div className="text-h1">Heading 1</div>
          <div className="text-h2">Heading 2</div>
          <div className="text-h3">Heading 3</div>
          <div className="text-h4">Heading 4</div>
          <div className="text-h5">Heading 5</div>
          <div className="border-t border-other-divider pt-2">
            <div className="text-body-1">
              Body 1 — Lorem ipsum dolor sit amet
            </div>
            <div className="text-body-1-semibold">Body 1 Semibold</div>
            <div className="text-body-2">Body 2 text example</div>
            <div className="text-caption">Caption example</div>
          </div>
          <div className="border-t border-other-divider pt-2">
            <div className="text-text-primary">text-text-primary</div>
            <div className="text-text-secondary">text-text-secondary</div>
            <div className="text-text-disabled">text-text-disabled</div>
          </div>
        </section>

        {/* Column 2 — Brand Colors */}
        <section className="flex flex-col gap-2 overflow-auto rounded-lg border border-other-outlined-border bg-background-paper p-4">
          <p className="text-body-2 font-semibold text-text-secondary">
            Brand Colors
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-caption rounded bg-primary-main p-3 text-white">
              primary-main
            </div>
            <div className="text-caption rounded bg-primary-dark p-3 text-white">
              primary-dark
            </div>
            <div className="text-caption rounded bg-primary-light p-3 text-white">
              primary-light
            </div>
            <div className="text-caption rounded bg-secondary-main p-3 text-white">
              secondary-main
            </div>
            <div className="text-caption rounded bg-error-main p-3 text-white">
              error-main
            </div>
            <div className="text-caption rounded bg-warning-main p-3 text-black">
              warning-main
            </div>
            <div className="text-caption rounded bg-success-main p-3 text-white">
              success-main
            </div>
            <div className="text-caption rounded bg-info-main p-3 text-white">
              info-main
            </div>
          </div>
          <p className="text-body-2 font-semibold text-text-secondary">
            Action / UI
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-caption rounded border border-other-outlined-border bg-action-hover p-3">
              action-hover
            </div>
            <div className="text-caption rounded border border-other-input-border bg-other-filled-input-background p-3">
              input bg
            </div>
            <div className="text-caption rounded border border-other-outlined-border bg-action-selected p-3">
              action-selected
            </div>
            <div className="text-caption rounded border border-other-outlined-border bg-states-active-menu p-3">
              active-menu
            </div>
          </div>
        </section>

        {/* Column 3 — Background & Surface Tokens */}
        <section className="flex flex-col gap-2 overflow-auto rounded-lg border border-other-outlined-border bg-background-paper p-4">
          <p className="text-body-2 font-semibold text-text-secondary">
            Background Tokens
          </p>
          <div className="flex flex-col gap-2">
            <div className="text-caption rounded border border-other-outlined-border bg-background-body p-3">
              background-body
            </div>
            <div className="text-caption rounded border border-other-outlined-border bg-background-paper p-3">
              background-paper
            </div>
            <div className="text-caption rounded border border-other-outlined-border bg-background-extra-bg p-3">
              background-extra-bg
            </div>
            <div className="text-caption rounded border border-other-outlined-border bg-background-page-header-background p-3">
              page-header-background
            </div>
            <div className="text-caption rounded border border-other-outlined-border bg-background-section p-3">
              background-section
            </div>
          </div>
          <div className="border-t border-other-divider pt-2">
            <p className="text-body-2 font-semibold text-text-secondary">
              Divider / Border
            </p>
            <div className="text-caption mt-2 border border-dashed border-other-outlined-border p-3">
              other-outlined-border
            </div>
            <div className="text-caption mt-2 border-t-2 border-other-divider pt-2 text-text-secondary">
              border-other-divider
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
