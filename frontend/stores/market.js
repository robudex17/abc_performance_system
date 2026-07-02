import { defineStore }  from 'pinia'

import { reactive } from 'vue'
import API from '~/utils/api'

export const useMarketStore = defineStore('market', () => {
   //call auth store fetch the token on the localstorage 
    //save it to state.token
    const authStore = useAuthStore()
    authStore.fetchTokenFromLocalStore()

    const  token = authStore.state.token    

    const state = reactive({
        markets: [],
        market: [],   // it will remove if the code carefully check
        market_target_shipok: [],
        market_new_deposit: [],
        market_target_shipok_year: [],
        market_new_deposit_year: [],
        loading : false,
        error: null
    })

    const fetchAgentMarket = async () => {
        state.loading = true 
        state.error = null

        try {
            const response = await fetch(API.fetchAgentMarket, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
            })

            //token is  invalid  remove to local storage 
            if(!response.ok && response.status == 403){
                const errors = await response.json()
                if (errors.message == 'Invalid Access Token'){
                    localStorage.removeItem('jwt')
                    alert('Your Session has been expired, Please Login again.')
                    location.reload()
                }
            }

            if (!response.ok) {
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }
                

            const data = await response.json()
            state.market = data
          
        }catch(error) {
            state.error = error.message

        }finally {
            state.loading = false
        }
    }
    

    const fetchMarkets = async (marketId, queryString) => {
        state.loading = true 
        state.error = null
        let url = API.markets

                    // Build the URL

        if(marketId) {
            url = `${API.markets}/${marketId}`
        }

         url = new URL(`${url}`)
        if (queryString) {
         Object.keys(queryString).forEach((key) =>
                    url.searchParams.append(key, queryString[key])
            )
         }
        
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
            })

            //token is  invalid  remove to local storage 
            if(!response.ok && response.status == 403){
                const errors = await response.json()
                if (errors.message == 'Invalid Access Token'){
                    localStorage.removeItem('jwt')
                    alert('Your Session has been expired, Please Login again.')
                    location.reload()
                }
            }

            if (!response.ok) {
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }
                

            const data = await response.json()
            console.log('the return data is', data)
            state.markets = data
            console.log('the data in the state is', state.markets)
          
        }catch(error) {
            state.error = error.message

        }finally {
            state.loading = false
        }
    }

       const addUpdateDeleteMarket = async (data, httpMethod, sucessMessage) => {
        state.loading = true
        state.error = null
       
        try {
            const response = await fetch(`${API.markets}`, {
                method: httpMethod,
                body: JSON.stringify(data),
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
            }) 
         
            //token is  invalid  remove to local storage 
            if(!response.ok && response.status == 403){
                const errors = await response.json()
                if (errors.message == 'Invalid Access Token'){
                    localStorage.removeItem('jwt')
                    alert('Your Session has been expired, Please Login again.')
                    location.reload()
                }
            }           

            if (!response.ok) {
                
                const errors = await response.json()
                throw new Error(errors || "An unknown error occurred");
            }
  
           
           await fetchMarkets(null)
           alert(sucessMessage)
        } catch (error) {
            console.log(error.message)
            state.error = error.message
        } finally {
            state.loading = false
        }
    } 



    const fetchAgentMarketTargetShipok = async (queryString = null) => {
        state.loading = true;
        state.error = null;
        

            // Build the URL
        let url = new URL(`${API.fetch_market_target_shipok}`)
        if (queryString) {
         Object.keys(queryString).forEach((key) =>
                    url.searchParams.append(key, queryString[key])
            )
         }
        try {
            // Fetch sales agent info
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
            });

            

            //token is  invalid  remove to local storage 
            if(!response.ok && response.status == 403){
                const errors = await response.json()
                if (errors.message == 'Invalid Access Token'){
                    localStorage.removeItem('jwt')
                    alert('Your Session has been expired, Please Login again.')
                    location.reload()
                }
            }

            if (!response.ok) {
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();

            console.log(data)
            state.market_target_shipok = data;
        } catch (error) {
            const customError = new Error(`Cannot fetch target shipok per market: ${error.message}`);
            customError.originalError = error;  // Attach the original error
            throw customError;
        }finally {
            state.loading = false
        }
        
        
    };

    const fetchAgentMarketTargetShipokYear = async (queryString = null) => {
        state.loading = true;
        state.error = null;
        

            // Build the URL
        let url = new URL(`${API.fetch_market_target_shipok_year}`)
        if (queryString) {
         Object.keys(queryString).forEach((key) =>
                    url.searchParams.append(key, queryString[key])
            )
         }
        try {
            // Fetch sales agent info
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
            });

            

            //token is  invalid  remove to local storage 
            if(!response.ok && response.status == 403){
                const errors = await response.json()
                if (errors.message == 'Invalid Access Token'){
                    localStorage.removeItem('jwt')
                    alert('Your Session has been expired, Please Login again.')
                    location.reload()
                }
            }

            if (!response.ok) {
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();

            console.log(data)
            state.market_target_shipok_year = data;
        } catch (error) {
            const customError = new Error(`Cannot fetch target shipok per market: ${error.message}`);
            customError.originalError = error;  // Attach the original error
            throw customError;
        }finally {
            state.loading = false
        }
        
        
    };



    const fetchAgentMarketNewDeposit = async (queryString = null) => {
        state.loading = true;
        state.error = null;
        
               // Build the URL
        let url = new URL(`${API.fetch_market_new_deposit}`)
         if (queryString) {
            Object.keys(queryString).forEach((key) =>
                 url.searchParams.append(key, queryString[key])
             )
        }
        try {
            // Fetch sales agent info
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
            });

            //token is  invalid  remove to local storage 
            if(!response.ok && response.status == 403){
                const errors = await response.json()
                if (errors.message == 'Invalid Access Token'){
                    localStorage.removeItem('jwt')
                    alert('Your Session has been expired, Please Login again.')
                    location.reload()
                }
            }

            if (!response.ok) {
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();

            console.log(data)
            state.market_new_deposit = data;
        } catch (error) {
            const customError = new Error(`Cannot fetch new deposit per market: ${error.message}`);
            customError.originalError = error;  // Attach the original error
            throw customError;
        }finally {
            state.loading = false
        }
    };



    const fetchAgentMarketNewDepositYear = async (queryString = null) => {
        state.loading = true;
        state.error = null;
        
               // Build the URL
        let url = new URL(`${API.fetch_market_new_deposit_year}`)
         if (queryString) {
            Object.keys(queryString).forEach((key) =>
                 url.searchParams.append(key, queryString[key])
             )
        }
        try {
            // Fetch sales agent info
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
            });

            //token is  invalid  remove to local storage 
            if(!response.ok && response.status == 403){
                const errors = await response.json()
                if (errors.message == 'Invalid Access Token'){
                    localStorage.removeItem('jwt')
                    alert('Your Session has been expired, Please Login again.')
                    location.reload()
                }
            }

            if (!response.ok) {
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();

            console.log(data)
            state.market_new_deposit_year = data;
        } catch (error) {
            const customError = new Error(`Cannot fetch new deposit per market: ${error.message}`);
            customError.originalError = error;  // Attach the original error
            throw customError;
        }finally {
            state.loading = false
        }
    };


    return {
        state, fetchAgentMarket, fetchAgentMarketTargetShipok,fetchAgentMarketNewDeposit,fetchAgentMarketNewDepositYear, fetchAgentMarketTargetShipokYear, fetchMarkets, addUpdateDeleteMarket
    }
})



