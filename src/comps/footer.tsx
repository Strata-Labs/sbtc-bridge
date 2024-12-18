import Image from "next/image";

export default function Footer({ liveChatId }: { liveChatId?: string }) {
  return (
    <footer className="w-full flex flex-col items-center justify-center py-10 px-4 bg-white font-Matter">
      <div
        style={{
          maxWidth: "1200px",
        }}
        className="flex-1 w-full px-4 flex-row flex items-center justify-between"
      >
        <div>
          <Image
            src="/images/l2LabsLogo.svg"
            alt="Stacks Logo"
            width={100}
            height={100}
          />
        </div>
        <div className="flex flex-row gap-4">
          {liveChatId && (
            <a
              suppressHydrationWarning
              href={`https://direct.lc.chat/${liveChatId}/`}
              target="_blank"
              rel="noreferrer"
              className="text-black font-light text-sm"
            >
              Live support
            </a>
          )}
          <a
            key="how-to-use"
            href="https://docs.stacks.co/guides-and-tutorials/sbtc/how-to-use-the-sbtc-bridge"
            target="_blank"
            rel="noreferrer"
            className="text-black font-light text-sm"
          >
            How to use this bridge
          </a>
          <a
            key="docs"
            href="https://docs.stacks.co/concepts/sbtc"
            target="_blank"
            rel="noreferrer"
            className="text-black font-light text-sm"
          >
            Docs
          </a>
          <a
            key="github"
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
