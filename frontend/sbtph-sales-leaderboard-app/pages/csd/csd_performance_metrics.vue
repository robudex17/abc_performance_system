<template>
  <!-- <div class=" bg-gradient-to-r from-blue-50 to-blue-100 min-h-screen p-4 mt-20"> -->
  <div class="p-4 mt-20">
    <!-- Loading Spinner -->
    <!-- <div v-if="useFeedbackStore.state.loading">
      <spinner></spinner>
    </div> -->
  

   
    <div >

        <h1 class="text-3xl font-extrabold text-gray-800 mb-6 text-center">Customer Service Performance Metrics</h1>
        <!-- Agents Table -->
       <div class="relative overflow-x-auto overflow-y-auto max-h-[80vh] shadow-xl rounded-lg">
          <table class="min-w-max table-auto border-collapse bg-white">
            <!-- Table Head -->
                <thead>
                <tr class="bg-gradient-to-r from-blue-200 to-blue-300 text-gray-800">
                    <th  colspan="8" class="py-0.5 px-4 text-center text-xs font-bold text-green-900 ">EMPLOYEE</th>
                    <th  colspan="3" class="py-0.5 px-4 text-center text-xs font-bold text-green-900  bg-green-500">AVERAGE EMAIL RESPONSE TIME (15/15)</th>
                    <th  colspan="3" class="py-0.5 px-4 text-center text-xs font-bold text-green-900 ">EMAIL RESPONSES COUNT (10)(10)</th>
                    <th  colspan="5" class="py-0.5 px-4 text-center text-xs font-bold text-green-900   bg-green-500">CUSTOMERS SATISFACTION (20)(20)</th>
                    <th  colspan="3" class="py-0.5 px-4 text-center text-xs font-bold text-green-900  bg-red-500">TL’s ERROR REPORT (20)(15)</th>
                    <th  colspan="3" class="py-0.5 px-4 text-center text-xs font-bold text-green-900 ">CALL & EMAIL CALIBRATION (20)(15)</th>
                    <th  colspan="9" class="py-0.5 px-4 text-center text-xs font-bold text-green-900  bg-yellow-500">CALLS  (15)</th>
                    <th  colspan="3" class="py-0.5 px-4 text-center text-xs font-bold text-green-900  bg-red-500"> TEAM ATTRITION RATE (10)</th>
                    <th  colspan="3" class="py-0.5 px-4 text-center text-xs font-bold text-green-900 " ></th>

                </tr>
                <tr  class="bg-gradient-to-r from-blue-200 to-blue-300 text-gray-800">
                    <th  colspan="8" class="py-0.5 px-4 text-center text-xs font-bold text-green-900 "></th>
                    <th  colspan="3" class="py-0.5 px-4 text-center text-xs font-bold text-green-900  bg-green-500"></th>
                    <th  colspan="3" class="py-0.5 px-4 text-center text-xs font-bold text-green-900 "></th>
                    <th  colspan="5" class="py-0.5 px-4 text-center text-xs font-bold text-green-900   bg-green-500"></th>
                    <th  colspan="3" class="py-0.5 px-4 text-center text-xs font-bold text-green-900   bg-red-500"></th>
                    <th  colspan="3" class="py-0.5 px-4 text-center text-xs font-bold text-green-900  "></th>
                    <th  colspan="3" class="py-0.5 px-4 text-center text-xs font-bold text-green-900  bg-yellow-500">INBOUND CALL (5)</th>
                    <th  colspan="3" class="py-0.5 px-4 text-center text-xs font-bold text-green-900  bg-yellow-500">OUTBOUND CALL (5)</th>
                    <th  colspan="3" class="py-0.5 px-4 text-center text-xs font-bold text-green-900  bg-yellow-500">MISSED CALL (5)</th>
                    <th  colspan="3" class="py-0.5 px-4 text-center text-xs font-bold text-green-900   bg-red-500"></th>
                    <th  colspan="4" class="py-0.5 px-4 text-center text-xs font-bold text-green-900 "></th>                    

                </tr>
                <tr class="bg-gradient-to-r from-blue-200 to-blue-300 text-gray-800">
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border">ID</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border">Name</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border">Employee Status</th>
                     <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border">Extension</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border">Position</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border">Team</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border">Month</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border">Year</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border  bg-green-500">Result</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border  bg-green-500">Equivalent Points</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border  bg-green-500">Score</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border">Result</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border">Equivalent Points</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border">Score</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border  bg-green-500">Result CSR</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border  bg-green-500">Equivalent Points CSR 80%</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border  bg-green-500">Result FPC</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border  bg-green-500">Equivalent Points FPC 20%</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border  bg-green-500">Score</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border  bg-red-500">Result</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border  bg-red-500">Equivalent Points</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border  bg-red-500">Score</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border">Result</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border">Equivalent Points</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border">Score</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border bg-yellow-500">Result</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border bg-yellow-500">Equivalent Points</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border bg-yellow-500">Score</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border bg-yellow-500">Result</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border bg-yellow-500">Equivalent Points</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border bg-yellow-500">Score</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border bg-yellow-500">Result</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border bg-yellow-500">Equivalent Points</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border bg-yellow-500">Score</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border  bg-red-500">Result</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border  bg-red-500">Equivalent Points</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border  bg-red-500">Score</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border">Total Score</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border">Description of Points</th>
                     <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border">Submit</th>
             
                </tr>
                </thead>
            <!-- Table Body -->
                <tbody>
                <tr
                    v-for="(agent, index) in paginatedAgents"
                    :key="index"
                    class="even:bg-blue-50 odd:bg-white hover:bg-blue-100 transition-colors"
                >
                    <!-- ID -->
                    <td class="py-0.5 px-4 text-center text-xs text-gray-700 border">
                    {{ agent.id }}
                    </td>

                     <!-- Name with Avatar -->
                    <td class="py-0.5 pr-12 text-left text-xs font-medium text-green-900 border">
                        <div class="flex items-center space-x-2">
                            <img
                            v-if="agent && agent.image_link"
                            :src="agent.image_link"
                            alt="Agent Image"
                            class="w-9 h-9 rounded-full object-cover shadow"
                            />
                            <span >{{ agent.db_name }}</span>
                        </div>
                    </td>
                    
                    <!-- Market, Month, Year, Target, ShipOk -->
                    <td class="py-0.5 px-4 text-left text-xs  border"
                         :class="{
                          'text-red-600 font-bold': agent.employee_status === 'Resigned',
                          'text-green-600 font-bold': agent.employee_status === 'Hired' || agent.employee_status === 'Rehired'
                        }" 
                    >
                     {{ agent.employee_status }}
                    </td>

                    <td class="py-0.5 px-4 text-left text-xs font-medium text-gray-700 border">
                     {{ agent.extension }}
                    </td>
                    <td class="py-0.5 px-4 text-left text-xs font-medium text-gray-700 border">
                     {{ agent.position_name }}
                    </td>

                    <td class="py-0.5 px-4 text-left text-xs font-medium text-gray-700 border">
                     {{ agent.team_name }}
                    </td>                                     
                    <td class="py-0.5 px-4 text-left text-xs font-medium text-gray-700 border">
                    {{ agent.month }}
                    </td>
                    <td class="py-0.5 px-4 text-left text-xs font-medium text-gray-700 border">
                    {{ agent.year }}
                    </td>
                    <CSDTooltipCell :title="agent.db_name" class="text-blue-700">
                        <button  @click="openMetricsTypeModal({ year_month: agent.year_month,employee_status: agent.employee_status, submitted: agent.submitted, employee_id: agent.id, agent_dbname:agent.db_name, month: agent.month, year: agent.year, position_id: agent.position_id, position_name: agent.position_name, team_id:agent.team_id, avg_response_minutes: agent.avg_response_minutes,image_link: agent.image_link,metrics_type: 'email_response_time' })" >
                        {{ typeof agent.avg_response_minutes === 'number' ? agent.avg_response_minutes : 'no-data' }}
                      </button>
                    </CSDTooltipCell>
                    <td class="py-0.5 px-4 text-left text-lg font-medium text-gray-700 border">
                        {{ agent.aert_equivalent_points }} 
                       
                   </td>

                    <td class="py-0.5 px-4 text-left text-lg font-medium text-green-700 border">
                        {{ agent.aert_equivalent_points_percentage}} 
                       
                   </td>

                   <CSDTooltipCell :title="agent.db_name" class="text-blue-700">
                      <button  @click="openMetricsTypeModal({ year_month: agent.year_month,employee_status: agent.employee_status, submitted: agent.submitted, employee_id: agent.id, agent_dbname:agent.db_name, month: agent.month, year: agent.year, position_id: agent.position_id, position_name: agent.position_name, team_id:agent.team_id, response_count: agent.response_count, resolved_tickets: agent.resolved_tickets,image_link: agent.image_link,metrics_type: 'email_response_count' })" >
                        {{ agent.resolved_tickets_percentage }} 
                      </button>
                   </CSDTooltipCell> 

                   <td class="py-0.5 px-4 text-left text-lg font-medium text-gray-700 border">
                        {{ agent.erc_equivalent_points}} 
                       
                   </td>                 
                   <td class="py-0.5 px-4 text-left text-lg font-medium text-green-700 text-bold border">
                        {{ agent.erc_equivalent_points_percentage}} 
                       
                   </td>

                   <CSDTooltipCell :title="agent.db_name" class="text-blue-700">
                      
                     <!-- <span v-if="agent.agent_type ==2"> {{ agent.target }} </span> -->
                      <button  @click="openMetricsTypeModal({ year_month: agent.year_month,employee_status: agent.employee_status, submitted: agent.submitted, employee_id: agent.id, agent_dbname:agent.db_name, month: agent.month, year: agent.year, position_id: agent.position_id, position_name: agent.position_name, team_id:agent.team_id, csr_total_feedback: agent.csr_total_feedback, resolved_tickets: agent.resolved_tickets, customer_not_good: agent.customer_not_good, 
                        customer_just_ok: agent.customer_just_ok, customer_awesome: agent.customer_awesome, image_link: agent.image_link,metrics_type: 'customer_satisfaction_report' })" >
                        {{ agent.csr_result_csr }} 
                      </button>
                  </CSDTooltipCell> 

                   <td class="py-0.5 px-4 text-left text-lg font-medium text-gray-700 border">
                        {{ agent.csr_result_csr_equivalent_points}} 
                       
                   </td>  
                   
                   <td class="py-0.5 px-4 text-left text-lg font-medium text-gray-700 border">
                        {{ agent.csr_result_fpc}} 
                       
                   </td>   
                   
                   <td class="py-0.5 px-4 text-left text-lg font-medium text-gray-700 border">
                        {{ agent.csr_result_fpc_equivalent_points}} 
                       
                   </td>                        
                   
                   <td class="py-0.5 px-4 text-left text-lg font-medium text-green-700 text-bold border">
                        {{ agent.csr_result_csr_fpc_equivalent_points_percentage}} 
                       
                   </td>                    

                  <CSDTooltipCell :title="agent.db_name" class="text-blue-700">
                     <button  @click="openMetricsTypeModal({ year_month: agent.year_month,employee_status: agent.employee_status, submitted: agent.submitted, employee_id: agent.id, agent_dbname:agent.db_name, month: agent.month, year: agent.year, position_id: agent.position_id, position_name: agent.position_name, team_id:agent.team_id, initial_result: agent.initial_result, error_count: agent.error_count,image_link: agent.image_link,metrics_type: 'error_report' })" >
                        {{ agent.error_final_result }}
                    </button>
                   </CSDTooltipCell>

                  <td class="py-0.5 px-4 text-left text-lg font-medium text-gray-700 border">
                        {{ agent.er_equivalent_points}} 
                       
                   </td>

                  <td class="py-0.5 px-4 text-left text-lg font-medium text-green-700 text-bold border">
                        {{ agent.er_equivalent_points_percentage}} 
                       
                   </td>

                   
                  <CSDTooltipCell :title="agent.db_name" class="text-blue-700">
                    
                      <button  @click="openMetricsTypeModal({ year_month: agent.year_month,employee_status: agent.employee_status, submitted: agent.submitted, employee_id: agent.id, agent_dbname:agent.db_name, month: agent.month, year: agent.year, position_id: agent.position_id, position_name: agent.position_name, team_id:agent.team_id, 
                        calibration_not_good: agent.calibration_not_good,calibration_just_ok: agent.calibration_just_ok, calibration_awesome: agent.calibration_awesome,
                        image_link: agent.image_link,metrics_type: 'call_email_calibration' })" >
                          {{ agent.call_email_calibration_result }}
                      </button>
                  </CSDTooltipCell> 
                    
                    <td class="py-0.5 px-4 text-left text-lg font-medium text-gray-700 border">
                        {{ agent.call_email_calibration_equivalent_points}} 
                       
                   </td>

                  <td class="py-0.5 px-4 text-left text-lg font-medium text-green-700 text-bold border">
                        {{ agent.call_email_calibration_equivalent_points_percentage}} 
                       
                   </td>

                   <CSDTooltipCell :title="agent.db_name" class="text-blue-700">
                    
                      <button  @click="openMetricsTypeModal({ year_month: agent.year_month, employee_status: agent.employee_status, submitted: agent.submitted, employee_id: agent.id, agent_dbname:agent.db_name, month: agent.month, year: agent.year, position_id: agent.position_id, position_name: agent.position_name, team_id:agent.team_id, 
                        inbound_calls: agent.inbound_calls, total_inbound_calls: agent.total_inbound_calls, 
                        image_link: agent.image_link,metrics_type: 'inboundcalls' })" >
                          {{ agent.agent_inbound_result }}
                      </button>
                    </CSDTooltipCell>  

                  <td class="py-0.5 px-4 text-left text-lg font-medium text-gray-700 border">
                      {{ agent.ioc_equivalent_points}} 
                       
                   </td>

                  <td class="py-0.5 px-4 text-left text-lg font-medium text-green-700 text-bold border">
                      {{ agent.ioc_equivalent_points_percentage}}
                       
                   </td>

                    <CSDTooltipCell :title="agent.db_name" class="text-blue-700">
                      <button  @click="openMetricsTypeModal({ year_month: agent.year_month, employee_status: agent.employee_status, submitted: agent.submitted, employee_id: agent.id, agent_dbname:agent.db_name, month: agent.month, year: agent.year, position_id: agent.position_id, position_name: agent.position_name, team_id:agent.team_id, 
                         outbound_calls: agent.outbound_calls,  total_outbound_calls: agent.total_outbound_calls, 
                        image_link: agent.image_link,metrics_type: 'outboundcalls' })" >
                          {{ agent.agent_outbound_result }}
                      </button>
                    </CSDTooltipCell>  

                  <td class="py-0.5 px-4 text-left text-lg font-medium text-gray-700 border">
                      {{ agent.ooc_equivalent_points}} 
                       
                   </td>

                  <td class="py-0.5 px-4 text-left text-lg font-medium text-green-700 text-bold border">
                      {{ agent.ooc_equivalent_points_percentage}} 
                       
                   </td>

                   <CSDTooltipCell :title="agent.db_name" class="text-blue-700">
                      <button  @click="openMetricsTypeModal({ year_month: agent.year_month, employee_status: agent.employee_status, submitted: agent.submitted, employee_id: agent.id, agent_dbname:agent.db_name, month: agent.month, year: agent.year, position_id: agent.position_id, position_name: agent.position_name, team_id:agent.team_id, 
                        missed_calls: agent.missed_calls,  total_missed_calls: agent.total_missed_calls,
                        image_link: agent.image_link,metrics_type: 'missedcalls' })" >
                          {{ agent.agent_missed_result }}
                      </button>
                    </CSDTooltipCell>  

                  <td class="py-0.5 px-4 text-left text-lg font-medium text-gray-700 border">
                      {{ agent.mc_equivalent_points }}
                       
                   </td>

                  <td class="py-0.5 px-4 text-left text-lg font-medium text-green-700 text-bold border">
                      {{ agent.mc_equivalent_points_percentage }}
                       
                   </td>
                   <CSDTooltipCell :title="agent.db_name" class="text-blue-700">
                      <button  @click="openMetricsTypeModal({ year_month: agent.year_month, employee_status: agent.employee_status, submitted: agent.submitted, employee_id: agent.id, agent_dbname:agent.db_name, month: agent.month, year: agent.year, position_id: agent.position_id, position_name: agent.position_name, team_id:agent.team_id, 
                        opening_hc : agent.opening_hc, closing_hc: agent.closing_hc,  no_of_resignation: agent.no_of_resignation,
                        image_link: agent.image_link,metrics_type: 'attrition_rate' })" >
                          {{ agent.attrition_result }}
                      </button>
                    </CSDTooltipCell> 

                  <td class="py-0.5 px-4 text-left text-lg font-medium text-gray-700 border">
                        {{ agent.attrition_equivalent_points }}
                       
                   </td>

                  <td class="py-0.5 px-4 text-left text-lg font-medium text-green-700 text-bold border">
                        {{ agent.attrition_equivalent_points_percentage }}
                       
                   </td>      

                 <CSDTooltipCell :title="agent.db_name" :class="getColorByValue(agent.total_performance_score_percentage)">
                    {{agent.total_performance_score_percentage}}
                 </CSDTooltipCell>
                 <CSDTooltipCell :title="agent.db_name"
                                  :class="getDescriptionColor(agent.total_performance_score_description)">
                                  {{ agent.total_performance_score_description}}
                 </CSDTooltipCell>                  
  

                   
                    <!-- Actions -->
                    <td class="py-0.5 px-4 text-center border" >
                      <div class="flex justify-center space-x-2" v-if="agent.position_level == 9">

                    <!-- Submit All button -->
                              <button
                                v-if="!submittedAll"
                                @click="submitAllPerformanceMetrics"
                                :disabled="!canSubmitAll"
                                :class="[
                                  'py-0.5 px-3 rounded-lg flex items-center gap-2 text-sm',
                                  canSubmitAll
                                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                                    : 'bg-gray-400 text-white cursor-not-allowed'
                                ]"
                              >
                                Submit
                              </button>

                              <!-- Submitted All button (disabled + gray) -->
                              <button
                                v-else
                                disabled
                                class="bg-gray-400 text-white cursor-not-allowed text-sm rounded-lg px-3"
                              >
                                Submitted 
                              </button>

                              <!-- Review All button (purple) -->
                              <button
                                v-if="submittedAll"
                                @click="reviewAllPerformanceMetrics"
                                class="bg-purple-500 text-white py-0.5 px-3 rounded-lg hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                              >
                                Review 
                              </button>

                      </div>

                          <div class="flex justify-center space-x-2" v-else>

                          <!-- Submit / Submitted Button -->
                          <button
                            @click="submitPerformanceMetrics(agent)"
                          :disabled="agent.submitted == 1"
                          :class="[
                              'py-0.5 px-3 rounded-lg flex items-center gap-2 text-sm',
                              agent.submitted == 1
                              ? 'bg-gray-400 text-white cursor-not-allowed' // Already submitted
                              : 'bg-green-500 text-white hover:bg-green-600' // Ready to submit
                                   
                          ]"
                          >
                          {{ agent.submitted == 1 ? 'Submitted' : 'Submit' }}
                          </button>

                          <!-- Review Button -->
                          <button
                          v-if="agent.submitted == 1"
                          @click="reviewPerformanceMetrics(agent)"
                          class="bg-purple-500 text-white py-0.5 px-3 rounded-lg hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                          >
                          Review
                          </button>

                      </div>                    
                    </td>


                </tr>
                </tbody>     
          </table>



    <CsdPerformanceMetrics
    
      :showModal="showModalMetricsType"
      :metricsType="metricsType"
      :modalType="modalMeticsType"
      :agentData="selectedData"
      :modalMeticsTypeMessage="modalMeticsTypeMessage"
      @passClose="resetValues"
      @passAddDataAgent="addDataAgent"
       @passEditDataAgent="editDataAgent"
      @passDeleteDataAgent="deleteDataAgent"
    />

      <!-- Modal -->
      <div 
        v-if="showModal" 
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <div class="bg-white rounded-2xl shadow-2xl w-11/12 md:w-3/4 lg:w-2/3 xl:w-3/4 overflow-hidden">
          
          <!-- Header -->
          <div class="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
            <h2 class="text-lg font-bold">
              {{ modalType === 'qa' ? 'QA Feedback Details' : 'Update/Delete Feedback' }}
            </h2>
            <button 
              @click="closeModal" 
              class="text-white hover:text-gray-200 transition"
            >
              ✕
            </button>
          </div>



          <!-- Footer -->
          <div class="px-6 py-4 bg-gray-100 text-right">
            <button
              @click="closeModal"
              class="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 hover:scale-105 transition duration-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      </div>
    
          <!-- Pagination -->
          <div v-if="totalPages > 1" class="mt-4 flex justify-center space-x-4">
            <button
              v-for="page in totalPages"
              :key="page"
              class="px-4 py-2 border rounded"
              :class="{
                'bg-blue-500 text-white': currentPage === page,
                'bg-white text-gray-700': currentPage !== page,
              }"
              @click="currentPage = page"
            >
              {{ page }}
            </button>
          </div>

                <!-- Centered Submit All Button -->
        <div class="flex justify-center items-center my-6 space-x-4">
          <!-- Submit All button -->
          <button
            v-if="!submittedAll"
            @click="submitAllPerformanceMetrics"
            
            class="'py-2 px-6 rounded-lg text-lg font-semibold transition-colors bg-blue-500 text-white hover:bg-blue-600"
            
             
            
          >
            Submit All
          </button>

          <!-- Submitted All button (disabled + gray) -->
          <button
            v-else
            disabled
            class="py-2 px-6 rounded-lg text-lg font-semibold bg-gray-400 text-white cursor-default"
          >
            Submitted All
          </button>

          <!-- Review All button (purple) -->
          <button
            v-if="submittedAll"
            @click="reviewAllPerformanceMetrics"
            class="py-2 px-6 rounded-lg text-lg font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-colors"
          >
            Review All
          </button>
        </div>




    </div>
  </div>
</template>
  
  <script setup>
  
  definePageMeta({
    middleware: ['auth', 'adminmanager'],
    layout: 'csd'
  })
  
  import { ref, computed } from 'vue';
  import { onMounted } from 'vue';

  import { months, monthMap, isFutureMonth, getDescriptionColor, getColorByValue } from '@/utils/constants'

  import CsdPerformanceMetrics  from '~/components/csd/CsdPerformanceMetrics';

  import  CSDTooltipCell  from  '~/components/csd/CsdTooltipCell';


   
  const router = useRouter();
  const route = useRoute();
  

  
  //get the current user
    const authStore = useAuthStore()
    authStore.fetchTokenFromLocalStore()
  
    const currentUser = authStore.state.user 

    const showModal = ref(false)

    const showModalMetricsType = ref(false);
    const modalMeticsType = ref('add');
    const  modalMeticsTypeMessage = ref([])

    const selectedData = ref({})
    const metricsType = ref("")


    const modalData = ref("")


    const itemsPerPage = 10;
    const currentPage = ref(1);
    const isModalOpen = ref(false);
    const isModalOpenForLogin = ref(false)
    const  enablePasswordRecovery = ref(false)
    const editMode = ref(false); // Toggle between Add and Edit mode
    const editLoginMode = ref(false); // Toggle between Add and Edit mode for login
    const imagePreview = ref(null);
    const yearMoonth = ref('')


  const csdStoreInstance= useCsdStore()
      
  const openMetricsTypeModal = (selectedAgent) => {
    
  metricsType.value = selectedAgent.metrics_type

    

     if(selectedAgent.submitted ==1 ){
        alert(`Adding, Updating, or Deleting ${metricsType.value} that is already submitted is prohibited.`)
        return
      }

      if(selectedAgent.employee_status == 'Resigned' ){
        alert(`Adding, Updating, or Deleting Agent that is already resigned is prohibitted.`)
        return
      }

      if(isFutureMonth(selectedAgent.year_month)){
        alert(`Adding, Updating, or Deleting ${metricsType.value} for future month is prohibitted.`)
        return
      }
     
      switch(metricsType.value){
          case "email_response_time":
        
            if(currentUser.role != 'admin' &&  ![10, 9].includes(currentUser.position_level)){
               alert(`Not allowed to perform change on ${metricsType.value}`)
              return
            }
              modalMeticsTypeMessage.value = [ `Add ${metricsType.value}`, `Edit ${metricsType.value} `]
            if(['CSD & Collection Manager', 'CSD Assitant Manager'].includes(selectedAgent.position_name) ){
              alert('Cannot Update directly')
              return
            }

          if (typeof selectedAgent.avg_response_minutes === 'number' && selectedAgent.avg_response_minutes >= 0) {
             modalMeticsType.value = 'edit';
          }

            showModalMetricsType.value = true
            selectedData.value = selectedAgent
            break
          case "email_response_count":

            if(currentUser.role != 'admin' &&  ![10, 9].includes(currentUser.position_level)){
               alert(`Not allowed to perform change on ${metricsType.value}`)
              return
            }
              modalMeticsTypeMessage.value = [ `Add ${metricsType.value}`, `Edit ${metricsType.value} `]
            if(['CSD & Collection Manager', 'CSD Assitant Manager'].includes(selectedAgent.position_name) ){
              alert('Cannot Update directly')
              return
            }

            if(typeof(selectedAgent.response_count) === 'number' && typeof(selectedAgent.resolved_tickets) === 'number' ){
              modalMeticsType.value = 'edit'
           
            }
            showModalMetricsType.value = true
            selectedData.value = selectedAgent          
            break

          case "error_report":

            if(currentUser.role != 'admin' &&  ![10, 9].includes(currentUser.position_level)){
               alert(`Not allowed to perform change on ${metricsType.value}`)
              return
            }
              modalMeticsTypeMessage.value = [ `Add ${metricsType.value}`, `Edit ${metricsType.value} `]
            if(['CSD & Collection Manager', 'CSD Assitant Manager'].includes(selectedAgent.position_name) ){
              alert('Cannot Update directly')
              return
            }

            if(typeof(selectedAgent.error_count) === 'number') {
              modalMeticsType.value = 'edit'
           
            }
            showModalMetricsType.value = true
            selectedData.value = selectedAgent          
            break    
            
            
          case "customer_satisfaction_report":

            if(currentUser.role != 'admin' &&  ![10, 9].includes(currentUser.position_level)){
               alert(`Not allowed to perform change on ${metricsType.value}`)
              return
            }
              modalMeticsTypeMessage.value = [ `Add ${metricsType.value}`, `Edit ${metricsType.value} `]
            if(['CSD & Collection Manager', 'CSD Assitant Manager'].includes(selectedAgent.position_name) ){
              alert('Cannot Update directly')
              return
            }

            if(typeof(selectedAgent.customer_not_good) === 'number' && typeof(selectedAgent.customer_just_ok) === 'number' && typeof(selectedAgent.customer_awesome) === 'number' ){
              modalMeticsType.value = 'edit'
           
            }
           
            showModalMetricsType.value = true
            selectedData.value = selectedAgent          
            break  

          case "call_email_calibration":

            if(currentUser.role != 'admin' &&  ![10, 9].includes(currentUser.position_level)){
               alert(`Not allowed to perform change on ${metricsType.value}`)
              return
            }
              modalMeticsTypeMessage.value = [ `Add ${metricsType.value}`, `Edit ${metricsType.value} `]
            if(['CSD & Collection Manager', 'CSD Assitant Manager'].includes(selectedAgent.position_name) ){
              alert('Cannot Update directly')
              return
            }
           if(typeof(selectedAgent.calibration_not_good) === 'number' && typeof(selectedAgent.calibration_just_ok) === 'number' && typeof(selectedAgent.calibration_awesome) === 'number' ){
              modalMeticsType.value = 'edit'
           
            } 
            showModalMetricsType.value = true
            selectedData.value = selectedAgent          
            break  
            
          case "attrition_rate":

            if(currentUser.role != 'admin' &&  ![10, 9].includes(currentUser.position_level)){
               alert(`Not allowed to perform change on ${metricsType.value}`)
              return
            }
              modalMeticsTypeMessage.value = [ `Add ${metricsType.value}`, `Edit ${metricsType.value} `]
            if(['CSD & Collection Manager', 'CSD Assitant Manager'].includes(selectedAgent.position_name) ){
              alert('Cannot Update directly')
              return
            }

            if(selectedAgent.opening_hc > 0 || selectedAgent.closing_hc > 0 || selectedAgent.no_of_resignation > 0  ){
              modalMeticsType.value = 'edit'
           
            }
            showModalMetricsType.value = true
            selectedData.value = selectedAgent          
            break  
          case "inboundcalls":

            if(currentUser.role != 'admin' &&  ![10, 9].includes(currentUser.position_level)){
               alert(`Not allowed to perform change on ${metricsType.value}`)
              return
            }
              modalMeticsTypeMessage.value = [ `Add ${metricsType.value}`, `Edit ${metricsType.value} `]
            if(['CSD & Collection Manager', 'CSD Assitant Manager'].includes(selectedAgent.position_name) ){
              alert('Cannot Update directly')
              return
            }

            if(selectedAgent.inbound_calls > 0 || selectedAgent.total_inbound_calls > 0  ){
              modalMeticsType.value = 'edit'
           
            }
            showModalMetricsType.value = true
            selectedData.value = selectedAgent          
            break     
            
          case "outboundcalls":

            if(currentUser.role != 'admin' &&  ![10, 9].includes(currentUser.position_level)){
               alert(`Not allowed to perform change on ${metricsType.value}`)
              return
            }
              modalMeticsTypeMessage.value = [ `Add ${metricsType.value}`, `Edit ${metricsType.value} `]
            if(['CSD & Collection Manager', 'CSD Assitant Manager'].includes(selectedAgent.position_name) ){
              alert('Cannot Update directly')
              return
            }

            if(selectedAgent.outbound_calls > 0 || selectedAgent.total_outbound_calls > 0  ){
              modalMeticsType.value = 'edit'
           
            }
            showModalMetricsType.value = true
            selectedData.value = selectedAgent          
            break   
          case "missedcalls":

            if(currentUser.role != 'admin' &&  ![10, 9].includes(currentUser.position_level)){
               alert(`Not allowed to perform change on ${metricsType.value}`)
              return
            }
              modalMeticsTypeMessage.value = [ `Add ${metricsType.value}`, `Edit ${metricsType.value} `]
            if(['CSD & Collection Manager', 'CSD Assitant Manager'].includes(selectedAgent.position_name) ){
              alert('Cannot Update directly')
              return
            }

            if(selectedAgent.missed_calls > 0 || selectedAgent.total_missed_calls > 0  ){
              modalMeticsType.value = 'edit'
           
            }
            showModalMetricsType.value = true
            selectedData.value = selectedAgent          
            break                
            
          default:
          console.log("Unknown Metircs type");
          break;
      }

    }

    const resetValues   = () => {
          showModalMetricsType.value = false
          modalMeticsType.value = 'add'
          metricsType.value = ''
          modalMeticsTypeMessage.value = []
      }
    
     const addDataAgent = async(totalRecords ,agent) => {

      const monthNumber = monthMap[agent.month];
  

     switch (metricsType.value){

       case  "email_response_time": 
            if(agent.avg_response_minutes === '' ){
              alert('Average response minutes cannot be empty')
              return
            }
           await  csdStoreInstance.addCsdPerformanceMetricsOrEvaluation(agent.employee_id, 'email_response_time', 'metrics',route.query, {avg_response_minutes: agent.avg_response_minutes})
           fetchCsdOrEvaluationPerformanceMetrics(null, 'all', 'metrics',route.query)
           break
       case "email_response_count":

           if(agent.response_count === '' || agent.resolved_tickets === '' ){
             alert('Response count and Resolved tickets cannot be empty')
             return
           }
    
           await  csdStoreInstance.addCsdPerformanceMetricsOrEvaluation(agent.employee_id, 'email_response_count', 'metrics',route.query, {response_count: agent.response_count, resolved_tickets: agent.resolved_tickets})
            fetchCsdOrEvaluationPerformanceMetrics(null, 'all', 'metrics',route.query)
           break 
        case "error_report":

            if(agent.error_count === '' ){
              alert('Error count cannot be empty')
              return
            }
         
           await  csdStoreInstance.addCsdPerformanceMetricsOrEvaluation(agent.employee_id, 'error_report', 'metrics', route.query, { error_count: agent.error_count})
            fetchCsdOrEvaluationPerformanceMetrics(null, 'all', 'metrics',route.query)
           break   
           
       case "customer_satisfaction_report":

            if (
            agent.customer_not_good === '' || agent.customer_just_ok === '' || agent.customer_awesome === '' 
          ) {
            alert('Cannot add if all customer satisfaction fields are empty')
            return
          }


         
           await  csdStoreInstance.addCsdPerformanceMetricsOrEvaluation(agent.employee_id, 'customer_satisfaction_report', 'metrics', route.query, { customer_not_good: agent.customer_not_good, customer_just_ok: agent.customer_just_ok, customer_awesome: agent.customer_awesome})
          
            fetchCsdOrEvaluationPerformanceMetrics(null, 'all', 'metrics',route.query)
           break  
           
       case "call_email_calibration":

            if (
            agent.calibration_not_good === '' || agent.calibration_just_ok === '' || agent.calibration_awesome === ''
          ) {
            alert('Call Email Calibration fields cannot be empty')
            return
          }

           await  csdStoreInstance.addCsdPerformanceMetricsOrEvaluation(agent.employee_id, 'call_email_calibration', 'metrics', route.query, { calibration_not_good: agent.calibration_not_good, calibration_just_ok: agent.calibration_just_ok, calibration_awesome: agent.calibration_awesome})
            fetchCsdOrEvaluationPerformanceMetrics(null, 'all', 'metrics',route.query)
           break            
      
      default:
          console.log("Unknow Metircs type");
          break;

     }
  
  
    }

    const editDataAgent = async(totalRecords, agent) => {
      const monthNumber = monthMap[agent.month];
      switch (metricsType.value){
        
        case  "email_response_time": 
        
           await  csdStoreInstance.updateCsdPerformanceMetricsOrEvaluation(agent.employee_id, 'email_response_time',  'metrics', route.query, {avg_response_minutes: agent.avg_response_minutes})
            fetchCsdOrEvaluationPerformanceMetrics(null, 'all', 'metrics',route.query)
          break

        case "email_response_count":
           await  csdStoreInstance.updateCsdPerformanceMetricsOrEvaluation(agent.employee_id, 'email_response_count', 'metrics', route.query, {response_count: agent.response_count, resolved_tickets: agent.resolved_tickets})
           fetchCsdOrEvaluationPerformanceMetrics(null, 'all', 'metrics',route.query)
           break   

        case "error_report":
           await  csdStoreInstance.updateCsdPerformanceMetricsOrEvaluation(agent.employee_id, 'error_report', 'metrics', route.query, { error_count: agent.error_count})
            fetchCsdOrEvaluationPerformanceMetrics(null, 'all', 'metrics',route.query)
           break     
           
       case "customer_satisfaction_report":
         
            
           await  csdStoreInstance.updateCsdPerformanceMetricsOrEvaluation(agent.employee_id, 'customer_satisfaction_report', 'metrics', route.query, { customer_not_good: agent.customer_not_good, customer_just_ok: agent.customer_just_ok, customer_awesome: agent.customer_awesome})
            fetchCsdOrEvaluationPerformanceMetrics(null, 'all', 'metrics',route.query)
           break  
           
       case "call_email_calibration":
           await  csdStoreInstance.updateCsdPerformanceMetricsOrEvaluation(agent.employee_id, 'call_email_calibration', 'metrics', route.query, { calibration_not_good: agent.calibration_not_good, calibration_just_ok: agent.calibration_just_ok, calibration_awesome: agent.calibration_awesome})
            fetchCsdOrEvaluationPerformanceMetrics(null, 'all', 'metrics',route.query)
           break              
            
        default:
          console.log("Unknow Metircs type");
          break;

       } 
    
        
    }

        const deleteDataAgent = async(totalRecords,agent) => {
          const monthNumber = monthMap[agent.month];
          switch (metricsType.value){
            case "targetShipok":
                  await useManageSalesStore.updateAgentTarget(agent.agent_id,  route.query, agent )
                  fetchSalesAgentsEvaluation(route.query)
              break  
            case "newDeposit":   
                  //  alert(agent.agent_id)
                  agent.evaluation = true
                  agent.total_records = totalRecords
                  await useManageSalesStore.deleteAgentNewDeposit(agent.agent_id,  route.query, agent )
                   fetchSalesAgentsEvaluation(route.query)
              break 
          case "absence":
          case "tardiness":
          case "memo":     
              agent.evaluation = true
              agent.total_records = totalRecords
              agent.date =  `${agent.year}-${monthNumber.toString().padStart(2, '0')}-01`
              await useManageSalesStore.deleteAgentAttendanceType(agent.agent_id, route.query, metricsType.value, agent)
              fetchSalesAgentsEvaluation(null, 'all',route.query)
            break
          case "deduction":
              agent.evaluation = true
              await useManageSalesStore.addUpdateDeleteDeduction(agent.agent_id, agent, route.query, 'DELETE')
              fetchSalesAgentsEvaluation(null, 'all', route.query)
                                     
            default:
              console.log("Unknow Metircs type");
              break;

          } 
        
        
    }


    const today = new Date()
    const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

   const fetchCsdOrEvaluationPerformanceMetrics = (employee_id, entity_type, entity, query) => {
     csdStoreInstance.fetchCsdOrEvaluationPerformanceMetrics( employee_id, entity_type, entity, query)
   }

  const config = useRuntimeConfig()
  


     const submitPerformanceMetrics = async (agent) => {
    // if (agent.submitted === 0 && agent.ready_to_submit) {
    //   agent.submitted = 1; // Mark as submitted
    // } else if (agent.submitted === 1) {
    //   agent.submitted = 0; // Toggle back (just for demo)
    // }

      if(currentUser.role != 'admin' ){
        alert('No allowed to submit CSD Performance Metrics')
        return
     }
    
    await csdStoreInstance.submitPerformanceMetricsOrEvaluation(agent.id, {
        agent_id: agent.id,
        dbname: agent.db_name,
        year_month: agent.year_month,
        submitted: 1
    }, 'metrics', {year_month: agent.year_month});
  }

const submitAllPerformanceMetrics = async() => {
    if(currentUser.role != 'admin' && currentUser.login_type != 'standarduser'){
      alert('No allowed to submit Performance Metrics')
      return
    }
    agents.value.forEach(agent => {
      if (agent.submitted === 0) {
        agent.submitted = 1;
      }
    });

    const payload = agents.value.map(agent => ({
          employee_id: agent.id,
          dbname: agent.db_name,
          year_month: agent.year_month,
          submitted: 1
      }));

      await csdStoreInstance.submitPerformanceMetricsOrEvaluation('all', payload, 'metrics', {year_month: payload[0].year_month}
  );
};



const reviewAllPerformanceMetrics = async() => {
   if(currentUser.role != 'admin' && currentUser.login_type != 'standarduser'){
        alert('No allowed to review Sales Evaluation')
        return
     }

   // Call the store action to review sales evaluation
   await csdStoreInstance.reviewPerformanceMetricsOrEvaluation('all', {
       year_month: agents.value[0].year_month
   }, 'metrics', { year_month: agents.value[0].year_month});
};



const  reviewPerformanceMetrics = async (agent) => {

   if(currentUser.role != 'admin' && currentUser.login_type != 'standarduser'){
        alert('No allowed to review Performance Metrics')
        return
     }

   // Call the store action to review sales evaluation
   await csdStoreInstance.reviewPerformanceMetricsOrEvaluation(agent.id, {
      year_month : agent.year_month
   },'metrics', {year_month : agent.year_month});
}



const openModal = ( data) => {
    
        showModal.value = true;
   
        modalData.value = data;
      };
      
      const closeModal = () => {
        showModal.value = false;
        
      };   
      
      

  onMounted(() => {
    // no employee_id and query all metrics
    
    fetchCsdOrEvaluationPerformanceMetrics(null, 'all', 'metrics', route.query)
  
  });
  


  

 const agents = computed(() => csdStoreInstance.state.csdPerformanceMertics);

 

  const totalPages = computed(() =>
    Math.ceil(agents.value.length / itemsPerPage)
  )
  
  const paginatedAgents = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return agents.value.slice(start, end);
  });

// Computed: enable button only if all agents are ready
  const canSubmitAll = computed(() => {
    // only true if ALL agents are ready_to_submit
    const agentReadyToSubmit = agents.value
      .filter(agent => agent.position_level !=9)
      .map(agent => agent.submitted);
        return agents.value.length > 0 &&  agentReadyToSubmit.every(Boolean)
  });

  const submittedAll = computed(() => {
    // true if all agents have been submitted

    const agentIsAllSubmitted = agents.value.filter(agent => agent.position_level != 9).map(agent => agent.submitted)
    return agents.value.length > 0 && agentIsAllSubmitted.every(submitted => submitted === 1)
  });


  // const isFutureMonth = (inputYearMonth) => {
  //     const now = new Date();
  //     const currentYear = now.getFullYear();
  //     const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
  //     const currentYearMonth = `${currentYear}-${currentMonth}`;

  //   return inputYearMonth > currentYearMonth;
  // }

   


 watch(route, (newRoute) => {
   // no employee_id and query all metrics
   fetchCsdOrEvaluationPerformanceMetrics(null, 'all', 'metrics', newRoute.query);

});

  </script>
  