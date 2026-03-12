const calculateMargin = (costPrice, sellingPrice) => {
  const cost = parseFloat(costPrice);
  const selling = parseFloat(sellingPrice);
  const profit = selling - cost;
  const marginPercent = cost > 0 ? ((profit / cost) * 100).toFixed(2) : 0;

  return {
    costPrice: cost,
    sellingPrice: selling,
    profit,
    marginPercent: parseFloat(marginPercent),
  };
};

module.exports = { calculateMargin };
