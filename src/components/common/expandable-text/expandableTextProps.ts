export interface ExpandableTextProps {
  /**
   * The full text to display.
   */
  text: string | null | undefined;

  /**
   * Maximum number of characters to show before truncating.
   * @default 150
   */
  maxChars?: number;
}
