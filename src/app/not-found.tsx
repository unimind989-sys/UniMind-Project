import Link from "next/link";
import { Brand } from "./_components/brand";
import styles from "./learn/workspace.module.css";

export default function NotFound() {
  return (
    <main className={styles.standaloneState}>
      <Brand variant="compact" />
      <h1>Page not found</h1>
      <p>The requested UniMind page does not exist.</p>
      <Link href="/">Return to UniMind</Link>
    </main>
  );
}
