import type { CustomCellRendererProps } from "ag-grid-react";
import { type FunctionComponent } from "react";
import { BsCheck2 } from 'react-icons/bs'
import styles from "./StatusCellRenderer.module.css";

export const StatusCellRenderer: FunctionComponent<CustomCellRendererProps> = ({
  value,
}) => (
  <div className={`${styles.tag} ${styles[value + 'Tag']}`}>
    {value === 'Completed' && <BsCheck2 className="inline-block mr-2" />}
    <span>{value}</span>
  </div>
)
