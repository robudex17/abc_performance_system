exports.monthMap = {

     January: "01",
      February: "02",
      March: "03",
      April: "04",
      May: "05",
      June: "06",
      July: "07",
      August: "08",
      September: "09",
      October: "10",
      November: "11",
      December: "12"
}

exports.monthNames = [
         "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
],

exports.parseYearMonth = (yearMonth) => { 
    const date  = new Date(`${yearMonth}-01`)
    
    return {
        year: date.getFullYear(),
        month: date.toLocaleString('en-US', { month: 'long' })
    }
}


     // Cell style functions
exports.getHeaderStyle = () => ({
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '00B050' } },
        font: { bold: true, color: { argb: 'FFFFFF' } },
      });

exports.getHeaderBorder = () => ({
        top: { style: 'medium', color: { argb: '000000' } },
        left: { style: 'medium', color: { argb: '000000' } },
        bottom: { style: 'medium', color: { argb: '000000' } },
        right: { style: 'medium', color: { argb: '000000' } },
      });

exports.getDataBorder = () => ({
        top: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'medium', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
        right: { style: 'medium', color: { argb: '000000' } },
      });


 exports.getTargetShipokPercentageInWholeNumber = (target,shipok) => {
                //  {{ target_shipok.total_target > 0 ? Math.round(((Number(target_shipok.total_ship_ok) / Number(target_shipok.total_target)) * 100 )) + '%' : '0%' }} 
                if (Number(target) !=0 && Number(shipok) != 0){
                    const percentage =((shipok / target) * 100).toFixed(2)
                    const roundOff = Math.round(percentage)
                    return roundOff + '%'
                }
                return '0%'
   }    
   
exports.getPointsAndPercentage = (score_board_table , percent) => {
    
}












