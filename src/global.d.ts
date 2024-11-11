export {};

declare global {
  interface Window {
    XverseProviders?: {
      StacksProvider?: any; // Replace `any` with the actual type if you know it
    };
    LeatherProvider?: any; // Replace `any` with the actual type if you know it
  }
}
