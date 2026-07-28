<template>
    <div >
    
      <div class="overflow-x-auto" id="print-table">
         <h1 class="text-2xl font-extrabold text-gray-800 mb-3 text-center">{{ title }}</h1>
        <table class="min-w-full border-collapse border border-gray-300 mb-16" v-if="viewType != 'team' || viewType !='overall'">
          <thead>

            <tr class="bg-green-500 text-white">
              <th class="border border-gray-300 px-1 py-1 text-center text-lg font-bold">Year</th>
              <th class="border border-gray-300 px-1 py-1 text-center text-lg  font-bold" v-if="isMonthhy">Month</th>
              <th class="border border-gray-300 px-1 py-1 text-center text-lg font-bold">Team</th>
              <th class="border border-gray-300 px-1 py-1 text-center text-lg font-bold">Manager</th>
              <th class="border border-gray-300 px-1 py-1 text-center text-lg font-bold">TeamTarget</th>
              <th class="border border-gray-300 px-1 py-1 text-center text-lg font-bold ">Team Shipok</th>
              <th class="border border-gray-300 px-1 py-1 text-center text-lg font-bold">Shipok Percentage</th>
              <th class="border border-gray-300 px-1 py-1 text-center text-lg font-bold">New Deposit</th>
              <th class="border border-gray-300 px-1 py-1 text-center text-lg font-bold">Team Ratings</th>
              <th class="border border-gray-300 px-1 py-1 text-center text-lg font-bold">Rating Equivalenent</th>
      
            </tr>
          </thead>
          <tbody>
            <tr class="odd:bg-green-50 even:bg-white" v-for="agent in agents" :key="agent.id">
              <td class="border border-gray-300 px-2 py-1 capitalize text-lg text-center">{{ agent.year }}</td>
              <td class="border border-gray-300 px-2 py-1 capitalize text-lg text-center" v-if="isMonthhy">{{ agent.month }}</td>
              <td class="border border-gray-300 px-2 py-1 capitalize text-lg text-center">{{ agent.team_name }} <span v-if="agent.tag">- (<span class="font-bold text-purple-500">{{ agent.tag }}</span>)</span></td>
         
               <td class="border border-gray-300 px-2 py-1 capitalize text-lg text-center">{{ agent.team_leader_name }}</td>
               <td class="border border-gray-300 px-2 py-1 capitalize text-lg text-center">{{ agent.target }}</td>
               <td class="border border-gray-300 px-2 py-1 capitalize text-lg text-center">{{ agent.shipok }}</td>
               <td class="border border-gray-300 px-2 py-1 capitalize text-lg text-center">{{ agent.shipok_percent }}</td>
              <td class="border border-gray-300 px-2 py-1 text-lg text-center">{{ agent.deposit_score }}</td>            
              <td class="border border-gray-300 px-2 py-1 text-lg text-center font-bold">{{ agent.final_ratings }}</td>
              <td class="border border-gray-300 px-2 py-1 font-bold text-lg text-center" :class="setRatingNameColor(agent)">{{ agent.ratings_name }}</td>

            </tr>
           
            <!-- Additional rows can be added here -->
           
          </tbody>
        </table>

         <h1 class="text-2xl font-extrabold text-gray-800 mb-3 text-center">{{ memberTitle }}</h1>
        <table class="min-w-full border-collapse border border-gray-300"  v-if="viewType != 'overall'">
          <thead>

            <tr class="bg-green-600 text-white">

              <th  colspan="9" class=" border border-gray-300 px-1 py-0.5 ">Agent Employments And Assignments</th>

               <th colspan="2" class="border border-gray-300 px-2 py-0.5 text-xs text-center ">Performance (80%)</th>
              <th colspan="3" class="border border-gray-300 px-2 py-0.5">Attendance (10%)</th>
              <th colspan="3" class="border border-gray-300 px-2 py-0.5">Memo and Feedback (10%)</th>
              <th colspan="2" class="border border-gray-300 px-2 py-0.5">Additional Points (10%)</th>
               <th colspan="4" class=" px-1 py-0.5 ">Ratings</th>
            </tr>
            <tr class="bg-green-500 text-white">
              <th class="border border-gray-300 px-1 py- text-center text-xs font-bold">Year</th>
              <th class="border border-gray-300 px-1 py-0.5 text-center text-xs font-bold" >Month</th>
              <th class="border border-gray-300 px-1 py-0.5 text-center text-xs font-bold">Employee Id</th>
              <th class="border border-gray-300 px-1 py-0.5 text-center text-xs font-bold">Employee Name</th>
              <th class="border border-gray-300 px-1 py-0.5 text-center text-xs font-bold">Employee Status</th>
              <th class="border border-gray-300 px-1 py-0.5 text-center text-xs font-bold">Position</th>
              <th class="border border-gray-300 px-1 py-0.5 text-center text-xs font-bold">Manager</th>
              <th class="border border-gray-300 px-1 py-0.5 text-center text-xs font-bold">Market </th>
               <th class="border border-gray-300 px-1 py-0.5 text-center text-xs font-bold">Team </th>
              <th class="border border-gray-300 px-1 py-0.5 text-center text-xs font-bold">Score</th>
              <th class="border border-gray-300 px-1 py-0.5 text-center text-xs font-bold ">Total</th>
              <th class="border border-gray-300 px-1 py-0.5 text-center text-xs font-bold">Absences-score</th>
              <th class="border border-gray-300 px-1 py-0.5 text-center text-xs font-bold">Tardiness-score</th>
              <th class="border border-gray-300 px-1 py-0.5 text-center text-xs font-bold">Total</th>
              <th class="border border-gray-300 px-1 py-0.5 text-center text-xs font-bold">Memo-score</th>
              <th class="border border-gray-300 px-1 py-0.5 text-center text-xs font-bold">Feedback-score</th>
              <th class="border border-gray-300 px-1 py-0.5 text-center text-xs font-bold">Total</th>
              <th class="border border-gray-300 px-1 py-0.5 text-center text-xs font-bold">New Deposit</th>
              <th class="border border-gray-300 px-1 py-0.5 text-center text-xs font-bold">Total</th>
              <!-- <th class="border border-gray-300 px-1 py-0.5 text-center text-xs font-bold">Grand Total</th> -->
              <th class="border border-gray-300 px-1 py-0.5 text-center text-xs font-bold ">Rating</th>
                <th class="border border-gray-300 px-1 py-0.5 text-center text-xs font-bold ">Rating Equivalent</th>
            </tr>
          </thead>
          <tbody>
            <tr class="odd:bg-green-50 even:bg-white" v-for="agent in agents[0].teams" :key="agent.id">
              <td class="border border-gray-300 px-2 py-0.5 capitalize text-xs text-center">{{ agent.year }}</td>
              <td class="border border-gray-300 px-2 py-0.5 capitalize text-xs text-center" >{{ agent.month }}</td>
               <td class="border border-gray-300 px-2 py-0.5 capitalize text-xs text-center" >{{ agent.id }}</td>
              <td class="border border-gray-300 px-2 py-0.5 capitalize text-xs text-center">{{ agent.db_name }} <span v-if="agent.tag">- (<span class="font-bold text-purple-500">{{ agent.tag }}</span>)</span></td>
              <td class="border border-gray-300 px-2 py-0.5 capitalize text-xs text-center"
               :class="agent.employee_status == 'Hired' || agent.employee_status == 'Rehired' ? 'fond-bold text-green-500': 'text-red-500 font-bold'"
               
               >{{ agent.employee_status }}</td>
               <td class="border border-gray-300 px-2 py-0.5 capitalize text-xs text-center">{{ agent.agent_role }}</td>
               <td class="border border-gray-300 px-2 py-0.5 capitalize text-xs text-center">{{ agent.manager_dbname }}</td>
               <td class="border border-gray-300 px-2 py-0.5 capitalize text-xs text-center">{{ agent.market_name }}</td>
               <td class="border border-gray-300 px-2 py-0.5 capitalize text-xs text-center">{{ agent.team_name }}</td>
              <td class="border border-gray-300 px-2 py-0.5 text-xs text-center">{{ agent.shipok_score }}</td>
              <td class="border border-gray-300 px-2 py-0.5 text-xs text-center">{{ agent.performance_rating }}</td>
              <td class="border border-gray-300 px-2 py-0.5 text-xs text-center">{{ agent.absence_score }}</td>
              <td class="border border-gray-300 px-2 py-0.5 text-xs text-center">{{ agent.tardiness_score }}</td>
              <td class="border border-gray-300 px-2 py-0.5 text-xs text-center">{{ totalTheRating(agent.absence_rating, agent.tardiness_rating) }}</td>
              <td class="border border-gray-300 px-2 py-0.5 text-xs text-center">{{ agent.memo_score }}</td>
              <td class="border border-gray-300 px-2 py-0.5 text-xs text-center">{{ agent.feedback_score }}</td>
              <td class="border border-gray-300 px-2 py-0.5 text-xs text-center">{{ totalTheRating(agent.memo_rating, agent.feedback_rating) }}</td>
              <td class="border border-gray-300 px-2 py-0.5 text-xs text-center">{{ agent.deposit_score }}</td>
              <td class="border border-gray-300 px-2 py-0.5 text-xs text-center">{{ agent.additional_points }}</td>
              <td class="border border-gray-300 px-2 py-0.5 text-xs text-center font-bold">{{ agent.final_ratings }}</td>
              <td class="border border-gray-300 px-2 py-0.5 font-bold text-xs text-center" :class="setRatingNameColor(agent)">{{ agent.ratings_name }}</td>

            </tr>
           
            <!-- Additional rows can be added here -->
          </tbody>
        </table>

        <table class="min-w-full border-collapse border border-gray-300 mb-16" v-else>
          <thead>

            <tr class="bg-green-500 text-white">
              <th class="border border-gray-300 px-1 py-1 text-center text-lg font-bold">Year</th>
              <th class="border border-gray-300 px-1 py-1 text-center text-lg  font-bold" v-if="isMonthhy">Month</th>
              <th class="border border-gray-300 px-1 py-1 text-center text-lg font-bold">Team</th>
              <th class="border border-gray-300 px-1 py-1 text-center text-lg font-bold">Manager</th>
              <th class="border border-gray-300 px-1 py-1 text-center text-lg font-bold">TeamTarget</th>
              <th class="border border-gray-300 px-1 py-1 text-center text-lg font-bold ">Team Shipok</th>
              <th class="border border-gray-300 px-1 py-1 text-center text-lg font-bold">Shipok Percentage</th>
              <th class="border border-gray-300 px-1 py-1 text-center text-lg font-bold">New Deposit</th>
              <th class="border border-gray-300 px-1 py-1 text-center text-lg font-bold">Team Ratings</th>
              <th class="border border-gray-300 px-1 py-1 text-center text-lg font-bold">Rating Equivalenent</th>
      
            </tr>
          </thead>
          <tbody>
            <tr class="odd:bg-green-50 even:bg-white" v-for="agent in agents[0].teams" :key="agent.id">
              <td class="border border-gray-300 px-2 py-1 capitalize text-lg text-center">{{ agent.year }}</td>
              <td class="border border-gray-300 px-2 py-1 capitalize text-lg text-center" v-if="isMonthhy">{{ agent.month }}</td>
              <td class="border border-gray-300 px-2 py-1 capitalize text-lg text-center">{{ agent.team_name }} <span v-if="agent.tag">- (<span class="font-bold text-purple-500">{{ agent.tag }}</span>)</span></td>
         
               <td class="border border-gray-300 px-2 py-1 capitalize text-lg text-center">{{ agent.team_leader_name }}</td>
               <td class="border border-gray-300 px-2 py-1 capitalize text-lg text-center">{{ agent.target }}</td>
               <td class="border border-gray-300 px-2 py-1 capitalize text-lg text-center">{{ agent.shipok }}</td>
               <td class="border border-gray-300 px-2 py-1 capitalize text-lg text-center">{{ agent.shipok_percent }}</td>
              <td class="border border-gray-300 px-2 py-1 text-lg text-center">{{ agent.deposit_score }}</td>            
              <td class="border border-gray-300 px-2 py-1 text-lg text-center font-bold">{{ agent.final_ratings }}</td>
              <td class="border border-gray-300 px-2 py-1 font-bold text-lg text-center" :class="setRatingNameColor(agent)">{{ agent.ratings_name }}</td>

            </tr>
           
            <!-- Additional rows can be added here -->
           
          </tbody>
        </table>        
        
        


      </div>
    </div>
  </template>

  <script setup>
      import printJS from "print-js";

      const printTable = () => {
          const printContent = document.getElementById("print-table").innerHTML;
          const originalContent = document.body.innerHTML;

          document.body.innerHTML = printContent;
          window.print();
          document.body.innerHTML = originalContent;
      };

      const props = defineProps({
            agents : {
                type: Array
            },
            viewType: {
              type: String,
              required: true
            },
            isMonthhy: {
              type: Boolean, 
              required: true
            },
            title: {
              type: String,
              required: true
            },
            memberTitle: {
              type: String,
              required: true,
            }
        })

      const totalTheRating = (rating1, rating2) =>{
            const total = Number(rating1) + Number(rating2)
            return total.toFixed(4)
        }

      const setRatingNameColor = (agent) => {
          if (agent.ratings_name == 'EXCEPTIONAL') {
            return 'text-purple-700'
          }
          
          if (agent.ratings_name == 'VERY SATISFACTORY') {
            return 'text-blue-700'
          }

          if (agent.ratings_name == 'SATISFACTORY') {
            return 'text-green-700'
          }
          if (agent.ratings_name == 'NEEDS IMPROVEMENT') {
            return 'text-yellow-700'
          }

          if (agent.ratings_name == 'POOR') {
            return 'text-red-700'
          }
          
          if (agent.ratings_name == 'INCOMPLETE RATING') {
            return 'text-orange-600'
          }
        }

</script>
  
  <style scoped>
      /* Ensure text resizes to fit within the cells */
      table {
        table-layout: auto;
      }
      th, td {
        font-size: 0.875rem; /* Tailwind's text-sm */
        white-space: normal; /* Allow text wrapping */
      }

      @media print {
      body * {
        visibility: hidden;
      }
      #print-table, #print-table * {
        visibility: visible;
      }
      #print-table {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
      }
    }
  </style>
  