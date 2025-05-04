import type { CustomCellRendererProps } from "ag-grid-react";
import { type FunctionComponent } from "react";

import styles from "./StatusCellRenderer.module.css";

export const StatusCellRenderer: FunctionComponent<CustomCellRendererProps> = ({
  value,
}) => (
  <div className={`${styles.tag} ${styles[value + 'Tag']}`}>
    {value === 'Completed' && (
      <img
        className={styles.tick}
        src={`../../../assets/tick.svg`}
        alt="tick"
      />
    )}
    <span>{value}</span>
  </div>
)
