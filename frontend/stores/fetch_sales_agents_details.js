// fetch_sales_agents_details.js

const fetchSalesAgents = async () => {
    state.loading = true;
    state.error = null;

    try {
        // Fetch sales agent info
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        const customError = new Error(`Failed to fetch sales agents info: ${error.message}`);
        customError.originalError = error;  // Attach the original error
        throw customError;
    }
};
