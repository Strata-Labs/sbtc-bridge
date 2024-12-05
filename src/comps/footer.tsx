export default function Footer() {
  return (
    <footer className="w-full flex flex-col items-center justify-center py-10 px-4 bg-white font-Matter">
      <div className="w-full flex flex-row items-center justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-black font-semibold text-sm">sBTC Bridge</p>
        </div>
        <div className="flex flex-row gap-4">
          <a
            href="https://docs.stacks.co"
            target="_blank"
            rel="noreferrer"
            className="text-black font-light text-sm"
          >
            Docs
          </a>
          <a
            href="https://github.com/stacks-network/sbtc"
            target="_blank"
            rel="noreferrer"
            className="text-black font-light text-sm"
          >
            Github
          </a>
        </div>
      </div>
    </footer>
  );
}
