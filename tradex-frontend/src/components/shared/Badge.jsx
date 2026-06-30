export const Badge = ({ children, type }) => {
  let styles = "px-2.5 py-1 rounded-md text-xs font-semibold ";
  
  if (type === 'profit' || type === 'buy' || type === 'BUY') {
    styles += "bg-trade-greenBg text-trade-primary";
  } else if (type === 'loss' || type === 'sell' || type === 'SELL') {
    styles += "bg-trade-redBg text-trade-red";
  } else {
    styles += "bg-trade-primary/10 text-trade-muted";
  }

  return <span className={styles}>{children}</span>;
};
