export default function ScrapbookJournalThumb() {
  return (
    <div className="absolute inset-0 bg-[#E8E4D9] flex flex-col items-center justify-center p-2 overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/paper.png')]" />
      
      <div className="w-20 h-20 bg-[#D4CFC4] rounded border-2 border-white/50 shadow-md transform -rotate-6 relative z-10">
        <div className="absolute inset-2 bg-zinc-300 rounded-sm" />
      </div>
      
      <div className="w-16 h-16 bg-[#C4BFAF] rounded border border-white/40 shadow-sm transform rotate-12 absolute right-4 top-4 z-0">
         <div className="absolute inset-1.5 bg-zinc-400 rounded-sm" />
      </div>

      <div className="absolute top-2 left-6 w-12 h-4 bg-[#E0DBCF]/80 transform rotate-[-15deg] shadow-sm z-20" />

      <div className="mt-4 flex flex-col items-center z-10 transform -rotate-2">
        <div className="w-24 h-2 bg-zinc-600/30 rounded-full mb-1" />
        <div className="w-16 h-1.5 bg-zinc-500/20 rounded-full" />
      </div>
    </div>
  )
}
