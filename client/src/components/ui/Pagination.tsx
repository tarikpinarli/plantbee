type PaginationProps = {
	page: number
	totalPages?: number //remove the optional here after fetching api
	onPageChange: (page: number) => void
}

export const PaginationButton = ({page, totalPages, onPageChange} : PaginationProps) => {
	return (
		<div className='mt-10 flex justify-center gap-4'>
			{(totalPages) && totalPages <= 1 ? ( //remove optional here as well
				<span className="text-sm font-semibold text-gray-700">1</span>
			):(
				<>
					<button 
						className="text-sm font-semibold text-gray-700"
						disabled={page === 1}
						onClick={() => onPageChange(page - 1)}
					> Prev </button>
		
					{/* {Array.from({ length: totalPages }, (_, i) => (
						<button
						key={i}
						className={`px-2 ${
							page === i + 1 ? "font-bold underline" : ""
						}`}
						onClick={() => onPageChange(i + 1)}
						>
						{i + 1}
						</button>
					))} */}

					<button 
						className="text-sm font-semibold text-gray-700"
						disabled={page === totalPages}
						onClick={() => onPageChange(page + 1)}
					> Next </button>
				</>
			)}
      	</div>
	);
}