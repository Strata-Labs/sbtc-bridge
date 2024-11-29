export function getLeatherBTCProviderOrThrow() {
  let provider = window.LeatherProvider;
  if (!provider) {
    throw new Error("BTC provider not found");
  }

  return provider;
}
