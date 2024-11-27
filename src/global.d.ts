import { LeatherProvider } from "@leather.io/rpc";
declare global {
  interface Window {
    XverseProviders?: any;
    LeatherProvider?: LeatherProvider;
  }
}
