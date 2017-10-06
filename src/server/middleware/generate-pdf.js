import ReactPDF from '@react-pdf/node';

import ApolloClient, { createNetworkInterface } from 'apollo-client';
const networkInterface = createNetworkInterface({ uri: 'https://example.com/graphql' });


export default (req, res) => {
	const networkInterface = createNetworkInterface({
		uri: '/graphql',
		opts: {
			credentials: 'same-origin',
			headers: req.headers,
		}
	});
	const client = new ApolloClient({
		ssrMode: true,
		networkInterface
	});


}

ReactPDF.render(<MyDocument />, `${__dirname}/example.pdf`);
