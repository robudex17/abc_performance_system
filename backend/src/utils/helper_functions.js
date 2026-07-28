exports.isValidMonthRange = (startDate, endDate) => {

     // Ensure both values are provided
  if (!startDate || !endDate) {
    return { valid: false, message: "Please select both start and end month." };
  }

  // Convert to Date objects for easy comparison
  const start = new Date(`${startDate}-01`);
  const end = new Date(`${endDate}-01`);
  const current = new Date();

  // 1️⃣ Start should not be after end
  if (start > end) {
    return { valid: false, message: "Start month cannot be after end month." };
  }

  // 2️⃣ End month should not exceed the current month
  //    (Optional — remove if you allow future months)
  const currentMonth = new Date(current.getFullYear(), current.getMonth(), 1);
  if (end > currentMonth) {
    return { valid: false, message: "Range cannot go beyond the current month." };
  }

  // 3️⃣ Limit total range (optional)
  // e.g., prevent selecting more than 12 months
  // const diffMonths =
  //   (end.getFullYear() - start.getFullYear()) * 12 +
  //   (end.getMonth() - start.getMonth());

  // if (diffMonths > 12) {
  //   return { valid: false, message: "Range cannot exceed 12 months." };
  // }

  return { valid: true };
  
}