/** One section of the show editor, listed in its table of contents. */
export interface ShowEditorSection {
  /** The section element's id, which the table of contents scrolls to. */
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  /** The theme color of the section's icon. */
  color: string;
  /** How many items the section holds, shown beside its name; left out for sections without a list. */
  count?: number;
  /** Whether a field in the section fails its rules. */
  isInvalid: boolean;
}
