import type { AdminQueueState } from "@/lib/admin/admin-readiness.application";

import styles from "../../admin.module.css";
import type { AdminCopy } from "./candidate-presentation";

/** Forbidden or unavailable queue; an unavailable queue can be rechecked. */
export function QueueNotice({
  status,
  copy,
  refreshing,
  rechecked,
  recheck,
}: Readonly<{
  status: Extract<AdminQueueState["status"], "FORBIDDEN" | "UNAVAILABLE">;
  copy: AdminCopy;
  refreshing: boolean;
  rechecked: boolean;
  recheck: () => void;
}>) {
  return (
    <section className={styles.notice} role="alert">
      <h2>
        {status === "FORBIDDEN" ? copy.forbiddenTitle : copy.unavailableTitle}
      </h2>
      <p>
        {status === "FORBIDDEN" ? copy.forbiddenBody : copy.unavailableBody}
      </p>
      {status === "UNAVAILABLE" && (
        <button
          className={styles.secondaryAction}
          type="button"
          onClick={recheck}
          disabled={refreshing}
          aria-busy={refreshing}
        >
          {refreshing ? copy.checkingState : copy.recheckQueue}
        </button>
      )}
      {rechecked && <p role="status">{copy.unavailableBody}</p>}
    </section>
  );
}
