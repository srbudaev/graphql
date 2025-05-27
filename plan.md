# GraphQL Project Implementation Plan (Vanilla JS)

## General Assignment Overview
Need to create a profile page using GraphQL API. The page should:
1. Have a login/authentication form via JWT
2. Display at least three selected blocks of user information
3. Contain a section with statistical charts in SVG format
4. Should be hosted (GitHub Pages, Netlify, etc.)

## Step 1: Preparation and Study Materials
- **Study GraphQL**
  - Basics and syntax of GraphQL queries
  - Working with arguments and nested queries
  - Resources: [official GraphQL documentation](https://graphql.org/learn/)

- **Study JWT authentication**
  - Understand JWT token principles
  - How to create and verify JWT
  - Resources: [jwt.io](https://jwt.io/introduction), [Basic Authentication articles](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication)

- **Study SVG for creating charts**
  - SVG basics
  - Creating charts with native SVG
  - Resources: [SVG on MDN](https://developer.mozilla.org/en-US/docs/Web/SVG)

## Step 2: Project Setup
- Create basic project structure
  ```
  /
  ├── assets/
  │   ├── css/
  │   │   └── style.css
  │   └── js/
  │       ├── auth.js (JWT functions)
  │       ├── api.js (GraphQL queries)
  │       ├── graphs.js (SVG generation)
  │       └── app.js (main logic)
  ├── index.html (login page)
  ├── profile.html (profile page)
  └── README.md
  ```

## Step 3: Authentication Implementation
- Create HTML login form with fields for:
  - username/email
  - password
- Implement form handling via JavaScript
- Implement POST request to `/api/auth/signin` with Basic authentication
- Handle JWT reception and storage (localStorage/sessionStorage)
- Implement logout function - token removal
- Add token verification for profile page protection

## Step 4: GraphQL Queries Implementation
- Create function for executing GraphQL queries using fetch API:
  ```javascript
  async function executeQuery(query, variables = {}) {
    const token = localStorage.getItem('jwt');
    const response = await fetch('https://DOMAIN/api/graphql-engine/v1/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ query, variables })
    });
    return await response.json();
  }
  ```
- Write basic queries for getting user information
- Write queries with arguments for getting specific data
- Write nested queries for related data

## Step 5: Profile Interface Creation
- Create HTML structure for profile
- Add containers for various information blocks
- Style elements with CSS
- Create functions for populating profile with data from GraphQL queries

## Step 6: User Information Blocks Creation
- Implement 3 information blocks:
  1. Basic user information (login, ID, etc.)
  2. Information about earned XP
  3. Information about completed projects/exercises
- Create functions for displaying each block

## Step 7: SVG Charts Creation
- Create containers for charts in HTML
- Implement functions for generating SVG elements with JavaScript:
  ```javascript
  function createSVGElement(tag, attributes = {}) {
    const svgNS = "http://www.w3.org/2000/svg";
    const element = document.createElementNS(svgNS, tag);
    
    for (const [key, value] of Object.entries(attributes)) {
      element.setAttribute(key, value);
    }
    
    return element;
  }
  ```
- Implement at least 2 different statistical charts:
  1. XP progress over time chart
  2. Successful/failed projects ratio chart
- Add interactivity to charts (optional)

## Step 8: Dynamic Data Loading
- Create functions for asynchronous data loading
- Add loading indicators for better UX
- Implement error handling for requests

## Step 9: Design and UI/UX
- Develop stylish and intuitive interface
- Ensure all elements are responsive and adaptive
- Add transitions and animations for better user experience
- Implement responsive design with media queries

## Step 10: Testing
- Test authentication (valid and invalid credentials)
- Test data display from GraphQL
- Check chart functionality
- Test responsiveness and cross-browser compatibility
- Debug all possible errors and usage scenarios

## Step 11: Optimization
- Minimize HTML, CSS and JavaScript files
- Optimize images and resources
- Improve performance (caching, lazy loading)

## Step 12: Hosting Deployment
- Prepare all files for publication
- Choose hosting platform (GitHub Pages, Netlify)
- Set up project deployment
- Ensure site is accessible and works correctly

## Useful Tips:
- Use modular JS file structure for better code organization
- Store JWT token securely, remember about XSS attacks
- Handle errors and create clear user messages
- Use modern JavaScript features (async/await, fetch API)
- Thoroughly document code for easier maintenance

## What to Study:
- **GraphQL** - syntax, queries, variables
- **JWT tokens** - format, security, storage
- **SVG** - creating and manipulating elements via JavaScript
- **Fetch API** - for sending requests
- **Basic and Bearer Authentication**
- **Static site deployment to hosting platform**

## Estimated Time:
- Preparation and study materials: 5-10 hours
- Project setup and authentication: 8-12 hours
- GraphQL queries and interface implementation: 15-20 hours
- SVG charts creation: 10-15 hours
- Styling, testing and deployment: 8-12 hours
- **Total:** 46-69 hours (approximately 2-4 weeks working 3-4 hours per day) 