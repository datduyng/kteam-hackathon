"use client"
import React from "react";
import styles from "./style.module.css";
import { cn } from "@/lib/utils";

interface ILoadingProps {
  type?: "area" | "app";
  size?: number;
  loadingColor?: React.CSSProperties["color"];
  className?: string;
}
const Loading = (
  {
    type = "area",
    size = 25,
    loadingColor = "black",
    className,
  }: ILoadingProps = {
      type: "area",
    }
) => {
  return (
    <div
      className={cn(styles.spinner, className)}
      style={{
        // @ts-ignore
        "--spinner-size": `${size}px`,
        "--spinner-color": loadingColor,
      }}
    // {...props}
    >
      <div className={styles.spinnerAnimationContainer}>
        <div />
      </div>
    </div>
  );
};
export { Loading };
