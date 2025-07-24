export const createPageUrl = (pageName, params = {}) => {
    let url = `/${pageName}`; // Start with the base page name

    // If there are parameters, construct the query string
    const queryString = Object.keys(params)
        .map(key => {
            // Encode both the key and the value to ensure valid URL characters
            return `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`;
        })
        .join('&');

    // Append the query string if it's not empty
    if (queryString) {
        url += `?${queryString}`;
    }

    return url;
};
