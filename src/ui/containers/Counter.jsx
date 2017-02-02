import React from 'react'
import { connect } from 'react-redux';
import { graphql, compose, withApollo } from 'react-apollo'
import ApolloClient from 'apollo-client'
import gql from 'graphql-tag'
import update from 'react-addons-update'
import log from '../../log'
import { Button } from 'antd'
import AMOUNT_QUERY from '../graphql/CountGet.graphql'
import ADD_COUNT_MUTATION from '../graphql/CountAddMutation.graphql'

const SUBSCRIPTION_QUERY = gql`
    subscription onCountUpdated {
        countUpdated {
            amount
        }
    }
`;

class Counter extends React.Component {
	constructor(props) {
		super(props);

		this.subscription = null;
	}

	componentWillReceiveProps(nextProps) {
		if (!this.subscription && nextProps.loading === false) {
			this.subscribe();
		}
	}

	componentWillUnmount() {
		if (this.subscription) {
			this.subscription.unsubscribe();
		}
	}

	handleReduxIncrement(e) {
		let value;
		if (e && e.target) {
			value = e.target.value;
		} else {
			value = e;
		}

		this.props.onReduxIncrement(value);
	}

	subscribe() {
		const { client, updateCountQuery } = this.props;
		this.subscription = client.subscribe({
			query: SUBSCRIPTION_QUERY,
			variables: {},
		}).subscribe({
			next(data) {
				updateCountQuery(prev => {
					let newAmount = data.countUpdated.amount;
					return update(prev, {
						count: {
							amount: {
								$set: newAmount,
							},
						},
					});
				});
			},
			error(err) {
				log.error(err);
			},
		});
	}

	render() {
		const { loading, count, addCount, reduxCount } = this.props;
		if (loading) {
			return (
				<div className="text-center">
					Loading...
				</div>
			);
		} else {
			return (
				<div className="text-center">
					<div>
						Current count, is {count.amount}. This is being stored server-side in the database and using Apollo
						subscription for real-time updates.
					</div>
					<br />
					<Button type="primary" onClick={addCount(1)}>
						Click to increase count
					</Button>
					<br /><br /><br />
					<div>Current reduxCount, is {reduxCount}. This is being stored client-side with Redux.</div>
					<br />
					<Button type="primary" value="1" onClick={this.handleReduxIncrement.bind(this)}>
						Click to increase reduxCount
					</Button>
				</div>
			);
		}
	}
}

Counter.propTypes = {
	loading: React.PropTypes.bool.isRequired,
	count: React.PropTypes.object,
	updateCountQuery: React.PropTypes.func,
	addCount: React.PropTypes.func.isRequired,
	client: React.PropTypes.instanceOf(ApolloClient).isRequired,
	reduxCount: React.PropTypes.number.isRequired,
};

const CounterWithApollo = withApollo(compose(
	graphql(AMOUNT_QUERY, {
		props({ data: { loading, count, updateQuery } }) {
			return { loading, count, updateCountQuery: updateQuery };
		}
	}),
	graphql(ADD_COUNT_MUTATION, {
		props: ({ ownProps, mutate }) => ({
			addCount(amount) {
				return () => mutate({
					variables: { amount },
					updateQueries: {
						getCount: (prev, { mutationResult }) => {
							const newAmount = mutationResult.data.addCount.amount;
							return update(prev, {
								count: {
									amount: {
										$set: newAmount,
									},
								},
							});
						},
					},
					optimisticResponse: {
						__typename: 'Mutation',
						addCount: {
							__typename: 'Count',
							amount: ownProps.count.amount + 1,
						},
					},
				});
			},
		}),
	})
)(Counter));

export default connect(
	(state) => ({ reduxCount: state.counter.reduxCount }),
	(dispatch) => ({
		onReduxIncrement(value)
		{
			dispatch({
				type: 'COUNTER_INCREMENT',
				value: Number(value)
			});
		}
	}),
)(CounterWithApollo);
