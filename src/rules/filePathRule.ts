const unixAbsolutePathPattern = /^\/(?:[^/\0]+(?:\/[^/\0]+)*)?\/?$/;
const windowsDrivePathPattern = /^[a-z]:(?:[\\/][^<>:"|?*\r\n\\/]+)*[\\/]?$/i;
const windowsUncPathPattern = /^\\\\[^<>:"/\\|?*\r\n]+\\[^<>:"/\\|?*\r\n]+(?:[\\/][^<>:"|?*\r\n\\/]+)*[\\/]?$/;

export const filePathRule = (value: string): true | string => {
  if (!value) {
    return true;
  }

  const isValidPath =
    unixAbsolutePathPattern.test(value) || windowsDrivePathPattern.test(value) || windowsUncPathPattern.test(value);

  return isValidPath || 'Enter a valid Unix or Windows absolute file path';
};
