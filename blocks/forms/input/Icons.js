const Icons = {};

Icons.email = (
	<svg version="1.1" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
		<path
			d="M16 12c0 2.209-1.791 4-4 4 -2.209 0-4-1.791-4-4 0-2.209 1.791-4 4-4v0c2.209 0 4 1.791 4 4v1.5c0 1.381 1.119 2.5 2.5 2.5 1.381 0 2.5-1.119 2.5-2.5v-1.5c0-4.971-4.029-9-9-9 -4.971 0-9 4.029-9 9 0 4.971 4.029 9 9 9 1.149 0 2.317-.218 3.444-.685 .608-.252 1.17-.568 1.689-.929"
			strokeLinecap="round"
			strokeWidth="1.5"
			stroke="#323232"
			fill="none"
			strokeLinejoin="round"
		></path>
		<path fill="none" d="M0 0h24v24h-24Z"></path>
	</svg>
);

Icons.submit = (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
		<path
			d="M13.65929,18.51918h3.5391a.8.8,0,0,0,.56206-1.3693l-6.39839-6.317A.8.8,0,0,0,10,11.40215V20.1984a.8.8,0,0,0,1.3596.57171Z"
			fill="none"
			stroke="#323232"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="1.5"
		/>
		<path
			d="M7,13H5a2,2,0,0,1-2-2V5A2,2,0,0,1,5,3H19a2,2,0,0,1,2,2v6a2,2,0,0,1-2,2H18"
			fill="none"
			stroke="#323232"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="1.5"
		/>
		<path d="M24,24H0V0H24Z" fill="none" />
	</svg>
);

Icons.default = (
	<svg version="1.1" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
		<g fill="none">
			<path d="M0 0h24v24h-24Z"></path>
			<path
				fillRule="evenodd"
				stroke="#323232"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1.5"
				d="M20 16h-16c-.552 0-1-.448-1-1v-6c0-.552.448-1 1-1h16c.552 0 1 .448 1 1v6c0 .552-.448 1-1 1Z"
			></path>
			<path
				stroke="#323232"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1.5"
				d="M11 20h-1c-1.105 0-2-.895-2-2 0 1.105-.895 2-2 2h-1"
			></path>
			<path
				stroke="#323232"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1.5"
				d="M8 6v12"
			></path>
			<path
				stroke="#323232"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1.5"
				d="M5 4h1c1.105 0 2 .895 2 2 0-1.105.895-2 2-2h1"
			></path>
		</g>
	</svg>
);

Icons.labelLeft = (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
		<rect
			x="4.75"
			y="17.25"
			width="5.5"
			height="14.5"
			transform="rotate(-90 4.75 17.25)"
			stroke="currentColor"
			fill="none"
			strokeWidth="1.5"
		/>
		<rect x="4" y="7" width="10" height="2" fill="currentColor" />
	</svg>
);

Icons.labelCenter = (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
		<rect
			x="4.75"
			y="17.25"
			width="5.5"
			height="14.5"
			transform="rotate(-90 4.75 17.25)"
			stroke="currentColor"
			fill="none"
			strokeWidth="1.5"
		/>
		<rect x="7" y="7" width="10" height="2" fill="currentColor" />
	</svg>
);

Icons.labelRight = (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
		<rect
			x="4.75"
			y="17.25"
			width="5.5"
			height="14.5"
			transform="rotate(-90 4.75 17.25)"
			stroke="currentColor"
			fill="none"
			strokeWidth="1.5"
		/>
		<rect x="10" y="7" width="10" height="2" fill="currentColor" />
	</svg>
);

export default Icons;
