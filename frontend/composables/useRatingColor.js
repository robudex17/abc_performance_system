// composables/useRatingColor.js

export const useRatingColor = () => {
    const setRatingNameColor = (agent) => {
        if (agent.ratings_name == 'EXCEPTIONAL') {
          return 'text-purple-600'
        }
        
        if (agent.ratings_name == 'VERY SATISFACTORY') {
          return 'text-blue-500'
        }
      
        if (agent.ratings_name == 'SATISFACTORY') {
          return 'text-green-600'
        }
        if (agent.ratings_name == 'NEEDS IMPROVEMENT') {
          return 'text-yellow-600'
        }
      
        if (agent.ratings_name == 'POOR') {
          return 'text-red-600'
        }

             
        if (agent.ratings_name == 'INCOMPLETE RATING') {
          return 'text-yellow-300'
        }
      }
  
  
  
    return {
        setRatingNameColor,
      
    }
  }
  