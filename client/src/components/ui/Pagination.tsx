type PaginationProps = {
	page: number
	totalPages?: number //remove the optional here after fetching api
	onPageChange: (page: number) => void
}

export const PaginationButton = ({page, totalPages, onPageChange} : PaginationProps) => {
	if (!totalPages || totalPages <= 1) return null;

	return (
		<div className='mt-10 flex justify-center gap-4'>
			<button 
				className="text-sm font-semibold"
				disabled={page === 1}
				onClick={() => onPageChange(page - 1)}
			> Prev </button>

			{Array.from({ length: totalPages }, (_, i) => (
				<button
					key={i}
					className={`px-2 ${page === i + 1 ? "font-bold underline" : ""}`}
					onClick={() => onPageChange(i + 1)}
				>
					{i + 1}
				</button>
			))}

			<button 
				className="text-sm font-semibold"
				disabled={page === totalPages}
				onClick={() => onPageChange(page + 1)}
			> Next </button>
      	</div>
	);
}