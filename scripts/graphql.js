export const userInfoQuery = `
{
  user {
    id
    login
    firstName
    lastName
    campus
    auditRatio
    attrs
    xps {
      amount
      path
    }
  }
}
`;

// Query to get XP transactions
export const xpQuery = `
query {
  transaction(
    where: {type: {_eq: "xp"}}
    order_by: {createdAt: asc}
    limit: 1000
  ) {
    amount
    createdAt
    path
    object {
      name
      type
    }
  }
}
`;
// Query to get skills transactions
export const skillsQuery = `
query {
  user {
    skills: transactions(
      order_by: [{type: desc}, {amount: desc}]
      distinct_on: [type]
      where: {type: {_like: "skill%"}}
    ) {
      type
      amount
      createdAt
    }
  }
}`

// Helper to send a GraphQL query
export async function graphqlQuery(query, jwt) {
  const response = await fetch('https://01.gritlab.ax/api/graphql-engine/v1/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}`
    },
    body: JSON.stringify({ query })
  });
  if (!response.ok) throw new Error('Failed to execute GraphQL query');
  return response.json().then(res => res.data);
}

