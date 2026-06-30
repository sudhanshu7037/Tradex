import { useEffect, useRef, memo } from 'react';

const TradingViewMarketOverview = () => {
  const container = useRef(null);

  useEffect(() => {
    if (!container.current) return;
    container.current.innerHTML = '';
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
      {
        "colorTheme": "light",
        "dateRange": "12M",
        "showChart": true,
        "locale": "en",
        "largeChartUrl": "",
        "isTransparent": true,
        "showSymbolLogo": true,
        "showFloatingTooltip": false,
        "width": "100%",
        "height": "100%",
        "tabs": [
          {
            "title": "Indices",
            "symbols": [
              {
                "s": "FOREXCOM:SPXUSD",
                "d": "S&P 500"
              },
              {
                "s": "FOREXCOM:NSXUSD",
                "d": "US 100"
              },
              {
                "s": "FOREXCOM:DJI",
                "d": "Dow 30"
              },
              {
                "s": "INDEX:NKY",
                "d": "Nikkei 225"
              }
            ],
            "originalTitle": "Indices"
          },
          {
            "title": "Crypto",
            "symbols": [
              {
                "s": "BINANCE:BTCUSDT"
              },
              {
                "s": "BINANCE:ETHUSDT"
              }
            ]
          }
        ]
      }`;
    container.current.appendChild(script);
  }, []);

  return (
    <div className="tradingview-widget-container" ref={container} style={{ height: "100%", width: "100%" }}>
      <div className="tradingview-widget-container__widget" style={{ height: "calc(100% - 32px)", width: "100%" }}></div>
    </div>
  );
};

export default memo(TradingViewMarketOverview);
