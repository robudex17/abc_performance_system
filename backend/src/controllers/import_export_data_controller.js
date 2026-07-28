const ExcelJS = require('exceljs');
const xlsx = require('xlsx');
const pool = require('../config/db')


const { getDataBorder, getHeaderBorder, getHeaderStyle, monthNames, getTargetShipokPercentageInWholeNumber } = require('./helper_scripts/global_variables_and_functions')

function capitalizeWord(word) {
  if (!word) return "";
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}


const createMetricsSummaryExcelTable = (data, worksheet, secondTableStartRow, title, summaryType) => {
  const getCell = (rowOffset, col) => worksheet.getCell(secondTableStartRow + rowOffset, col);

  // Cell styles
  const headerStyle = {
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '00B050' } },
    font: { bold: true, color: { argb: 'FFFFFF' } },
    alignment: { horizontal: 'center', vertical: 'middle' },
    border: {
      top: { style: 'medium', color: { argb: '000000' } },
      left: { style: 'medium', color: { argb: '000000' } },
      bottom: { style: 'medium', color: { argb: '000000' } },
      right: { style: 'medium', color: { argb: '000000' } },
    },
  };

  const dataBorder = {
    top: { style: 'thin', color: { argb: '000000' } },
    left: { style: 'thin', color: { argb: '000000' } },
    bottom: { style: 'thin', color: { argb: '000000' } },
    right: { style: 'thin', color: { argb: '000000' } },
  };

  // Add Title
  const titleRow = worksheet.getRow(secondTableStartRow);
  worksheet.mergeCells(secondTableStartRow, 1, secondTableStartRow, 5);
  titleRow.getCell(1).value = title;
  titleRow.getCell(1).font = { bold: true, size: 18 };
  titleRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
  titleRow.height = 25;

  let headers

  if(summaryType == 'fullyear'){
      // Header row
    headers = [
      'METRICS TYPE', 'COUNT',  'YEAR',
      'SCORE', 
    ];

  }else{
         // Header row
    headers = [
      'METRICS TYPE', 'COUNT', 'MONTH',  'YEAR',
      'SCORE', 
    ];

  }

  const headerRowNumber = secondTableStartRow + 1;
  const headerRow = worksheet.getRow(headerRowNumber);

  headers.forEach((header, idx) => {
    const cell = headerRow.getCell(idx + 1);
    cell.value = header;
    Object.assign(cell, headerStyle);
  });

  // Add data
  const dataStartRow = headerRowNumber + 1;
  let widths;
if( summaryType == 'fullyear'){
    data.forEach((item, index) => {
    const row = worksheet.getRow(dataStartRow + index);

    row.values = [
      item.metrics_type || '',
      item.count || 0,
      item.year ||  '',
      item.score || 0,
    
    ];

    row.eachCell((cell) => {
      cell.border = dataBorder;
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });
  });
   widths = [20, 15, 10,  10];
}else{
  data.forEach((item, index) => {
    const row = worksheet.getRow(dataStartRow + index);

    row.values = [
      item.metrics_type || '',
      item.count || 0,
      item.month || '',
      item.year || '',
      item.score || 0,
    
    ];

    row.eachCell((cell) => {
      cell.border = dataBorder;
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });
  });
    widths = [20, 15, 10, 15, 10,];
}

  // Adjust column widths
  // const widths = [20, 15, 10, 15, 10,];
  worksheet.columns = widths.map(width => ({ width }));
};

const createTargetExcelTable = (data, worksheet, secondTableStartRow, title) => {
  const getCell = (rowOffset, col) => worksheet.getCell(secondTableStartRow + rowOffset, col);

  // Cell styles
  const headerStyle = {
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '00B050' } },
    font: { bold: true, color: { argb: 'FFFFFF' } },
    alignment: { horizontal: 'center', vertical: 'middle' },
    border: {
      top: { style: 'medium', color: { argb: '000000' } },
      left: { style: 'medium', color: { argb: '000000' } },
      bottom: { style: 'medium', color: { argb: '000000' } },
      right: { style: 'medium', color: { argb: '000000' } },
    },
  };

  const dataBorder = {
    top: { style: 'thin', color: { argb: '000000' } },
    left: { style: 'thin', color: { argb: '000000' } },
    bottom: { style: 'thin', color: { argb: '000000' } },
    right: { style: 'thin', color: { argb: '000000' } },
  };

  // Add Title
  const titleRow = worksheet.getRow(secondTableStartRow);
  worksheet.mergeCells(secondTableStartRow, 1, secondTableStartRow, 9);
  titleRow.getCell(1).value = title;
  titleRow.getCell(1).font = { bold: true, size: 18 };
  titleRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
  titleRow.height = 25;

  // Header row
  const headers = [
    'AGENT_ID', 'MONTH', 'YEAR', 'DATE',
    'TARGET', 'SHIPOK', 'PERCENTAGE',
    'MARKET_ID', 'MARKET_NAME',
  ];

  const headerRowNumber = secondTableStartRow + 1;
  const headerRow = worksheet.getRow(headerRowNumber);

  headers.forEach((header, idx) => {
    const cell = headerRow.getCell(idx + 1);
    cell.value = header;
    Object.assign(cell, headerStyle);
  });

  // Add data
  const dataStartRow = headerRowNumber + 1;

  data.forEach((item, index) => {
    const row = worksheet.getRow(dataStartRow + index);
    const percentage = item.ship_ok && item.target
      ? `${((item.ship_ok / item.target) * 100).toFixed(2)}%`
      : '0%';

    row.values = [
      item.agent_id || '',
      item.month || '',
      item.year || '',
      item.date || '',
      item.target || 0,
      item.ship_ok || 0,
      percentage,
      item.market_id || '',
      item.market_name || '',
    ];

    row.eachCell((cell) => {
      cell.border = dataBorder;
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });
  });

  // Adjust column widths
  const widths = [12, 15, 10, 15, 10, 10, 15, 12, 20];
  worksheet.columns = widths.map(width => ({ width }));
};

const createNewDepositAbenseTardinesAndMemoTable = (data, worksheet, thirdTableStartRow, title) => {
  const getCell = (rowOffset, col) => worksheet.getCell(thirdTableStartRow + rowOffset, col);

  // Styles
  const headerStyle = {
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '00B050' } },
    font: { bold: true, color: { argb: 'FFFFFF' } },
    alignment: { horizontal: 'center', vertical: 'middle' },
    border: {
      top: { style: 'medium', color: { argb: '000000' } },
      left: { style: 'medium', color: { argb: '000000' } },
      bottom: { style: 'medium', color: { argb: '000000' } },
      right: { style: 'medium', color: { argb: '000000' } },
    },
  };

  const dataBorder = {
    top: { style: 'thin', color: { argb: '000000' } },
    left: { style: 'thin', color: { argb: '000000' } },
    bottom: { style: 'thin', color: { argb: '000000' } },
    right: { style: 'thin', color: { argb: '000000' } },
  };

  // Add title row
  const titleRow = worksheet.getRow(thirdTableStartRow);
  worksheet.mergeCells(thirdTableStartRow, 1, thirdTableStartRow, 6); // Extra column merged for description
  titleRow.getCell(1).value = title;
  titleRow.getCell(1).font = { bold: true, size: 18 };
  titleRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
  titleRow.height = 25;

  // Add header row
  const headers = ['AGENT_ID', 'MONTH', 'YEAR', 'DATE', 'DESCRIPTION'];
  const headerRowNumber = thirdTableStartRow + 1;
  const headerRow = worksheet.getRow(headerRowNumber);

  // Insert headers (DESCRIPTION will span 2 columns)
  headers.forEach((header, idx) => {
    const colIndex = idx + 1;
    const cell = headerRow.getCell(colIndex);
    cell.value = header;
    Object.assign(cell, headerStyle);
  });

  worksheet.mergeCells(headerRowNumber, 5, headerRowNumber, 6); // Merge DESCRIPTION column headers

  // Add data rows
  const dataStartRow = headerRowNumber + 1;

  data.forEach((item, index) => {
    const rowNumber = dataStartRow + index;
    const row = worksheet.getRow(rowNumber);

    row.getCell(1).value = item.agent_id || '';
    row.getCell(2).value = item.month || '';
    row.getCell(3).value = item.year || '';
    row.getCell(4).value = item.date || '';
    row.getCell(5).value = item.description || '';

    worksheet.mergeCells(rowNumber, 5, rowNumber, 6); // Merge DESCRIPTION columns per row

    row.eachCell((cell, colNumber) => {
      cell.border = dataBorder;
      cell.alignment = {
        horizontal: colNumber === 5 ? 'left' : 'center',
        vertical: 'middle',
        wrapText: colNumber === 5,
      };
    });

    row.height = 30; // Increase row height for better readability of long text
  });

  // Adjust column widths
  const widths = [12, 12, 10, 12, 40, 0]; // Last column is merged, still needs width for rendering
  worksheet.columns = widths.map((width) => ({ width }));
};

const createAgentFeedbackExcelTable = (data, worksheet, startRow, title, agent_type) => {
  const baseColumns = ['AGENT_ID', 'DB_NAME', 'MONTH', 'YEAR'];
  let columns = [];

  if (agent_type === 0) {
    columns = [...baseColumns, 'Feedback From Manager', 'Feedback From QA', 'Overall Feedback', ];
  } else if (agent_type === 1) {
    columns = [...baseColumns, 'Feedback From Agents', 'Feedback From Manager', 'Feedback From QA', 'Overall Feedback'];
  } else if (agent_type === 2) {
    columns = [...baseColumns, 'Feedback From LM', 'Feedback From QA', 'Overall Feedback'];
  }

  // Write the title
  const titleRow = worksheet.getRow(startRow);
  titleRow.getCell(1).value = title;
  titleRow.font = { bold: true, size: 14 };
  worksheet.mergeCells(startRow, 1, startRow, columns.length);
  startRow++;

  
  // Write header
  const headerRow = worksheet.getRow(startRow);
  columns.forEach((col, index) => {
    const cell = headerRow.getCell(index + 1);
    cell.value = col;
    cell.font = { bold: true,  color: { argb: 'FFFFFF' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '00B050' },
    };
  });
  startRow++;

  // Write data
  data.forEach((item, i) => {
    const row = worksheet.getRow(startRow + i);

    let colIndex = 1;
    row.getCell(colIndex++).value = item.agent_id;
    row.getCell(colIndex++).value = item.db_name;
    row.getCell(colIndex++).value = item.month;
    row.getCell(colIndex++).value = item.year;
   

    if (agent_type === 0) {
      row.getCell(colIndex++).value = item.average_agent_feedback || 'No Feedback';
      row.getCell(colIndex++).value = item.average_feedback_by_qa || 'No Feedback';
      row.getCell(colIndex++).value = item.over_all_average_feedback || 'No Feedback';
    } else if (agent_type === 1) {
      row.getCell(colIndex++).value = item.average_manager_feedback || 'No Feedback';
      row.getCell(colIndex++).value =  item.average_lms_feedback || 'No Feedback';
      row.getCell(colIndex++).value = item.average_feedback_by_qa || 'No Feedback';
      row.getCell(colIndex++).value = item.over_all_average_feedback || 'No Feedback';
     
    } else if (agent_type === 2) {
      row.getCell(colIndex++).value = item.average_manager_feedback || 'No Feedback';
      row.getCell(colIndex++).value = item.average_feedback_by_qa || 'No Feedback';
      row.getCell(colIndex++).value = item.over_all_average_feedback || 'No Feedback';
    }
  });
};


const createPerformanceExcelTable = (data, worksheet, startRow = 1, title, performanceType, fullyear, yearlyFinalRatings, yearlyRatingsName) => {
  const getCell = (rowOffset, col) => worksheet.getCell(startRow + rowOffset, col);
  let agent_ratings_name = data[0].ratings_name
  if (performanceType == 'agent'){
    if(fullyear == 'true' || fullyear == true){
       title = `${title} ${yearlyFinalRatings} / ${yearlyRatingsName}`
    }else{
        title = `${title} ${data[0].final_ratings} / ${data[0].ratings_name}`
    }
  
  }


  // Add report title above the table
  const titleRow = worksheet.getRow(startRow);
  const totalCols = 20; // Total number of columns in the table
  worksheet.mergeCells(startRow, 1, startRow, totalCols);
  titleRow.getCell(1).value = title
  titleRow.getCell(1).font = { bold: true, size: 24 };
  titleRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
  titleRow.height = 30; // Optional: increase row height for title

  startRow += 1; // Move down after title

  // const columnGroups = [
  //   { label: 'YEAR', span: 1 },
  //   { label: 'MONTH', span: 1 },
  //   { label: 'EMPLOYEE NAME', span: 1 },
  //   { label: 'PERFORMANCE (80%)', span: 2, subHeaders: ['SCORE', 'TOTAL'] },
  //   { label: 'ATTENDANCE (10%)', span: 3, subHeaders: ['ABSENCES', 'TARDINESS', 'TOTAL'] },
  //   { label: 'MEMO AND FEEDBACK(10%)', span: 3, subHeaders: ['POINT', 'POINT', 'TOTAL'] },
  //   { label: 'ADDITIONAL POINTS(10%)', span: 2, subHeaders: ['NEW DEPOSIT', 'TOTAL'] },
  //   { label: 'GRAND TOTAL', span: 1 },
  //   { label: 'RATING', span: 1 },
  //   { label: 'MEMO', span: 1 },
  // ];

    const columnGroups = [
    { label: 'AGENT EMPLOYMENTS AND ASSIGNMENTS', span: 8, subHeaders: ['YEAR', 'MONTH,', 'EMPLOYEE NAME', 'EMPLOYEE STATUS', 'POSITION', 'MANAGER', 'MARKET', 'TEAM'] },
   
    { label: 'PERFORMANCE (80%)', span: 2, subHeaders: ['SCORE', 'TOTAL'] },
    { label: 'ATTENDANCE (10%)', span: 3, subHeaders: ['ABSENCES', 'TARDINESS', 'TOTAL'] },
    { label: 'MEMO AND FEEDBACK(10%)', span: 3, subHeaders: ['POINT', 'POINT', 'TOTAL'] },
    { label: 'ADDITIONAL POINTS(10%)', span: 2, subHeaders: ['NEW DEPOSIT', 'TOTAL'] },
    { label: 'GRAND TOTAL', span: 1 },
    { label: 'RATING', span: 1 },
    // { label: 'MEMO', span: 1 },
  ];




  // Set headers
  let currentCol = 1;
  columnGroups.forEach(group => {
    const startCol = currentCol;
    const endCol = currentCol + group.span - 1;
    const startCell = getCell(0, startCol);
    startCell.value = group.label;
    startCell.style = getHeaderStyle();
    startCell.alignment = { horizontal: 'center', vertical: 'middle' };
    startCell.border = getHeaderBorder();

    if (group.span > 1) {
      worksheet.mergeCells(startRow, startCol, startRow, endCol);
      for (let i = 0; i < group.span; i++) {
        const subCell = getCell(1, startCol + i);
        subCell.value = group.subHeaders[i];
        subCell.style = getHeaderStyle();
        subCell.alignment = { horizontal: 'center', vertical: 'middle' };
        subCell.border = getHeaderBorder();
      }
    } else {
      worksheet.mergeCells(startRow, startCol, startRow + 1, startCol);
    }

    currentCol = endCol + 1;
  });

  // Fix column widths
  const columnWidths = [
   10, 12, 20,25,15,15, 15,15,10, 10, 10, 15,15,15,20, 20, 20,20,20,25
  ];
  worksheet.columns = columnWidths.map((width) => ({ width }));

  // Add data rows (starting from row after headers)
  const dataStartRow = startRow + 2;

  data.forEach((rowData, index) => {
    const row = worksheet.getRow(dataStartRow + index);
    row.values = [
      rowData.year || '',
      rowData.month || '',
      capitalizeWord(rowData.db_name) || '',
      rowData.employee_status || '',
      rowData.agent_role || '',
      rowData.manager_dbname || '',
      rowData.market_name.toUpperCase() || '',
      rowData.team_name.toUpperCase() || '',
      rowData.shipok_score || 0,
      rowData.performance_rating || 0,
      rowData.absence_score || 0,
      rowData.tardiness_score || 0,
      rowData.absence_rating + rowData.tardiness_rating || 0,
      rowData.memo_score || 0,
      rowData.feedback_score || 0,
      rowData.memo_rating + rowData.feedback_rating || 0,
      rowData.deposit_score || 0,
      rowData.additional_points || 0,
      rowData.final_ratings || 0,
      rowData.ratings_name || '',
      // rowData.memo_text || '',
    ];

    row.eachCell((cell, colNumber) => {
      cell.border = getDataBorder();
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
       
      //EMPLOYEE STATUS column (4)

      if(colNumber == 4){
        let fontColor
        switch(cell.value){
          case  'Hired': fontColor = '14DB3C'; break;
          case  'Rehired': fontColor ='14DB3C'; break;
          case  'Resigned': fontColor ='DB211A'; break;
        }
        cell.font = {bold: true ,color: { argb: fontColor }}
      }
      // FINAL RATING column (14)
      if (colNumber === 19) {
        let fontColor;
        switch (true) {
          case (cell.value >= 5): fontColor = '7414DB'; break;
          case (cell.value >= 4): fontColor = '0069DB'; break;
          case (cell.value >= 3): fontColor = '00DB4E'; break;
          case (cell.value >= 2): fontColor = 'D9BC4F'; break;
          default: fontColor = 'DB211A';
        }
        cell.font = { bold: true, color: { argb: fontColor } };
      }

      // RATING column (15)
      if (colNumber === 20) {
        let fillColor = 'FFFFFF';
        let fontColor = '000000';
        switch (cell.value) {
          case 'EXCEPTIONAL': fillColor = '7414DB'; fontColor = 'FFFFFF'; break;
          case 'VERY SATISFACTORY': fillColor = '0069DB'; fontColor = 'FFFFFF'; break;
          case 'SATISFACTORY': fillColor = '00DB4E'; break;
          case 'NEEDS IMPROVEMENT': fillColor = 'D99307'; break;
          case 'POOR': fillColor = 'DB211A'; break;
          case 'INCOMPLETE RATING': fillColor = 'DBC414'; fontColor = 'FFFFFF'; break;
        }
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillColor } };
        cell.font = { bold: true, color: { argb: fontColor } };
      }
    });
  });
};


const createYearlyPerformanceExcelTable = (data, worksheet, startRow = 1, title, performanceType) => {
  const getCell = (rowOffset, col) => worksheet.getCell(startRow + rowOffset, col);



  // Add report title above the table
  const titleRow = worksheet.getRow(startRow);
  const totalCols = 8; // Total number of columns in the table
  worksheet.mergeCells(startRow, 1, startRow, totalCols);
  titleRow.getCell(1).value = title
  titleRow.getCell(1).font = { bold: true, size: 24 };
  titleRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
  titleRow.height = 30; // Optional: increase row height for title

  startRow += 1; // Move down after title



  const columnGroups = [
 
    { label: 'YEAR', span: 1 },
    { label: 'EMPLOYEE NAME', span: 1 },
    { label: 'EMPLOYEE STATUS', span: 1 },
    { label: 'TARGET', span: 1 },
    { label: 'SHIPOK', span: 1 },
    { label: 'PERCENTAGE(%)', span: 1 },
    { label: 'RATING', span: 1 },
    { label: 'RATING NAME', span: 1 }


    // { label: 'MEMO', span: 1 },
  ];


  // Set headers
  let currentCol = 1;
  columnGroups.forEach(group => {
    const startCol = currentCol;
    const endCol = currentCol + group.span - 1;
    const startCell = getCell(0, startCol);
    startCell.value = group.label;
    startCell.style = getHeaderStyle();
    startCell.alignment = { horizontal: 'center', vertical: 'middle' };
    startCell.border = getHeaderBorder();

    if (group.span > 1) {
      worksheet.mergeCells(startRow, startCol, startRow, endCol);
      for (let i = 0; i < group.span; i++) {
        const subCell = getCell(1, startCol + i);
        subCell.value = group.subHeaders[i];
        subCell.style = getHeaderStyle();
        subCell.alignment = { horizontal: 'center', vertical: 'middle' };
        subCell.border = getHeaderBorder();
      }
    } else {
      worksheet.mergeCells(startRow, startCol, startRow + 1, startCol);
    }

    currentCol = endCol + 1;
  });

  // Fix column widths
  const columnWidths = [
  25, 25, 25, 25, 25, 25, 25, 25
  ];
  worksheet.columns = columnWidths.map((width) => ({ width }));

  // Add data rows (starting from row after headers)
  const dataStartRow = startRow + 2;

  data.forEach((rowData, index) => {
    const row = worksheet.getRow(dataStartRow + index);
    row.values = [
      rowData.year || '',
    
      capitalizeWord(rowData.db_name) || '',
      rowData.employee_status || '',
      rowData.target || 0, 
      rowData.shipok || 0,
      rowData.shipok_percent || 0,
      rowData.final_ratings || 0,
      rowData.ratings_name || ''
      // rowData.memo_text || '',
    ];

    row.eachCell((cell, colNumber) => {
      cell.border = getDataBorder();
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
       
      //EMPLOYEE STATUS column (4)

      if(colNumber == 3){
        let fontColor
        switch(cell.value){
          case  'Hired': fontColor = '14DB3C'; break;
          case  'Rehired': fontColor ='14DB3C'; break;
          case  'Resigned': fontColor ='DB211A'; break;
        }
        cell.font = {bold: true ,color: { argb: fontColor }}
      }
      // FINAL RATING column (14)
      if (colNumber === 7) {
        let fontColor;
        switch (true) {
          case (cell.value >= 5): fontColor = '7414DB'; break;
          case (cell.value >= 4): fontColor = '0069DB'; break;
          case (cell.value >= 3): fontColor = '00DB4E'; break;
          case (cell.value >= 2): fontColor = 'D9BC4F'; break;
          default: fontColor = 'DB211A';
        }
        cell.font = { bold: true, color: { argb: fontColor } };
      }

      // RATING column (15)
      if (colNumber === 8) {
        let fillColor = 'FFFFFF';
        let fontColor = '000000';
        switch (cell.value) {
          case 'EXCEPTIONAL': fillColor = '7414DB'; fontColor = 'FFFFFF'; break;
          case 'VERY SATISFACTORY': fillColor = '0069DB'; fontColor = 'FFFFFF'; break;
          case 'SATISFACTORY': fillColor = '00DB4E'; break;
          case 'NEEDS IMPROVEMENT': fillColor = 'D99307'; break;
          case 'POOR': fillColor = 'DB211A'; break;
          case 'INCOMPLETE RATING': fillColor = 'DBC414'; fontColor = 'FFFFFF'; break;
        }
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillColor } };
        cell.font = { bold: true, color: { argb: fontColor } };
      }
    });
  });
};


const  createSalesAgentActiveExportToExcel = (data, worksheet, startRow = 1, title, performanceType) => {
  const getCell = (rowOffset, col) => worksheet.getCell(startRow + rowOffset, col);




  // Add report title above the table
  const titleRow = worksheet.getRow(startRow);
  const totalCols = 12; // Total number of columns in the table
  worksheet.mergeCells(startRow, 1, startRow, totalCols);
  titleRow.getCell(1).value = title
  titleRow.getCell(1).font = { bold: true, size: 24 };
  titleRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
  titleRow.height = 30; // Optional: increase row height for title

  startRow += 1; // Move down after title



  const columnGroups = [
 
    { label: 'EMPLOYEE ID', span: 1 },
    { label: 'DATE HIRED', span: 1 },
    { label: 'EMPLOYEE STATUS', span: 1 },
    { label: 'FIRSTNAME', span: 1 },
    { label: 'LASTNAME', span: 1 },
    { label: 'POSITION', span: 1 },
    { label: 'DBNAME', span: 1 },
    { label: 'APP USERNAME', span: 1 },
    { label: 'EMAIL ADD', span: 1 },
    { label: 'MANAGER', span: 1 },
    { label: 'MARKET ASSIGNMENT', span: 1 },
    { label: 'TEAM ASSIGNMENT', span: 1 }


    // { label: 'MEMO', span: 1 },
  ];


  // Set headers
  let currentCol = 1;
  columnGroups.forEach(group => {
    const startCol = currentCol;
    const endCol = currentCol + group.span - 1;
    const startCell = getCell(0, startCol);
    startCell.value = group.label;
    startCell.style = getHeaderStyle();
    startCell.alignment = { horizontal: 'center', vertical: 'middle' };
    startCell.border = getHeaderBorder();

    if (group.span > 1) {
      worksheet.mergeCells(startRow, startCol, startRow, endCol);
      for (let i = 0; i < group.span; i++) {
        const subCell = getCell(1, startCol + i);
        subCell.value = group.subHeaders[i];
        subCell.style = getHeaderStyle();
        subCell.alignment = { horizontal: 'center', vertical: 'middle' };
        subCell.border = getHeaderBorder();
      }
    } else {
      worksheet.mergeCells(startRow, startCol, startRow + 1, startCol);
    }

    currentCol = endCol + 1;
  });

  // Fix column widths
  const columnWidths = [
  25, 25, 25, 25, 25, 25, 25, 25,30, 25, 25 , 30
  ];
  worksheet.columns = columnWidths.map((width) => ({ width }));

  // Add data rows (starting from row after headers)
  const dataStartRow = startRow + 2;

  data.forEach((rowData, index) => {
    const row = worksheet.getRow(dataStartRow + index);
    row.values = [
      rowData.id || '',
      rowData.start_date || '',
      rowData.employee_status || '',
      rowData.firstname || '',
      rowData.lastname || '',
      rowData.agent_role || '',
      capitalizeWord(rowData.db_name) || '',
      capitalizeWord(rowData.username) || '',
      rowData.email || '', 
      rowData.manager_dbname || '',
      rowData.market_name || '',
      rowData.team_name || ''

      // rowData.memo_text || '',
    ];

    row.eachCell((cell, colNumber) => {
      cell.border = getDataBorder();
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
       
      //EMPLOYEE STATUS column (4)

      if(colNumber == 3){
        let fontColor
        switch(cell.value){
          case  'Hired': fontColor = '14DB3C'; break;
          case  'Rehired': fontColor ='14DB3C'; break;
          case  'Resigned': fontColor ='DB211A'; break;
        }
        cell.font = {bold: true ,color: { argb: fontColor }}
      }
      // FINAL RATING column (14)
      // if (colNumber === 7) {
      //   let fontColor;
      //   switch (true) {
      //     case (cell.value >= 5): fontColor = '7414DB'; break;
      //     case (cell.value >= 4): fontColor = '0069DB'; break;
      //     case (cell.value >= 3): fontColor = '00DB4E'; break;
      //     case (cell.value >= 2): fontColor = 'D9BC4F'; break;
      //     default: fontColor = 'DB211A';
      //   }
      //   cell.font = { bold: true, color: { argb: fontColor } };
      // }

      // RATING column (15)
      // if (colNumber === 8) {
      //   let fillColor = 'FFFFFF';
      //   let fontColor = '000000';
      //   switch (cell.value) {
      //     case 'EXCEPTIONAL': fillColor = '7414DB'; fontColor = 'FFFFFF'; break;
      //     case 'VERY SATISFACTORY': fillColor = '0069DB'; fontColor = 'FFFFFF'; break;
      //     case 'SATISFACTORY': fillColor = '00DB4E'; break;
      //     case 'NEEDS IMPROVEMENT': fillColor = 'D99307'; break;
      //     case 'POOR': fillColor = 'DB211A'; break;
      //     case 'INCOMPLETE RATING': fillColor = 'DBC414'; fontColor = 'FFFFFF'; break;
      //   }
      //   cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillColor } };
      //   cell.font = { bold: true, color: { argb: fontColor } };
      // }
    });
  });
};


const createAgentMonthyTargetExcelTable = (data, worksheet, startRow = 1, title, performanceType, fullyear, year_summary, yearlyFinalRatings, yearlyRatingsName) => {
  const getCell = (rowOffset, col) => worksheet.getCell(startRow + rowOffset, col);
  let agent_ratings_name = data[0].ratings_name
  if (performanceType == 'agent'){
    if(fullyear == 'true' || fullyear == true){
       title = `${title} ${yearlyFinalRatings} / ${yearlyRatingsName}`
    }else{
        title = `${title} ${data[0].final_ratings} / ${data[0].ratings_name}`
    }
  
  }


  // Add report title above the table
  const titleRow = worksheet.getRow(startRow);
  const totalCols = 12; // Total number of columns in the table
  worksheet.mergeCells(startRow, 1, startRow, totalCols);
  titleRow.getCell(1).value = title
  titleRow.getCell(1).font = { bold: true, size: 24 };
  titleRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
  titleRow.height = 30; // Optional: increase row height for title

  startRow += 1; // Move down after title

  let columnGroups

  if(performanceType == 'target' && year_summary){
        columnGroups = [
    { label: 'AGENT EMPLOYMENTS AND ASSIGNMENTS', span: 8, subHeaders: ['YEAR', , 'EMPLOYEE NAME', 'EMPLOYEE STATUS', 'POSITION', 'MANAGER', ] },
    { label: 'TARGET AND SHIPOK', span: 4, subHeaders: ['TARGET', 'SHIPOK', 'PERCENTAGE(%)', 'REMAINING UNITS'] },

    // { label: 'MEMO', span: 1 },
  ]; 
 
}else if(performanceType == 'target'){
        columnGroups = [
    { label: 'AGENT EMPLOYMENTS AND ASSIGNMENTS', span: 8, subHeaders: ['YEAR', 'MONTH,', 'EMPLOYEE NAME', 'EMPLOYEE STATUS', 'POSITION', 'MANAGER', 'MARKET', 'TEAM'] },
    { label: 'TARGET AND SHIPOK', span: 4, subHeaders: ['TARGET', 'SHIPOK', 'PERCENTAGE(%)', 'REMAINING UNITS'] },

    // { label: 'MEMO', span: 1 },
  ];
 }else {
    columnGroups = [
    { label: 'AGENT EMPLOYMENTS AND ASSIGNMENTS', span: 8, subHeaders: ['YEAR', 'MONTH,', 'EMPLOYEE NAME', 'EMPLOYEE STATUS', 'POSITION', 'MANAGER', 'MARKET', 'TEAM'] },
    { label: 'TARGET AND SHIPOK', span: 4, subHeaders: ['TARGET', 'SHIPOK', 'PERCENTAGE(%)', 'SCORE'] },
    ]
 }



  // Set headers
  let currentCol = 1;
  columnGroups.forEach(group => {
    const startCol = currentCol;
    const endCol = currentCol + group.span - 1;
    const startCell = getCell(0, startCol);
    startCell.value = group.label;
    startCell.style = getHeaderStyle();
    startCell.alignment = { horizontal: 'center', vertical: 'middle' };
    startCell.border = getHeaderBorder();

    if (group.span > 1) {
      worksheet.mergeCells(startRow, startCol, startRow, endCol);
      for (let i = 0; i < group.span; i++) {
        const subCell = getCell(1, startCol + i);
        subCell.value = group.subHeaders[i];
        subCell.style = getHeaderStyle();
        subCell.alignment = { horizontal: 'center', vertical: 'middle' };
        subCell.border = getHeaderBorder();
      }
    } else {
      worksheet.mergeCells(startRow, startCol, startRow + 1, startCol);
    }

    currentCol = endCol + 1;
  });

  // Fix column widths
  const columnWidths = [
   10, 12, 20,25,15,15, 15,15,10, 10, 10, 10
  ];
  worksheet.columns = columnWidths.map((width) => ({ width }));

  // Add data rows (starting from row after headers)
  const dataStartRow = startRow + 2;

  data.forEach((rowData, index) => {
    const row = worksheet.getRow(dataStartRow + index);
    row.values = [
      rowData.year || '',
      rowData.month || '',
      capitalizeWord(rowData.db_name) || '',
      rowData.employee_status || '',
      rowData.agent_role || '',
      rowData.manager_dbname || '',
      rowData.market_name.toUpperCase() || '',
      rowData.team_name.toUpperCase() || '',
      rowData.target || 0,
      rowData.shipok || 0,
      rowData.shipok_percent  || 0,
      rowData.shipok_score ||  rowData.shipok - rowData.target,

      // rowData.memo_text || '',
    ];

    row.eachCell((cell, colNumber) => {
      cell.border = getDataBorder();
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
       

    });
  });
};


const createAgentMonthyTargetForTeamExcelTable = (data, worksheet, startRow = 1, title, performanceType, fullyear, filterBy, year_summary, yearlyFinalRatings, yearlyRatingsName) => {
      const getCell = (rowOffset, col) => worksheet.getCell(startRow + rowOffset, col);
      let agent_ratings_name = data[0].ratings_name
      if (performanceType == 'agent'){
        if(fullyear == 'true' || fullyear == true){
          title = `${title} ${yearlyFinalRatings} / ${yearlyRatingsName}`
        }else{
            title = `${title} ${data[0].final_ratings} / ${data[0].ratings_name}`
        }
      
      }

 
      // Add report title above the table
      const titleRow = worksheet.getRow(startRow);
      const totalCols = 7; // Total number of columns in the table
      worksheet.mergeCells(startRow, 1, startRow, totalCols);
      titleRow.getCell(1).value = title
      titleRow.getCell(1).font = { bold: true, size: 24 };
      titleRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
      titleRow.height = 30; // Optional: increase row height for title

      startRow += 1; // Move down after title

      let columnGroups


      if(performanceType == 'target' && year_summary){
            columnGroups = [
        { label: 'AGENT EMPLOYMENTS AND ASSIGNMENTS', span: 8, subHeaders: ['YEAR', , 'EMPLOYEE NAME', 'EMPLOYEE STATUS', 'POSITION', 'MANAGER', ] },
        { label: 'TARGET AND SHIPOK', span: 4, subHeaders: ['TARGET', 'SHIPOK', 'PERCENTAGE(%)', 'REMAINING UNITS'] },

        // { label: 'MEMO', span: 1 },
      ]; 
    
    }else if(performanceType == 'target' ){
          
        columnGroups = [
    
            { label: 'TEAM', span: 1 },
            { label: 'MONTH', span: 1 },
            { label: 'YEAR', span: 1 },
            { label: 'TARGET', span: 1 },
            { label: 'SHIPOK', span: 1 },
            { label: 'PERCENTAGE(%)', span: 1 },
            { label: 'REMAINING UNITS', span: 1 },

        ];

     
    }else {
        columnGroups = [
        { label: 'AGENT EMPLOYMENTS AND ASSIGNMENTS', span: 8, subHeaders: ['YEAR', 'MONTH,', 'EMPLOYEE NAME', 'EMPLOYEE STATUS', 'POSITION', 'MANAGER', 'MARKET', 'TEAM'] },
        { label: 'TARGET AND SHIPOK', span: 4, subHeaders: ['TARGET', 'SHIPOK', 'PERCENTAGE(%)', 'SCORE'] },
        ]
    }



      // Set headers
      let currentCol = 1;
      columnGroups.forEach(group => {
        const startCol = currentCol;
        const endCol = currentCol + group.span - 1;
        const startCell = getCell(0, startCol);
        startCell.value = group.label;
        startCell.style = getHeaderStyle();
        startCell.alignment = { horizontal: 'center', vertical: 'middle' };
        startCell.border = getHeaderBorder();

        if (group.span > 1) {
          worksheet.mergeCells(startRow, startCol, startRow, endCol);
          for (let i = 0; i < group.span; i++) {
            const subCell = getCell(1, startCol + i);
            subCell.value = group.subHeaders[i];
            subCell.style = getHeaderStyle();
            subCell.alignment = { horizontal: 'center', vertical: 'middle' };
            subCell.border = getHeaderBorder();
          }
        } else {
          worksheet.mergeCells(startRow, startCol, startRow + 1, startCol);
        }

        currentCol = endCol + 1;
      });

      // Fix column widths
      const columnWidths = [
      15, 15, 15, 15, 15, 15, 15
      ];
      worksheet.columns = columnWidths.map((width) => ({ width }));

      // Add data rows (starting from row after headers)
      const dataStartRow = startRow + 2;

      data.forEach((rowData, index) => {
        const row = worksheet.getRow(dataStartRow + index);
        row.values = [
          rowData.team_name.toUpperCase() || '',
          rowData.month || '',
          rowData.year || '',
          rowData.target || 0,
          rowData.shipok || 0,
           rowData.shipok_percent  || 0,
           rowData.shipok_score ||  rowData.shipok - rowData.target,

          // rowData.memo_text || '',
        ];

        row.eachCell((cell, colNumber) => {
          cell.border = getDataBorder();
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
          

        });
      });
};


const createAgentMonthyTargetForOverallExcelTable = (data, worksheet, startRow = 1, title, performanceType, fullyear, filterBy, year_summary, yearlyFinalRatings, yearlyRatingsName) => {
      const getCell = (rowOffset, col) => worksheet.getCell(startRow + rowOffset, col);
      let agent_ratings_name = data[0].ratings_name
      if (performanceType == 'agent'){
        if(fullyear == 'true' || fullyear == true){
          title = `${title} ${yearlyFinalRatings} / ${yearlyRatingsName}`
        }else{
            title = `${title} ${data[0].final_ratings} / ${data[0].ratings_name}`
        }
      
      }

 
      // Add report title above the table
      const titleRow = worksheet.getRow(startRow);
      const totalCols = 12; // Total number of columns in the table
      worksheet.mergeCells(startRow, 1, startRow, totalCols);
      titleRow.getCell(1).value = title
      titleRow.getCell(1).font = { bold: true, size: 24 };
      titleRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
      titleRow.height = 30; // Optional: increase row height for title

      startRow += 1; // Move down after title

      let columnGroups


      if(performanceType == 'target' && year_summary){
            columnGroups = [
        { label: 'AGENT EMPLOYMENTS AND ASSIGNMENTS', span: 8, subHeaders: ['YEAR', , 'EMPLOYEE NAME', 'EMPLOYEE STATUS', 'POSITION', 'MANAGER', ] },
        { label: 'TARGET AND SHIPOK', span: 4, subHeaders: ['TARGET', 'SHIPOK', 'PERCENTAGE(%)', 'REMAINING UNITS'] },

        // { label: 'MEMO', span: 1 },
      ]; 
    
    }else if(performanceType == 'target' ){
          
        columnGroups = [
    
            { label: 'MARKET', span: 1 },
            { label: 'TEAM', span: 1 },
            { label: 'MONTH', span: 1 },
            { label: 'YEAR', span: 1 },
            { label: 'TARGET', span: 1 },
            { label: 'SHIPOK', span: 1 },
            { label: 'PERCENTAGE(%)', span: 1 },
            { label: 'REMAINING UNITS', span: 1 },
            { label: 'TARGET(NO TRUCK)', span: 1 },
            { label: 'SHIPOK(NO TRUCK)', span: 1 },
            { label: 'PERCENTAGE(%) (NO TRUCK) ', span: 1 },
            { label: 'REMAINING UNITS (NO TRUCK)', span: 1 },


        ];

     
    }else {
        columnGroups = [
        { label: 'AGENT EMPLOYMENTS AND ASSIGNMENTS', span: 8, subHeaders: ['YEAR', 'MONTH,', 'EMPLOYEE NAME', 'EMPLOYEE STATUS', 'POSITION', 'MANAGER', 'MARKET', 'TEAM'] },
        { label: 'TARGET AND SHIPOK', span: 4, subHeaders: ['TARGET', 'SHIPOK', 'PERCENTAGE(%)', 'SCORE'] },
        ]
    }



      // Set headers
      let currentCol = 1;
      columnGroups.forEach(group => {
        const startCol = currentCol;
        const endCol = currentCol + group.span - 1;
        const startCell = getCell(0, startCol);
        startCell.value = group.label;
        startCell.style = getHeaderStyle();
        startCell.alignment = { horizontal: 'center', vertical: 'middle' };
        startCell.border = getHeaderBorder();

        if (group.span > 1) {
          worksheet.mergeCells(startRow, startCol, startRow, endCol);
          for (let i = 0; i < group.span; i++) {
            const subCell = getCell(1, startCol + i);
            subCell.value = group.subHeaders[i];
            subCell.style = getHeaderStyle();
            subCell.alignment = { horizontal: 'center', vertical: 'middle' };
            subCell.border = getHeaderBorder();
          }
        } else {
          worksheet.mergeCells(startRow, startCol, startRow + 1, startCol);
        }

        currentCol = endCol + 1;
      });

      // Fix column widths
      const columnWidths = [
      15, 15, 15, 15, 15, 15, 15,15, 15, 15, 15, 15
      ];
      worksheet.columns = columnWidths.map((width) => ({ width }));

      // Add data rows (starting from row after headers)
      const dataStartRow = startRow + 2;

      data.forEach((rowData, index) => {
        const row = worksheet.getRow(dataStartRow + index);
        row.values = [
          rowData.market_name.toUpperCase() || '',
          rowData.team_name.toUpperCase() || '',
          rowData.month || '',
          rowData.year || '',
          rowData.target || 0,
          rowData.shipok || 0,
           rowData.shipok_percent  || 0,
           rowData.shipok_score ||  rowData.shipok - rowData.target,
          rowData.target_without_trucks || 0,
          rowData.shipok_without_trucks || 0,   
            rowData.shipok_percent_no_truck  || 0,
           rowData.shipok_score_without_trucks ||   rowData.shipok_without_trucks - rowData.target_without_trucks,        

          // rowData.memo_text || '',
        ];

        row.eachCell((cell, colNumber) => {
          cell.border = getDataBorder();
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
          

        });
      });
};


const createTeamPerformanceExcelTable = (
  worksheet,
  targetShipokData,
  newDepositData,
  targtShipokTitle,
  newDepositTitle,
  yearOnly,
  
) => {
  let currentRow = 1;

  const headerStyle = {
    font: { bold: true, color: { argb: 'FFFFFFFF' } }, // white font
    fill: {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF008000' }, // green fill
    },
  };

  // Helper to style and write headers
  const setHeaders = (headers, startRow) => {
    headers.forEach((header, index) => {
      const cell = worksheet.getCell(startRow, index + 1);
      cell.value = header;
      Object.assign(cell, headerStyle);
    });
  };

  // === FIRST TABLE: TARGET / SHIPOK ===
  worksheet.mergeCells(`A${currentRow}:${yearOnly ? 'F' : 'G'}${currentRow}`);
  worksheet.getCell(`A${currentRow}`).value = targtShipokTitle;
  worksheet.getCell(`A${currentRow}`).font = { bold: true };
  currentRow++;

  const targetHeaders = yearOnly
    ? ['MARKET', 'YEAR', 'TARGET', 'SHIPOK', 'SHORTAGE', 'ACHIEVEMENT']
    : ['MARKET', 'MONTH', 'YEAR', 'TARGET', 'SHIPOK', 'SHORTAGE', 'ACHIEVEMENT'];

  setHeaders(targetHeaders, currentRow);
  currentRow++;

  targetShipokData.forEach((row) => {
    const values = yearOnly
      ? [
          row.market_name,
          row.year,
          row.total_target,
          row.total_ship_ok,
          row.shortage,
          row.achievement,
        ]
      : [
          row.market_name,
          row.month,
          row.year,
          row.total_target,
          row.total_ship_ok,
          row.shortage,
          row.achievement,
        ];
    values.forEach((val, colIndex) => {
      worksheet.getCell(currentRow, colIndex + 1).value = val;
    });
    currentRow++;
  });

  currentRow += 2; // space between tables

  // === SECOND TABLE: NEW DEPOSIT ===
  worksheet.mergeCells(`A${currentRow}:${yearOnly ? 'C' : 'D'}${currentRow}`);
  worksheet.getCell(`A${currentRow}`).value = newDepositTitle;
  worksheet.getCell(`A${currentRow}`).font = { bold: true };
  currentRow++;

  const depositHeaders = yearOnly
    ? ['MARKET', 'YEAR', 'NEW DEPOSIT']
    : ['MARKET', 'MONTH', 'YEAR', 'NEW DEPOSIT'];

  setHeaders(depositHeaders, currentRow);
  currentRow++;

  newDepositData.forEach((row) => {
    const values = yearOnly
      ? [row.market_name, row.year, row.new_deposit]
      : [row.market_name, row.month, row.year, row.new_deposit];
    values.forEach((val, colIndex) => {
      worksheet.getCell(currentRow, colIndex + 1).value = val;
    });
    currentRow++;
  });
};

const feedbackData = (agendId, dbName, givenMonth,givenYear, agentFeedback, managerFeedback, lmsFeedback, feedbackByQa, fullyear ) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonthIndex = currentDate.getMonth(); // 0-based index

  const results = [];

  const processMonth = (month, index) => {
   
  
    // Skip future months in current year
    if (parseInt(givenYear) === currentYear && index > currentMonthIndex) return;

    // Filter feedbacks by month and year
    const filterByMonthYear = (data) => {
    
      return data.filter(item => 
        
        item.month === month && item.year === parseInt(givenYear)
      );
    };

    const agentData = filterByMonthYear(agentFeedback || []);
    const managerData = filterByMonthYear(managerFeedback || []);
    const lmsData = filterByMonthYear(lmsFeedback || []);
    const qaData = filterByMonthYear(feedbackByQa || []);
    
   
    const calculateAverage = (data) => {
      if (!Array.isArray(data) || data.length === 0) return null;
      const total = data.reduce((sum, item) => sum + parseFloat(item.feedback_score || 0), 0);
      return (total / data.length).toFixed(2);
    };

    const avgAgent = calculateAverage(agentData);
    const avgManager = calculateAverage(managerData);
    const avgLms = calculateAverage(lmsData);
    const avgQa = calculateAverage(qaData);

    const overall = (() => {
      const scores = [avgAgent, avgManager, avgLms, avgQa]
        .filter(score => score !== null)
        .map(parseFloat);
      if (scores.length === 0) return null;
      return (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2);
    })();

    results.push({
      month,
      year: givenYear,
      agent_id: agendId,
      db_name: dbName,
      average_agent_feedback: avgAgent,
      average_lms_feedback: avgManager,
      average_lms_feedback: avgLms,
      average_feedback_by_qa: avgQa,
      over_all_average_feedback: overall


    });
  };

  if (fullyear == 'true' || fullyear == true) {
    monthNames.forEach((month, index) => {
      processMonth(month, index);
    });
  } else {
    const selectedIndex = monthNames.findIndex(m => m === givenMonth);
   
    if (selectedIndex !== -1) {
      processMonth(givenMonth, selectedIndex);
    }
  }

  return results;
};


//this is controller is use by leaderboard and agent monthly performance..
exports.salesLeaderboardExportToExcel = async (req, res, next) => {
 
  let performance = req.performance
  const workbook = new ExcelJS.Workbook();
  const monthly_score = `${performance[0].month}-${performance[0].year}-SCORE`
  const worksheet = workbook.addWorksheet(monthly_score)
  let  tableTitle = `SALES LEADERBORAD (MONTHLY PERFORMANCE)`

 const leaderboardOption = req.leaderboardOption 

 if(leaderboardOption == 'all'){
  
 
   performance.sort((a, b) => b.agent_type - a.agent_type).sort((a,b) => a.team_id - b.team_id)

  const arranged = [
                ...performance.filter(a => a.market_name.toLowerCase() !== 'trucks'),
                ...performance.filter(a => a.market_name.toLowerCase() === 'trucks')
                ]

   performance = arranged
   tableTitle = 'AGENTS MONTHLY PERFORMANCE'

 }


  createPerformanceExcelTable(performance, worksheet, 1, tableTitle, 'leaderboard')
  
  if(leaderboardOption == 'all'){
    const monthlyTarget =  `${performance[0].month}-${performance[0].year}-TARGET`
    let tableTitle = 'AGENTS MONTHLY TARGET'
     performance.sort((a, b) => b.agent_type - a.agent_type).sort((a,b) => a.team_id - b.team_id)

    const arranged = [
                ...performance.filter(a => a.market_name.toLowerCase() !== 'trucks'),
                ...performance.filter(a => a.market_name.toLowerCase() === 'trucks')
                ]

    performance = arranged
    const worksheet2 = workbook.addWorksheet(monthlyTarget)

     createAgentMonthyTargetExcelTable(performance, worksheet2, 1, tableTitle, 'leaderboard')
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `users-${timestamp}.xlsx`;

  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

  await workbook.xlsx.write(res);
};


exports.salesLeaderboardYearlyExportToExcel = async (req,res, next) => {
  let performance = req.performanceYearly
  const workbook = new ExcelJS.Workbook();
  const yearly_score = `${performance[0].year}-SCORE`
  const worksheet = workbook.addWorksheet(yearly_score)
  let  tableTitle = `SALES AGENTS YEARLY PERFORMANCE`

  
  createYearlyPerformanceExcelTable(performance, worksheet, 1, tableTitle, 'leaderboard')

  //  createPerformanceExcelTable(performance, worksheet, 1, tableTitle, 'leaderboard')

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `users-${timestamp}.xlsx`;

  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

  await workbook.xlsx.write(res);
  

   
}


exports.salesAgentMonthlyPerformanceExportToExcel = async (req,res, next) => {
          
   // Generate file

  const workbook = new ExcelJS.Workbook();
  const performance = req.performance

  const agent_target = req.agent_target 
  const agent_new_deposit = req.agent_new_deposit 
  const agent_absences = req.agent_absences
  const agent_tardiness = req.agent_tardiness
  const agent_memos = req.agent_memo
  const agentFeedback = req.agent_feedback 
  const managerFeedback = req.manager_feedback
  const lmsFeedback = req.lm_feedback
  const feedbackByQa =  req.qa_feedback
  const agent_type = req.agent_type
  const givenMonth = req.query.month 
  const givenYear = req.query.year

 
  const fullyear = req.query.fullyear 

  if( fullyear == 'true' || fullyear == true){

  
        const yearAverage = req.performance.yearAverage 
  
        const agentsFullYearPerformance = req.performance.agentMetricsFullYear
      
      
        const yearPerformanceWorksheetName = `${capitalizeWord(yearAverage.db_name)}-${yearAverage.year}-SCORE`
        const yearPerformanceWorksheet = workbook.addWorksheet(yearPerformanceWorksheetName)

      
      createPerformanceExcelTable(agentsFullYearPerformance , yearPerformanceWorksheet, 1, `${capitalizeWord(yearAverage.db_name)} - (Yearly PERFORMANCE)`, 'agents', fullyear, yearAverage.final_ratings, yearAverage.ratings_name )
        
        // get the yearl metrics summary

        const lastUsedRow = yearPerformanceWorksheet.lastRow.number;
        const secondTableStartRow = lastUsedRow + 3;

        const metricsSummary = [

          { metrics_type: 'ShipOK',  count:yearAverage.shipok, month:yearAverage.month, year:yearAverage.year, score:yearAverage.shipok_score },
          { metrics_type: 'New Deposit',  count:yearAverage.deposit_score, month:yearAverage.month, year:yearAverage.year, score:yearAverage.additional_points },
          { metrics_type: 'Absences',  count:yearAverage.absences, month:yearAverage.month, year:yearAverage.year, score:yearAverage.absence_score },
          { metrics_type: 'Tardiness',  count:yearAverage.tardiness, month:yearAverage.month, year:yearAverage.year, score:yearAverage.tardiness_score },
          { metrics_type: 'Memo',  count:yearAverage.memo, month:yearAverage.month, year:yearAverage.year, score:yearAverage.memo_score }, 
          { metrics_type: 'Feedback',  count:yearAverage.feedback_score, month:yearAverage.month, year:yearAverage.year, score:yearAverage.feedback_score },
        ]


        createMetricsSummaryExcelTable( metricsSummary ,yearPerformanceWorksheet , secondTableStartRow, 'Metrics Year Summary', 'fullyear')

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `users-${timestamp}.xlsx`;
      
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        
        return await workbook.xlsx.write(res);
  }



  const agent_monthly_score = `${capitalizeWord(performance[0].db_name)}-${performance[0].month}-${performance[0].year}-SCORE`
  const worksheet = workbook.addWorksheet(agent_monthly_score)
   
 
   createPerformanceExcelTable(performance, worksheet, 1, `${capitalizeWord(performance[0].db_name)} - (MONTHY PERFORMANCE)`, 'agent', "", "", "")
   const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
   const filename = `users-${timestamp}.xlsx`;

   
   const lastUsedRow = worksheet.lastRow.number;
   const secondTableStartRow = lastUsedRow + 3;

   //transform the performance data

   const metricsSummary = [

    { metrics_type: 'ShipOK',  count: performance[0].shipok, month: performance[0].month, year: performance[0].year, score: performance[0].shipok_score },
    { metrics_type: 'New Deposit',  count: performance[0].deposit_score, month: performance[0].month, year: performance[0].year, score: performance[0].additional_points },
    { metrics_type: 'Absences',  count: performance[0].absences, month: performance[0].month, year: performance[0].year, score: performance[0].absence_score },
    { metrics_type: 'Tardiness',  count: performance[0].tardiness, month: performance[0].month, year: performance[0].year, score: performance[0].tardiness_score },
    { metrics_type: 'Memo',  count: performance[0].memo, month: performance[0].month, year: performance[0].year, score: performance[0].memo_score }, 
    { metrics_type: 'Feedback',  count: performance[0].feedback_score, month: performance[0].month, year: performance[0].year, score: performance[0].feedback_score },
  ]


   createMetricsSummaryExcelTable(metricsSummary, worksheet, secondTableStartRow, 'Metrics Summary', 'month')

   
   res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
   res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  
   await workbook.xlsx.write(res);
  
}

exports.salesTeamPerformanceExportToExcel = async (req, res, next) => {

     // Generate file  
     const workbook = new ExcelJS.Workbook();
    
     let worksheetName = ""
     let targetShipokData = []
     let newDepositData = []
     let targetShipokTitle = ""
     let newDepositTitle = ""
     if(req.year_only){
      targetShipokData = req.year_market_target_shipok
      newDepositData = req.year_market_new_deposit
      worksheetName = `Market Year (${targetShipokData[0].year}) Performance `
      targetShipokTitle  = `Market Target/ShipOk (${targetShipokData[0].year}) `
      newDepositTitle = `Market New Deposit (${targetShipokData[0].year})`
     }else{
      targetShipokData = req.month_market_target_shipok
      newDepositData = req.month_market_new_deposit
      worksheetName = `Market Month ( ${targetShipokData[0].month}  ${targetShipokData[0].year}) Performance `
      targetShipokTitle  = `Market Target/ShipOk ( ${targetShipokData[0].month}  ${targetShipokData[0].year}) `
      newDepositTitle = `Market New Deposit (${targetShipokData[0].month}  ${targetShipokData[0].year})`
     }
     const worksheet = workbook.addWorksheet(worksheetName)
     const yearOnly = req.year_only
     createTeamPerformanceExcelTable(
      worksheet,
      targetShipokData,
      newDepositData,
      targetShipokTitle,
      newDepositTitle,
      yearOnly,
      
    )
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `users-${timestamp}.xlsx`;
  
     res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
     res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    
     await workbook.xlsx.write(res);
    

}


exports.importNewDepositData = async (req, res, io, next) => {
  const duplicateAction = req.query.duplicateAction || 'skip'; // 'skip' | 'update' | 'replace'

  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  try {
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];

    if (!/^NewDeposit$/i.test(sheetName)) {
      return res.status(400).json({
        error: `Invalid sheet name: "${sheetName}". Sheet name must be 'target' (case-insensitive).`,
        sheetName
      });
    }

    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
 
    if (data.length === 0) {
      return res.status(400).json({ error: 'Sheet is empty', sheetName });
    }

    const requiredFields = ['YEAR', 'MONTH', 'NEW DEPOSIT', 'AGENT_ID'];
    const headers = Object.keys(data[0]);
    const missingFields = requiredFields.filter(field => !headers.includes(field));



    let totalRecords = data.length;
    let insertedCount = 0;
    let updatedCount = 0;
    let replacedCount = 0;
    let duplicateSkippedCount = 0;
    let notRegisteredAgentCount = 0;
    let emptyValuesCount = 0;
    
    for (let i = 0; i < totalRecords; i++) {
      const row = data[i];
      const dataFileds = Object.keys(row)
      
      const missingFields = requiredFields.filter(field => !dataFileds.includes(field));
     
      if (missingFields.length > 0) {
        emptyValuesCount++;
        
        continue;
      }

      const [agentResult] = await pool.execute(
        "SELECT market_id FROM sales_agents WHERE id = ?",
        [row.AGENT_ID]
      );

      if (agentResult.length === 0) {
        notRegisteredAgentCount++;
        continue;
      }

      const marketId = agentResult[0].market_id;

      const [checkResult] = await pool.execute(
        "SELECT COUNT(*) AS count FROM new_deposit WHERE agent_id = ? AND month = ? AND year = ?",
        [row.AGENT_ID, row.MONTH, row.YEAR]
      );
     
      const isDuplicate = checkResult[0].count == parseFloat(row['NEW DEPOSIT']);
   
      const date = new Date();
      const currentDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

      if (isDuplicate) {
        if (duplicateAction === 'update') {
         const [result] = await pool.execute(
            `UPDATE new_deposit SET date=?, market_id=?, description=?
             WHERE agent_id = ? AND month = ? AND year = ?`,
            [currentDate,  marketId, `New Deposit For New Customer(updated)- ${currentDate}`, row.AGENT_ID, row.MONTH, row.YEAR]
          );
          updatedCount = updatedCount + result.affectedRows;
        } else if (duplicateAction === 'replace') {
          const [result] = await pool.execute(
            `DELETE FROM new_deposit WHERE agent_id = ? AND month = ? AND year = ?`,
            [row.AGENT_ID, row.MONTH, row.YEAR]
          );
          for (let i = 0 ; i<row['NEW DEPOSIT'] ; i++){
            await pool.execute(
              `INSERT INTO new_deposit (agent_id, month, year, date,  market_id , new_deposit, description)
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [row.AGENT_ID, row.MONTH, row.YEAR, currentDate,  marketId, 100000, `New Deposit For New Customer (replaced) ${currentDate}`]
            );
            replacedCount++;
          }
      
        } else {
          duplicateSkippedCount++;
        }
      } else {
       
        let toInsert = 0
        if(row['NEW DEPOSIT'] > checkResult[0].count){
          toInsert = row['NEW DEPOSIT'] - parseInt(checkResult[0].count)
         
        }else{
          toInsert = row['NEW DEPOSIT'] 
        }
        if(checkResult[0].count > row['NEW DEPOSIT']){
          
          continue
        }
        for (let i = 0 ; i<toInsert ; i++){
          await pool.execute(
            `INSERT INTO new_deposit (agent_id, month, year, date,  market_id , new_deposit, description)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [row.AGENT_ID, row.MONTH, row.YEAR, currentDate,  marketId, 100000, `New Deposit For New Customer - ${currentDate}`]
          );
          insertedCount++;
        }
    
      }

      const progress = Math.round(((i + 1) / totalRecords) * 100);
      io.emit("uploadProgress", {
        progress,
        insertedCount,
        updatedCount,
        replacedCount,
        duplicateSkippedCount,
        notRegisteredAgentCount,
        emptyValuesCount
      });
    }

    res.json({
      message: "Upload completed",
      insertedCount,
      updatedCount,
      replacedCount,
      duplicateSkippedCount,
      notRegisteredAgentCount,
      emptyValuesCount
    });

  } catch (err) {
    console.error("Error processing file:", err);
    res.status(500).send("Error processing file: " + err.message);
  }
};


exports.importTargetShipokData  = async (req, res, io, next) => {
  const duplicateAction = req.query.duplicateAction || 'skip'; // 'skip' | 'update' | 'replace'

  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  try {
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];

    if (!/^target$/i.test(sheetName)) {
      return res.status(400).json({
        error: `Invalid sheet name: "${sheetName}". Sheet name must be 'target' (case-insensitive).`,
        sheetName
      });
    }

    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
 
    if (data.length === 0) {
      return res.status(400).json({ error: 'Sheet is empty', sheetName });
    }

    const requiredFields = ['YEAR', 'MONTH', 'TARGET', 'SHIPOK', 'AGENT_ID'];
    const headers = Object.keys(data[0]);
    const missingFields = requiredFields.filter(field => !headers.includes(field));

    // if (missingFields.length > 0) {
    //   return res.status(400).json({
    //     error: `Missing required fields: ${missingFields.join(', ')}`,
    //     sheetName
    //   });
    // }

    let totalRecords = data.length;
    let insertedCount = 0;
    let updatedCount = 0;
    let replacedCount = 0;
    let duplicateSkippedCount = 0;
    let notRegisteredAgentCount = 0;
    let emptyValuesCount = 0;

    for (let i = 0; i < totalRecords; i++) {
      const row = data[i];
      const dataFileds = Object.keys(row)
      const missingFields = requiredFields.filter(field => !dataFileds.includes(field));
      
      if (missingFields.length > 0) {
        emptyValuesCount++;
        console.log('did I came here?')
        continue;
      }

      const [agentResult] = await pool.execute(
        "SELECT market_id FROM sales_agents WHERE id = ?",
        [row.AGENT_ID]
      );

      if (agentResult.length === 0) {
        notRegisteredAgentCount++;
        continue;
      }

      const marketId = agentResult[0].market_id;

      const [checkResult] = await pool.execute(
        "SELECT COUNT(*) AS count FROM target_shipok WHERE agent_id = ? AND month = ? AND year = ?",
        [row.AGENT_ID, row.MONTH, row.YEAR]
      );

      const isDuplicate = checkResult[0].count > 0;
      const date = new Date();
      const currentDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

      if (isDuplicate) {
        if (duplicateAction === 'update') {
          await pool.execute(
            `UPDATE target_shipok SET date = ?, target = ?, ship_ok = ?, market_id = ?
             WHERE agent_id = ? AND month = ? AND year = ?`,
            [currentDate, row.TARGET, row.SHIPOK, marketId, row.AGENT_ID, row.MONTH, row.YEAR]
          );
          updatedCount++;
        } else if (duplicateAction === 'replace') {
          await pool.execute(
            `DELETE FROM target_shipok WHERE agent_id = ? AND month = ? AND year = ?`,
            [row.AGENT_ID, row.MONTH, row.YEAR]
          );

          await pool.execute(
            `INSERT INTO target_shipok (agent_id, month, year, date, target, ship_ok, market_id)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [row.AGENT_ID, row.MONTH, row.YEAR, currentDate, row.TARGET, row.SHIPOK, marketId]
          );
          replacedCount++;
        } else {
          duplicateSkippedCount++;
        }
      } else {
        await pool.execute(
          `INSERT INTO target_shipok (agent_id, month, year, date, target, ship_ok, market_id)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [row.AGENT_ID, row.MONTH, row.YEAR, currentDate, row.TARGET, row.SHIPOK, marketId]
        );
        insertedCount++;
      }

      const progress = Math.round(((i + 1) / totalRecords) * 100);
      io.emit("uploadProgress", {
        progress,
        insertedCount,
        updatedCount,
        replacedCount,
        duplicateSkippedCount,
        notRegisteredAgentCount,
        emptyValuesCount
      });
    }

    res.json({
      message: "Upload completed",
      insertedCount,
      updatedCount,
      replacedCount,
      duplicateSkippedCount,
      notRegisteredAgentCount,
      emptyValuesCount
    });

  } catch (err) {
    console.error("Error processing file:", err);
    res.status(500).send("Error processing file: " + err.message);
  }
};

exports.importSalesEvaluationData = async (req, res, io) => {

    const loginUser = req.user

    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }

    try {
      const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];

      if (!/^evaluation$/i.test(sheetName)) {
        return res.status(400).json({
          error: `Invalid sheet name: "${sheetName}". Sheet name must be 'evaluation' (case-insensitive).`,
          sheetName
        });
      }

      const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
      if (data.length === 0) {
        return res.status(400).json({ error: "Sheet is empty", sheetName });
      }

        const requiredFields = [
        'YEAR', 'MONTH', 'TARGET', 'SHIPOK', 'NEW DEPOSIT',
        'ABSENCES', 'TARDINESS', 'MEMO', 'FEEDBACK ADMIN', 'FEEDBACK QA', 'AGENT_ID'
      ];

      const numericRegex = /^$|^\d+(\.\d+)?$/;
      const monthList = [
        'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
        'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
      ];

      const currentYear = new Date().getFullYear();

      // 🔹 STEP 1: Pre-check for missing fields & invalid values
      for (let i = 0; i < data.length; i++) {
        const row = data[i];

          // 1️⃣ Check missing required fields
          const missingFields = requiredFields.filter(f =>
            !Object.keys(row).includes(f) 
          
          );
          console.log(missingFields)
          if (missingFields.length > 0) {
            return res.status(404).json({
              error: `Missing required fields in row ${i + 1} ${JSON.stringify(missingFields)}`,
              missingFields,
              row
            });
          }

          // 2️⃣ Check invalid values
          const invalidFields = [];

          for (const field of requiredFields) {
            const value = String(row[field]).trim();

            if (field === 'MONTH') {
              // Month must match one of the allowed names (case-insensitive)
              if (!monthList.includes(value.toUpperCase())) {
                invalidFields.push(field);
              }
            } else if (field == "YEAR") {
              if(!numericRegex.test(value) ) {
                invalidFields.push(field);
              }
              const yearInt = parseInt(value,10)
              if(yearInt> currentYear) {
                invalidFields.push(field);
              }
            } else if (field == 'FEEDBACK ADMIN' || field == 'FEEDBACK QA') {
              if(value > 5) {
                invalidFields.push(field);
              }
            } else if (!numericRegex.test(value)) {
              // Numeric validation for all other fields
              invalidFields.push(field);
            }
          }

          if (invalidFields.length > 0) {
            return res.status(404).json({
              error: `Invalid value(s) in row ${i + 1} ${JSON.stringify(invalidFields)}`,
              invalidFields,
              row
            });
          }
      }





          // =========================
        // 🔹 Stage 2: Upload
        // =========================

        let targetShipokStats = initStats(data.length);
        let newDepositStats = initStats(data.length);
        let absenceStats = initStats(data.length);
        let tardinessStats = initStats(data.length);
        let memoStats = initStats(data.length);
        let feedbackStats = initStats(data.length);

       // Map month names to numbers
    const monthMap = {
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
    };

  

 // Convert "March" -> "03"
        for (let i = 0; i < data.length; i++) {
              const row = data[i];

              // Check for missing fields
              const missingFields = requiredFields.filter(f => !Object.keys(row).includes(f));
              if (missingFields.length > 0) {
                targetShipokStats.emptyValuesCount++;
                newDepositStats.emptyValuesCount++;
                continue;
              }

             
           

              // Check if agent exists
              const [agentResult] = await pool.execute(
                "SELECT *  FROM sales_agents2 WHERE id = ?",
                [row.AGENT_ID]
              );

              console.log(agentResult)
              if (agentResult.length === 0) {
                targetShipokStats.notRegisteredAgentCount++;
                newDepositStats.notRegisteredAgentCount++;
                
                continue;
              }


             //Check if agent_id data is submitted

              console.log('dd I came here?')

             const [checkEvalResult] = await pool.execute(
              
              `SELECT 
                sa.id,
                sa.db_name,
                COALESCE(ses.submitted , 0) AS submitted
                
                FROM sales_agents2 sa 
                LEFT JOIN sales_evaluation_status ses 
                ON sa.id = ses.agent_id
                AND ses.month =? 
                AND ses.year =?
              
              WHERE sa.id =?
              
              `,[toCapitalized(row.MONTH), row.YEAR, row.AGENT_ID])


              if(checkEvalResult[0].submitted == 1){
               targetShipokStats.redonly++
                newDepositStats.redonly++
                absenceStats.redonly++
                tardinessStats.redonly++
                memoStats.redonly++
                feedbackStats.redonly++
                
                continue;
              }
 

                 

             
              const agentDbname = checkEvalResult[0].db_name;
              const qaId = loginUser.login_id 
              const qaDbname = loginUser.db_name
              const qaRole = loginUser.role

              console.log(qaRole)
            

              const currentDate = getCurrentDate();

              // ===============================
              // Process TargetShipok part
              // ===============================

              await targetShipokImport (targetShipokStats,'target_shipok', row.TARGET, row.SHIPOK, row.AGENT_ID, row.MONTH, row.YEAR, currentDate)

              //proccess new Deposit part
              
              await absenceTardinessMemoNewDepositImport(newDepositStats,'new_deposit',row['NEW DEPOSIT'], row.AGENT_ID, row.MONTH, row.YEAR, 'New Deposit')

              //process absences part
              await absenceTardinessMemoNewDepositImport(absenceStats,'absences',row.ABSENCES, row.AGENT_ID,  row.MONTH, row.YEAR, 'Absent')

              //  //process tardiness part
              await absenceTardinessMemoNewDepositImport(tardinessStats,'tardiness',row.TARDINESS, row.AGENT_ID, row.MONTH, row.YEAR, 'Tardiness')

              // process memo part 
              await absenceTardinessMemoNewDepositImport(memoStats,'memo',row.MEMO, row.AGENT_ID,row.MONTH, row.YEAR, 'Memo')

              // process feedback

            await  feedbackDataImport(feedbackStats, "feedback", "feedback_by_qa", row['FEEDBACK ADMIN'],  qaId, qaDbname,  row.AGENT_ID, agentDbname, qaRole, row['FEEDBACK QA'], currentDate, row.MONTH, row.YEAR)

      
              // Emit progress for frontend
              emitProgress(io, i, data.length, { targetShipokStats, newDepositStats, absenceStats, tardinessStats, memoStats, feedbackStats  });
        } 

        res.json({
          message: "Upload completed",
          targetShipokStats,
          newDepositStats,
          absenceStats
        });

  } catch (err) {
        console.error("Error processing file:", err);
        res.status(500).send("Error processing file: " + err.message);
  }
};
 
exports.fetchSalesAgentsExportToExcel = async (req, res, next) => {
  let agents = req.agents
  const workbook = new ExcelJS.Workbook();
  const active_agents = `agent-list`
  const worksheet = workbook.addWorksheet(active_agents)
  let  tableTitle = `SALES AGENTS INFORMATION`

  
  createSalesAgentActiveExportToExcel(agents, worksheet, 1, tableTitle, 'agents')

  //  createPerformanceExcelTable(performance, worksheet, 1, tableTitle, 'leaderboard')

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `users-${timestamp}.xlsx`;

  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

  await workbook.xlsx.write(res); 
}

exports.fetchSalesAgentsTargetExportToExcel = async(req, res, next) => {
  
  const agendId = req.agentId 
  const year_summary = req.year_summary
  const fullyear = req.fullyear
  const filterBy = req.filterBy
 
  let data = []
  
  if(req.dashboard?.data){
    data.push(req.dashboard.data)  // I push dashboard.data inside data array to  make the logic same  on the custom search 
   
    
  
  }else if(req.data){
    data = [...req.data]
    
  }

 
 

  const workbook = new ExcelJS.Workbook();

  //  const lastUsedRow = worksheet.lastRow.number;

  switch(filterBy){
     case "team":     
          data.forEach((d,index) => {
              const month = d[0].month 
              const year = d[0].year
              const teamShipokPercent = d.map(team => {
               
                const percentage =((Number(team.shipok) / Number(team.target)) * 100).toFixed(2)
                const roundOff = Math.round(percentage)
                return {
                  shipok_percent: roundOff, ...team
                }

              })

              const worksheet = workbook.addWorksheet(`team-${month}-${year}-target`)
              let  tableTitle = `TEAM MONTHLY TARGET`
            

              createAgentMonthyTargetForTeamExcelTable(teamShipokPercent, worksheet, 1, tableTitle, 'target') 

              let   teamMembersWithPercent = []

              data[index].forEach((team) => {
                   const members = team.teammembers.map(member => {
                      const percentage =((Number(member.shipok) / Number(member.target)) * 100).toFixed(2)
                      const roundOff = Math.round(percentage)
                       return {
                         shipok_percent: roundOff, ...member
                     }
                   })
                    teamMembersWithPercent.push(members)
                
              })

          

              for( const  teamMemberWithPercent of teamMembersWithPercent){
                const lastUsedRow = worksheet.lastRow.number + 3;
                const team_title = `${teamMemberWithPercent[0].team_name} MEMBERS`.toUpperCase()
                createAgentMonthyTargetExcelTable(teamMemberWithPercent, worksheet, lastUsedRow, team_title , 'target')
              }
                   

           })     
       break 
     case "overall":
 
          data.forEach((d,index) => {
              const month = d[0].month 
              const year = d[0].year
              const overallShipokPercent = d.map(overall => {
               
                const percentage =((Number(overall.shipok) / Number(overall.target)) * 100).toFixed(2)
                const roundOff = Math.round(percentage)
                const percentageNoTruck =((Number(overall.shipok_without_trucks) / Number(overall.target_without_trucks)) * 100).toFixed(2)
                const roundOffNoTruck = Math.round(percentageNoTruck)
                return {
                  shipok_percent: roundOff, shipok_percent_no_truck: roundOffNoTruck, ...overall
                }

              })

              const worksheet = workbook.addWorksheet(`overall-${month}-${year}-target`)
              let  tableTitle = `OVERALL MONTHLY TARGET`
            

              // createAgentMonthyTargetForTeamExcelTable(teamShipokPercent, worksheet, 1, tableTitle, 'target') 
              createAgentMonthyTargetForOverallExcelTable(overallShipokPercent, worksheet,1, tableTitle, 'target' )

              let   teamMembersWithPercent = []

              data[index].forEach((team) => {
                   const members = team.teammembers.map(member => {
                      const percentage =((Number(member.shipok) / Number(member.target)) * 100).toFixed(2)
                      const roundOff = Math.round(percentage)
                       return {
                         shipok_percent: roundOff, ...member
                     }
                   })
                    teamMembersWithPercent.push(members)
                
              })

        
              for( const  teamMemberWithPercent of teamMembersWithPercent){
                const lastUsedRow = worksheet.lastRow.number + 3;
                // const team_title = `${teamMemberWithPercent[0].team_name}`.toUpperCase()
                // createAgentMonthyTargetExcelTable(teamMemberWithPercent, worksheet, lastUsedRow, team_title , 'target')
                createAgentMonthyTargetForTeamExcelTable(teamMemberWithPercent, worksheet, lastUsedRow, "TEAM BREAKDOWN", 'target') 
              }
                   

           })        
       
       break
     default:    // for filterBy 'individual', 'agent', 'lms', 'market' or if filterBy is false or not set
          data.forEach(d => {
          const month = d[0].month 
          const year = d[0].year
          const dataWithShipokPercent = d.map(agent => {
          const percentage =((Number(agent.shipok) / Number(agent.target)) * 100).toFixed(2)
          const roundOff = Math.round(percentage)
          return {
            shipok_percent: roundOff, ...agent
          }
        })
  
          const worksheet = workbook.addWorksheet(`agent-${month}-${year}-target`)
          let  tableTitle = `${filterBy} MONTHLY TARGET`.toUpperCase()


          createAgentMonthyTargetExcelTable(dataWithShipokPercent, worksheet, 1, tableTitle, 'target')

      })

  }



  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `users-${timestamp}.xlsx`;

  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

  await workbook.xlsx.write(res); 

  

  
}

// ================= Utility Functions =================
function initStats(total) {
  return {
    totalRecords: total,
    insertedCount: 0,
    updatedCount: 0,
    replacedCount: 0,
    skippedCount: 0,
    notRegisteredAgentCount: 0,
    emptyValuesCount: 0
  };
}

function emitProgress(io, index, total, stats) {
  const progress = Math.round(((index + 1) / total) * 100);
  io.emit("uploadProgress", { progress, ...stats });
}

function getCurrentDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

async function targetShipokImport (tableStats,table, target, shipok, agent_id, month, year, currentDate){

           const [targetCheck] = await pool.execute(
            `SELECT COUNT(*) AS count FROM ${table} WHERE agent_id = ? AND month = ? AND year = ?`,
            [agent_id, month, year]
          );

          //If target/shipok entry or count is equal 0 insert the new shipok and target 
          if (targetCheck[0].count == 0){
                  await pool.execute(
                `INSERT INTO target_shipok (agent_id, month, year, date, target, ship_ok)
                VALUES (?, ?, ?, ?, ?, ? )`,
                [agent_id, month, year, currentDate, target, shipok]
                );
               tableStats.insertedCount++;
                
          // delete the current target and replace by the new target came from file
          }else  {
               await pool.execute(
                `DELETE FROM target_shipok WHERE agent_id = ? AND month = ? AND year = ?`,
                [agent_id, month, year]
                );
                await pool.execute(
                `INSERT INTO target_shipok (agent_id, month, year, date, target, ship_ok)
                VALUES (?, ?, ?, ?, ?, ? )`,
                [agent_id, month, year, currentDate, target, shipok]
                );
                tableStats.replacedCount++;
          }     

}

async function absenceTardinessMemoNewDepositImport(tableStats,table, type, agent_id,  month, year, description) {
         
            const [check] = await pool.execute(
              `SELECT COUNT(*) AS count FROM ${table} WHERE agent_id = ? AND month = ? AND year = ?`,
              [agent_id, month, year]
            );

            //skip
            if((check[0].count == 0 && parseFloat(type) == 0 ) || (check[0].count == parseFloat(type))) {
               tableStats.skippedCount++;
            }else {
             
              // if( parseFloat(type) != check[0].count) {
              //      //remove the record first
              //       await pool.execute(
              //       `DELETE FROM ${table} WHERE agent_id = ? AND month = ? AND year = ?`,
              //       [agent_id, month, year]
              //       ); 
              // }  

              //remove the record first

              console.log('Delete the record first')
              await pool.execute(
                    `DELETE FROM ${table} WHERE agent_id = ? AND month = ? AND year = ?`,
                    [agent_id, month, year]
                    ); 

              for (let k = 0; k < type; k++) {
                      // const absent = itterationArray[k];
                      // exit the entire loop if the type is 0 (nothing to insert)
                      if(parseFloat(type) == 0){
                          tableStats.skippedCount++;
                          break
                      }
                    
                      let numberOfTimes ;
                      if(k> 10){
                        numberOfTimes = "N Number"
                      }else{
                        numberOfTimes = itterationArray[k];
                      }
                        const givenDate = new Date(`${month} 5, ${year}`);
                        const formatted = givenDate.toISOString().split('T')[0];
                      
                      if(table == 'new_deposit'){
                        console.log('first new deposit')
                       

                        await pool.execute(
                        `INSERT INTO new_deposit (agent_id, month, year, date, new_deposit, description)
                        VALUES (?, ?, ?, ?, ?, ?)`,
                        [agent_id, toCapitalized(month), year,  `${formatted}` , 100000, `New Deposit For New Customer - ${month} ${year}`]
                       )
                      }else{
                        await pool.execute(
                            `INSERT INTO ${table} (agent_id, month, year, date,  description)
                            VALUES (?, ?, ?, ?,? )`,
                            [agent_id, toCapitalized(month), year, `${formatted}`, `${numberOfTimes} ${description} for - ${month} ${year}`] // The date format of this can be formated  properly later.
                        );
                     }
                      
                      if(check[0].count > 0){
                           tableStats.replacedCount++;
                           console.log( "replaced", tableStats.replacedCount);
                      }else{
                        tableStats.insertedCount++;
                        console.log( "inserted", tableStats.insertedCount);

                      }                  
               }
               
            }
}

async function  feedbackDataImport(tableStats, tableAdmin, tableQa, feedbackByAdmin,  qaId, qaDbname, agent_id, agent_dbname, qaRole, feedbackByQa, currentDate,month, year) {

  //delete feedback on the admin and qa for initialization

   await pool.execute(
                `DELETE FROM ${tableAdmin} WHERE agent_id = ? AND month = ? AND year = ?`,
                [agent_id, month, year]
                );
     
   console.log('deleting...'
   )
   await pool.execute(
                    `DELETE FROM ${tableQa} WHERE agent_id = ? AND month = ? AND year = ?`,
                    [agent_id, month, year]
   );
    

    
    if(parseFloat(feedbackByAdmin) > 0){
        await pool.execute(
                `INSERT INTO ${tableAdmin} (agent_id,  agent_dbname, admin_id, admin_dbname, month, year, date, feedback)
                VALUES ( ?, ?, ?, ?, ?,? ,? ,?)`,
                [agent_id, agent_dbname, qaId, qaDbname, toCapitalized(month), year, currentDate, feedbackByAdmin]
         );
         tableStats.insertedCount++;
    }
    console.log("qaRole value is:", qaRole, "length:", qaRole?.length);
    if(parseFloat(feedbackByQa) > 0){
        await pool.execute(
                `INSERT INTO ${tableQa} (qa_id, qa_dbname, agent_id, agent_dbname, qa_role, feedback_score, date, month, year)
                VALUES ( ?, ?, ?, ?, ?, ? ,? ,? ,?)`,
                [qaId, qaDbname, agent_id, agent_dbname, qaRole, feedbackByQa, currentDate, toCapitalized(month), year]
         );
         tableStats.insertedCount++;
    }

}


const itterationArray = ["FIRST", "SECOND", "THIRD", "FOURTH", "FIFTH", "SIXTH", "SEVENTH", "EIGHTH", "NINTH", "TENTH"];


function toCapitalized(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}



