export default function Byline({ className }: { className: string }) {
  return (
    <div
      className={`${className} inset-x-0 bottom-3 mx-3 rounded-lg p-px shadow-lg`}
    >
      <div className="flex flex-col justify-between space-y-2 rounded-lg bg-black p-3.5 lg:px-5 lg:py-3">
        <div className="flex items-center gap-x-1.5"></div>
      </div>
    </div>
  );
}
