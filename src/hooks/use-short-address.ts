import { useMemo } from "react";

export function useShortAddress(address: string) {
  return useMemo(() => {
    if (address.length > 10) {
      return `${address.slice(0, 5)}...${address.slice(-5)}`;
    }
    return address;
  }, [address]);
}
