/**
 * Creates a rule that limits a text value to a number of characters. Empty values pass so `requiredRule` handles them.
 * @param maxLength - The most characters allowed.
 * @returns The rule.
 */
export const maxLengthRule = (maxLength: number) => {
  return (value: string | null | undefined): true | string => {
    return !value || value.length <= maxLength || `Use at most ${maxLength} characters`;
  };
};
