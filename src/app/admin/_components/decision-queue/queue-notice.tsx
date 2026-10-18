import type { AdminQueueState } from "@/lib/admin/admin-readiness.application";

import { Button } from "@/app/_components/product-ui";
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
        <Button
          className={styles.alignStart}
          size="large"
          onClick={recheck}
          pending={refreshing}
        >
          {refreshing ? copy.checkingState : copy.recheckQueue}
        </Button>
      )}
      {rechecked && <p role="status">{copy.unavailableBody}</p>}
    </section>
  );
}
