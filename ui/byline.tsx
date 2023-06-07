export default function Byline({ className }: { className: string }) {
  return (
    <div
      className={`${className} inset-x-0 bottom-3 mx-3 rounded-lg p-px shadow-lg `}
    >
      <div className="flex flex-col justify-between space-y-2 rounded-lg bg-black p-3.5 lg:px-5 lg:py-3">
        <div className="flex items-center gap-x-1.5">
          <div className="text-sm text-gray-400">Created By</div>
          <a
            className="text-gray-400 underline decoration-dotted underline-offset-4 transition-colors hover:text-gray-200"
            href="https://github.com/partylikeits1983"
            target="_blank"
            rel="noreferrer"
          >
            partylikeits1983
          </a>
        </div>
      </div>
    </div>
  );
}
