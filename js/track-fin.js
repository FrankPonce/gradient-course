/* Track — Investing & Trading. Education only: nothing here is financial advice. Lessons, questions and cases in one file. */
(function () {
  const L = (skill, title, mins, body, keys, extra = {}) => Object.assign({ skill, title, mins, body, keys }, extra);
  const Q = GR.Q, G = GR.G, N = GR.nopts, S = GR.S, T = GR.tbl, C = GR.code, V = GR.viz;
  const f2 = (x) => x.toFixed(2), usd = (x) => "$" + Math.round(x).toLocaleString("en-US"), pc = (x) => (x * 100).toFixed(1) + "%";

  GR.track({
    id: "fin", name: "Investing & Trading", color: "var(--t-fin)", icon: "FIN",
    blurb: "How markets, portfolios and trading strategies actually work, with the statistics to tell skill from luck. Education, not financial advice.",
    modules: [
      { name: "Money over time", topics: [
        { name: "The basics", lessons: [
          L("fin.tvm", "Compounding and the time value of money", 9,
            `<p>A dollar today is worth more than a dollar next year, because today's dollar can earn a return in the meantime. <b>Compounding</b> is earning returns on your past returns: $1,000 at 7% a year becomes $1,070, then $1,144.90, and after 30 years about $7,612. The formula is <code>FV = PV × (1 + r)ⁿ</code>.</p>
             <p>Running it backward gives <b>present value</b>: <code>PV = FV / (1 + r)ⁿ</code>. This <b>discounting</b> is how every asset is valued: a stock or bond is worth the present value of the cash it will pay you.</p>
             <p>The <b>rule of 72</b> is a quick estimate: money doubles in roughly 72 ÷ (rate in percent) years. At 6% that is about 12 years. Two things quietly eat compounding: <b>inflation</b> (your real return is roughly the nominal return minus inflation) and <b>fees</b>.</p>
             <p><i>Try it:</i> the <a href="#/market">Coin exchange</a> lets you watch compounding and volatility with your own coins.</p>`,
            ["FV = PV × (1 + r)ⁿ; PV = FV / (1 + r)ⁿ.", "Rule of 72: doubling time ≈ 72 / rate%.", "Real return ≈ nominal − inflation."], { diagram: "compound", related: ["fnd.algebra", "fin.costs"] }),
          L("fin.assets", "Asset classes: stocks, bonds, cash and funds", 9,
            `<p>A <b>stock</b> (equity) is a share of ownership in a company: you get a claim on its future profits, paid as <b>dividends</b> or reflected in a rising price. Returns are uncertain and can be large in both directions. A <b>bond</b> is a loan: you receive fixed interest (the <b>coupon</b>) and your principal back at maturity, unless the borrower defaults. <b>Cash</b> and money-market funds are the safest and earn the least.</p>
             <p>Most people own these through funds. A <b>mutual fund</b> pools money and is priced once a day. An <b>ETF</b> does the same but trades on an exchange all day like a stock. An <b>index fund</b> (mutual fund or ETF) simply holds everything in an index such as the S&P 500, at very low cost.</p>
             <p>Others you will hear about: real estate (often via REITs), commodities like gold and oil, and crypto assets, which have no cash flows and very high volatility. Historically, more expected return has come with more risk: stocks above bonds above cash.</p>`,
            ["Stock = ownership; bond = loan; cash = safety.", "ETFs trade all day; index funds track a market cheaply.", "Higher expected return comes with higher risk."], { related: ["fin.risk", "fin.costs"] }),
          L("fin.risk", "Risk, return and volatility", 9,
            `<p>An investment's <b>return</b> over a period is <code>(end value − start value + income) / start value</code>. <b>Volatility</b> is the standard deviation of returns: how much they bounce around. A stock index might average 8% a year with 16% volatility, meaning a year at −10% or +25% is entirely ordinary.</p>
             <p>Losses and gains are not symmetric: after a <b>50% loss you need a 100% gain</b> to get back to even. That is why the <b>geometric</b> (compound) average return is always at or below the arithmetic average, and the gap grows with volatility.</p>
             <p>Risk is more than volatility. <b>Drawdown</b> is the fall from a peak to the following low, the pain you actually live through. Some risk is <b>diversifiable</b> (one company's bad news) and some is <b>systematic</b> (the whole market falls). Your <b>time horizon</b> matters: money needed next year should not be exposed to the swings that a 30-year investor can ride out.</p>`,
            ["Volatility = standard deviation of returns.", "A 50% loss needs a 100% gain to recover.", "Drawdown and time horizon matter as much as average return."], { related: ["fnd.stats", "fin.diversify"] }),
        ]},
      ]},
      { name: "How markets work", topics: [
        { name: "Prices and value", lessons: [
          L("fin.markets", "Orders, spreads and liquidity", 9,
            `<p>An exchange matches buyers and sellers through an <b>order book</b>. The <b>bid</b> is the highest price someone will pay; the <b>ask</b> is the lowest price someone will sell for. The gap is the <b>bid-ask spread</b>, a cost you pay every time you trade.</p>
             <p>A <b>market order</b> executes immediately at the best available price: you get speed, not price certainty. A <b>limit order</b> names your price ("buy at $50 or less"): you get price certainty, but it may never fill. A <b>stop order</b> becomes a market order once a trigger price is hit, often used to cap losses, though in a fast fall it can fill well below the trigger.</p>
             <p><b>Liquidity</b> is how easily you can trade without moving the price. Large companies trade with penny spreads; small or exotic assets can have wide spreads and <b>slippage</b> (your order pushes the price against you). <b>Short selling</b> is borrowing a share to sell now and buy back later, profiting if the price falls, with losses that are theoretically unlimited.</p>`,
            ["Bid < ask; the spread is a trading cost.", "Market order: speed. Limit order: price.", "Illiquid assets have wide spreads and slippage."], { related: ["fin.costs", "fin.strategies"] }),
          L("fin.valuation", "Valuing a stock: earnings, multiples and DCF", 10,
            `<p>A company's <b>market capitalization</b> is its share price times the number of shares; that, not the share price alone, tells you how big it is. <b>Earnings per share (EPS)</b> is profit divided by shares. The <b>P/E ratio</b> (price ÷ EPS) says how many dollars investors pay per dollar of annual profit: a high P/E means the market expects growth (or is overexcited); a low P/E means low expectations (or a bargain).</p>
             <p>A <b>discounted cash flow (DCF)</b> model values the company as the present value of all the cash it is expected to produce. It is the right idea in principle and very sensitive in practice: small changes to the growth or discount rate swing the answer enormously.</p>
             <p>The <b>efficient market hypothesis</b> says prices already reflect public information, so finding mispriced stocks is hard: you are competing with professionals. The evidence is that most active managers underperform a simple index fund after fees over long periods.</p>`,
            ["Market cap = price × shares.", "P/E = price / earnings per share.", "DCF = present value of future cash flows; very assumption-sensitive."], { related: ["fin.tvm", "fin.costs"] }),
          L("fin.bonds", "Bonds, yields and interest rates", 9,
            `<p>A bond pays a fixed <b>coupon</b> on its <b>face value</b> and returns the face value at <b>maturity</b>. Its <b>yield</b> is the return you earn at the price you actually pay. If you pay less than face value, your yield is higher than the coupon rate.</p>
             <p>The key relationship: <b>when interest rates rise, existing bond prices fall</b>, and vice versa. A bond paying 3% is less attractive once new bonds pay 5%, so its price drops until its yield matches. <b>Duration</b> measures this sensitivity: a bond with a duration of 7 loses about 7% of its price for a 1 percentage point rise in rates. Longer maturities mean higher duration.</p>
             <p><b>Credit risk</b> is the chance the borrower defaults; riskier borrowers must pay higher yields (the <b>credit spread</b>). The <b>yield curve</b> plots yield against maturity; it usually slopes upward, and an <b>inverted</b> curve (short rates above long rates) has often preceded recessions.</p>`,
            ["Rates up → bond prices down.", "Duration ≈ % price change per 1 point change in rates.", "More credit risk → higher yield."], { related: ["fin.tvm", "fin.risk"] }),
        ]},
      ]},
      { name: "Building a portfolio", topics: [
        { name: "Combining assets", lessons: [
          L("fin.diversify", "Diversification and correlation", 9,
            `<p>Holding many assets reduces risk without necessarily reducing expected return, which is why diversification is called the only free lunch in investing. The portfolio's expected return is the <b>weighted average</b> of its parts, but its volatility is <b>less</b> than the weighted average whenever the parts don't move in lockstep.</p>
             <p><b>Correlation</b> runs from +1 (move together) through 0 (unrelated) to −1 (move opposite). The lower the correlation between holdings, the more risk cancels out. Thirty stocks from different industries remove most company-specific risk; what remains is <b>market risk</b>, which diversification within stocks cannot remove.</p>
             <p><b>Asset allocation</b>, the split between stocks, bonds and cash, drives most of a portfolio's behavior. <b>Rebalancing</b> back to target weights periodically keeps the risk level from drifting, and forces you to trim what has risen and add to what has fallen. One caution: correlations tend to <b>rise in crises</b>, exactly when you want them low.</p>`,
            ["Portfolio return = weighted average of returns.", "Portfolio risk < weighted average unless correlation = +1.", "Diversification removes company risk, not market risk."], { related: ["ds.corr", "fin.capm"] }),
          L("fin.capm", "Beta, alpha and the Sharpe ratio", 9,
            `<p><b>Beta</b> measures how much an asset moves with the market: beta 1 moves with it, beta 1.5 swings 50% more, beta 0.5 half as much. The <b>CAPM</b> says expected return should be <code>risk-free rate + beta × (market return − risk-free rate)</code>: you are paid for bearing market risk, not for risk you could have diversified away.</p>
             <p><b>Alpha</b> is the return beyond what beta explains: the part that could be skill. A fund that returned 12% with beta 1.5 in a year when the market returned 10% and cash 2% was expected to earn 2% + 1.5 × 8% = 14%, so its alpha was −2%: it took extra risk and underdelivered.</p>
             <p>The <b>Sharpe ratio</b>, <code>(return − risk-free rate) / volatility</code>, is return per unit of risk and lets you compare strategies fairly. A high return from high risk is not impressive; a high Sharpe is. Be skeptical of very high reported Sharpe ratios over short periods: they are usually luck, hidden risk or a backtest.</p>`,
            ["Beta = sensitivity to the market.", "Alpha = return not explained by beta.", "Sharpe = (return − risk-free) / volatility."], { related: ["ds.regression", "fin.backtest"] }),
          L("fin.costs", "Index funds, fees and why costs compound too", 8,
            `<p>An <b>expense ratio</b> is the yearly fee a fund takes as a percentage of your money. It sounds small and is not: fees compound against you. Over 30 years at a 7% gross return, a 1.5% fee leaves you with about <b>a third less</b> money than a 0.1% fee.</p>
             <p>Add the other frictions: bid-ask spreads and commissions each time you trade, and <b>taxes</b> on realized gains (frequent trading realizes gains sooner). The arithmetic of active management follows: before costs the average actively managed dollar earns the market return; after costs it must earn less. That is why low-cost index funds beat most active funds over long periods.</p>
             <p><b>Dollar-cost averaging</b> means investing a fixed amount at regular intervals regardless of price. It does not beat the market, but it removes the temptation to time it. And <b>time in the market</b> has historically mattered more than timing: missing a handful of the best days cuts long-run returns dramatically.</p>`,
            ["A 1% fee can cost ~25% of your final wealth over decades.", "After costs, the average active dollar trails the index.", "Invest regularly; don't try to time."], { diagram: "compound", related: ["fin.tvm", "fin.valuation"] }),
        ]},
      ]},
      { name: "Trading and quantitative thinking", topics: [
        { name: "Strategies and their traps", lessons: [
          L("fin.strategies", "Trading strategies: trend, mean reversion and factors", 9,
            `<p><b>Fundamental</b> analysis estimates what a business is worth from its financials; <b>technical</b> analysis looks for patterns in price and volume. Quantitative strategies turn either into explicit rules that can be tested.</p>
             <p>Two families dominate. <b>Momentum / trend following</b> buys what has been rising and sells what has been falling, for example when a short moving average crosses above a long one. <b>Mean reversion</b> bets that an unusually stretched price snaps back, for example buying after a sharp drop or trading the gap between two historically linked stocks (<b>pairs trading</b>).</p>
             <p><b>Factors</b> are broad, persistent sources of return documented in research: value (cheap stocks), momentum, size (small companies), quality and low volatility. An <b>edge</b> is a small statistical advantage that has to survive <b>transaction costs</b> and must be repeated many times. Most apparent edges vanish once costs, slippage and realistic execution are included.</p>`,
            ["Momentum rides trends; mean reversion fades extremes.", "Factors: value, momentum, size, quality, low volatility.", "An edge must survive costs to be real."], { related: ["ds.timeseries", "fin.backtest"] }),
          L("fin.backtest", "Backtesting and how it lies", 10,
            `<p>A <b>backtest</b> runs a strategy on historical data. It is essential and dangerously easy to fool yourself with. The main traps:</p>
             <p><b>Overfitting</b> (data snooping): try enough parameter combinations and one will look brilliant by chance. It is the same disease as overfitting a model, and the cure is the same: tune on one period and judge on a later <b>out-of-sample</b> period you touched only once. <b>Look-ahead bias</b>: using information that was not available at the time, such as today's close to trade at today's open. <b>Survivorship bias</b>: testing only on companies that exist today silently removes every one that went bankrupt.</p>
             <p>Also include <b>costs and slippage</b>, and prefer <b>walk-forward</b> testing (repeatedly fit on the past, test on the next slice). Treat a backtest Sharpe above 2 or 3 as a bug report until proven otherwise. If you tested 100 ideas, the best one's result is not evidence: it is the maximum of 100 random draws.</p>`,
            ["Overfitting, look-ahead and survivorship bias inflate backtests.", "Hold out a period you test on once.", "Always include costs; distrust spectacular results."], { related: ["ml.cv", "ml.biasvar"] }),
          L("fin.options", "Options basics", 10,
            `<p>An <b>option</b> is a contract giving the right, not the obligation, to trade an asset at a fixed <b>strike price</b> by an <b>expiration</b> date. A <b>call</b> is the right to buy; a <b>put</b> is the right to sell. The buyer pays a <b>premium</b> up front.</p>
             <p>At expiration a call is worth <code>max(0, price − strike)</code> and a put <code>max(0, strike − price)</code>. The buyer's profit is that payoff minus the premium paid, so the most a buyer can lose is the premium. The <b>seller</b> (writer) collects the premium and takes the other side, with losses that can be large.</p>
             <p>Options give <b>leverage</b>: a small premium controls a large position, magnifying gains and losses. They are also insurance: a put on a stock you own caps your downside. An option's price rises with <b>volatility</b> and with time remaining; it loses value as expiration approaches (<b>time decay</b>). Most options bought as lottery tickets expire worthless.</p>`,
            ["Call = right to buy; put = right to sell.", "Call payoff = max(0, S − K); buyer's loss is capped at the premium.", "Leverage magnifies both directions; time decay works against buyers."], { related: ["fin.risk", "fin.riskmgmt"] }),
          L("fin.riskmgmt", "Position sizing, drawdowns and your own brain", 9,
            `<p>Survival comes first. <b>Position sizing</b> decides how much you can lose on any one idea. A common rule risks a small fixed share of capital per trade, say 1%: with $10,000 and a stop $2 below your entry, you buy 50 shares, so being wrong costs $100. <b>Leverage</b> (borrowed money) multiplies gains and losses alike and can force you to sell at the worst moment.</p>
             <p><b>Expected value</b> is what matters, not win rate: <code>EV = P(win) × average win − P(loss) × average loss</code>. A strategy that wins 40% of the time is excellent if winners are three times the size of losers. <b>Maximum drawdown</b>, the largest peak-to-trough fall, tells you what you would have had to sit through.</p>
             <p>The biggest risk is behavioral. <b>Loss aversion</b> makes losses hurt about twice as much as equal gains feel good, so people hold losers and sell winners. <b>Overconfidence</b>, <b>recency bias</b> and <b>FOMO</b> push people to buy high and sell low. Rules written in advance are the defense.</p>`,
            ["Size positions so one mistake can't sink you.", "EV = P(win)·avg win − P(loss)·avg loss.", "Write rules first; your instincts buy high and sell low."], { related: ["fin.risk", "ds.prob"] }),
        ]},
      ]},
    ],
  });

  /* ---- fin.tvm ---- */
  Q("fin.tvm", 1, "Compounding means:", ["Earning returns on your previous returns", "Paying fees twice", "Adding the same dollar amount every year", "Borrowing to invest"], "Growth builds on a growing base, which is why it accelerates.");
  Q("fin.tvm", 1, "Using the rule of 72, about how long does money take to double at 8% a year?", ["9 years", "8 years", "12 years", "72 years"], "72 ÷ 8 = 9.");
  Q("fin.tvm", 2, "Why is $1,000 today worth more than $1,000 in five years?", ["Today's money can be invested and earn a return in the meantime", "Banks charge storage fees", "Money physically wears out", "It isn't; they are equal"], "This is the time value of money, and inflation adds to the effect.");
  Q("fin.tvm", 2, "Your investment returned 6% in a year when inflation was 4%. Your real return is roughly:", ["2%", "10%", "6%", "24%"], "Real ≈ nominal − inflation.");
  Q("fin.tvm", 2, "Discounting a future cash flow at a higher rate makes its present value:", ["Smaller", "Larger", "Unchanged", "Negative"], "PV = FV / (1 + r)ⁿ, so a larger r shrinks PV.");
  Q("fin.tvm", 3, "Two people each invest $5,000 a year at the same return. One starts at 25, the other at 35; both stop at 65. Why does the first end up with far more than 10 extra contributions' worth?", ["The early contributions compound for the longest time", "They get a higher interest rate", "Fees are lower for young people", "The market always rises early"], "The first decade's money has 30 to 40 years to grow, which dominates the outcome.");
  G("fin.tvm", 2, (r) => { const pv = r.pick([1000, 2000, 5000]), rate = r.pick([0.04, 0.05, 0.06, 0.08, 0.1]), n = r.pick([5, 10, 20]); const v = pv * (1 + rate) ** n; return { stem: `${usd(pv)} is invested at ${rate * 100}% a year, compounded annually. What is it worth after ${n} years?`, opts: N(v, [pv * (1 + rate * n), pv * (1 + rate) ** (n / 2), pv * (1 + rate * n) * 1.5], usd), expl: `${usd(pv)} × ${f2(1 + rate)}^${n} = ${usd(v)}. Simple interest would give only ${usd(pv * (1 + rate * n))}.` }; });
  G("fin.tvm", 2, (r) => { const fv = r.pick([10000, 50000, 100000]), rate = r.pick([0.05, 0.07, 0.1]), n = r.pick([5, 10, 20]); const v = fv / (1 + rate) ** n; return { stem: `What is the present value of ${usd(fv)} received in ${n} years, discounted at ${rate * 100}% a year?`, opts: N(v, [fv / (1 + rate * n), fv * (1 + rate) ** n, fv * (1 - rate * n > 0 ? 1 - rate * n : 0.1)], usd), expl: `${usd(fv)} / ${f2(1 + rate)}^${n} = ${usd(v)}.` }; });

  /* ---- fin.assets ---- */
  Q("fin.assets", 1, "Buying a share of stock makes you:", ["A part owner of the company", "A lender to the company", "An employee", "A customer"], "Equity is ownership; you share in profits and losses.");
  Q("fin.assets", 1, "A bond is essentially:", ["A loan to a government or company", "A share of ownership", "A savings account", "An insurance policy"], "The issuer pays interest and returns your principal at maturity.");
  Q("fin.assets", 2, "An index fund aims to:", ["Match the return of a market index at low cost", "Beat the market through stock picking", "Avoid all losses", "Trade many times a day"], "It holds what the index holds and charges very little.");
  Q("fin.assets", 2, "The main difference between an ETF and a traditional mutual fund is that an ETF:", ["Trades on an exchange throughout the day", "Can never lose value", "Holds only one stock", "Is always actively managed"], "Mutual funds are priced once a day; ETFs trade like stocks.");
  Q("fin.assets", 2, "Historically, which ordering of long-run average returns (highest first) is typical?", ["Stocks, bonds, cash", "Cash, bonds, stocks", "Bonds, stocks, cash", "They are equal"], "More risk has been rewarded with more return on average over long periods.");
  Q("fin.assets", 3, "A dividend is:", ["A cash payment from a company's profits to its shareholders", "A fee charged by a broker", "The interest on a bond", "A tax on gains"], "Bond interest is a coupon; dividends go to stockholders.");

  /* ---- fin.risk ---- */
  Q("fin.risk", 1, "Volatility measures:", ["How much returns vary around their average", "The average return", "The total fees", "The number of trades"], "It is the standard deviation of returns.");
  Q("fin.risk", 2, "After a 50% loss, what gain is needed to get back to the starting value?", ["100%", "50%", "75%", "25%"], "$100 → $50; getting from $50 to $100 is a 100% gain.");
  Q("fin.risk", 2, "A maximum drawdown of 35% means:", ["At some point the value fell 35% from a previous peak", "The fund lost 35% every year", "Fees were 35%", "35% of trades lost money"], "Drawdown is the peak-to-trough decline.");
  Q("fin.risk", 2, "Which risk can be reduced by holding many different stocks?", ["Company-specific risk", "Market-wide risk", "Inflation risk", "All risk"], "Diversification averages away individual bad news; a market fall hits everything.");
  Q("fin.risk", 3, "Returns of +50% then −50% leave you:", ["Down 25%", "Even", "Up 25%", "Down 50%"], "1.5 × 0.5 = 0.75. The arithmetic average is 0%, but the compound result is −25%.");
  Q("fin.risk", 3, "Why should money needed in one year usually not be in stocks?", ["Stocks can fall sharply and may not recover in time", "Stocks never rise in one year", "It is illegal", "Stocks pay no dividends"], "Short horizons can't absorb large drawdowns.");
  G("fin.risk", 2, (r) => { const loss = r.pick([10, 20, 25, 40, 60, 75]); const v = 100 / (100 - loss) - 1; return { stem: `A portfolio falls ${loss}%. What gain does it need to return to its previous peak?`, opts: N(v, [loss / 100, loss / 100 + 0.05, (loss / 100) * 2 + 0.3], pc), expl: `1 / (1 − ${loss / 100}) − 1 = ${pc(v)}. Recovery takes more than the loss.` }; });
  G("fin.risk", 2, (r) => { const s = r.pick([50, 80, 120, 200]), e = s + r.pick([-20, -10, 15, 30]), d = r.pick([0, 2, 4]); const v = (e - s + d) / s; return { stem: `You buy a share at $${s}, receive $${d} in dividends, and sell at $${e}. What is your total return?`, opts: N(v, [(e - s) / e, (e + d) / s, d / s + 0.5], pc), expl: `(${e} − ${s} + ${d}) / ${s} = ${pc(v)}.` }; });

  /* ---- fin.markets ---- */
  Q("fin.markets", 1, "The bid price is:", ["The highest price a buyer is currently willing to pay", "The lowest price a seller will accept", "Yesterday's closing price", "The price including fees"], "The ask is the lowest selling price. The spread is the gap between them.");
  Q("fin.markets", 1, "A market order guarantees:", ["Execution, but not the price", "The price, but not execution", "Both price and execution", "A profit"], "It fills immediately at the best available price.");
  Q("fin.markets", 2, "You want to buy a stock only if it drops to $40. You should place a:", ["Limit order at $40", "Market order", "Stop order at $50", "Short sale"], "A buy limit order fills only at your price or better.");
  Q("fin.markets", 2, "Bid $19.90, ask $20.10. You buy with a market order and immediately sell with one. Ignoring fees, you lose about:", ["$0.20 per share", "Nothing", "$20.00 per share", "$0.10 per share"], "You buy at the ask and sell at the bid: the full spread.");
  Q("fin.markets", 2, "An illiquid asset is one that:", ["Is hard to trade quickly without moving its price", "Pays no dividends", "Is always falling", "Has no risk"], "Wide spreads and thin order books mean trading costs more.");
  Q("fin.markets", 3, "A short seller profits when:", ["The price falls after they sell the borrowed shares", "The price rises", "Dividends are paid", "Volume increases"], "They sell high first and hope to buy back lower.");
  Q("fin.markets", 3, "A stop-loss order at $90 in a stock that gaps down overnight to $70 will likely fill:", ["Near $70, well below the stop price", "Exactly at $90", "Not at all", "At yesterday's close"], "A stop becomes a market order once triggered; it does not guarantee the price.");

  /* ---- fin.valuation ---- */
  Q("fin.valuation", 1, "Market capitalization is:", ["Share price × number of shares", "The share price", "Annual profit", "Total debt"], "It measures what the market values the whole company at.");
  Q("fin.valuation", 2, "Stock A trades at $20 and stock B at $500. Which company is bigger?", ["You can't tell without the number of shares", "B", "A", "They are equal"], "Share price alone says nothing about size.");
  Q("fin.valuation", 2, "A high P/E ratio usually signals that investors:", ["Expect strong future earnings growth", "Expect the company to shrink", "Receive large dividends", "Pay low fees"], "They are paying more for each dollar of today's profit.");
  Q("fin.valuation", 2, "A DCF values a company as:", ["The present value of its expected future cash flows", "Its share price times its P/E", "The sum of its past profits", "Its revenue last year"], "It discounts forecast cash flows back to today.");
  Q("fin.valuation", 3, "Why are DCF valuations treated with caution?", ["Small changes in growth or discount-rate assumptions change the result a lot", "They ignore cash flows", "They can only value banks", "They are illegal to publish"], "The output is only as good as the forecasts fed in.");
  Q("fin.valuation", 3, "The efficient market hypothesis implies that consistently beating the market is:", ["Hard, because prices already reflect public information", "Easy with enough charts", "Guaranteed for professionals", "Impossible even by luck"], "Luck still produces some winners; persistent skill after costs is rare.");
  G("fin.valuation", 2, (r) => { const eps = r.pick([2, 4, 5, 8]), pe = r.pick([12, 15, 20, 30]); return { stem: `A company earns $${eps} per share and trades at a P/E of ${pe}. What is its share price?`, opts: N(eps * pe, [pe / eps, eps + pe, eps * pe * 2], (x) => "$" + (x % 1 ? x.toFixed(2) : x)), expl: `Price = EPS × P/E = ${eps} × ${pe} = $${eps * pe}.` }; });
  G("fin.valuation", 2, (r) => { const price = r.pick([24, 45, 60, 150]), sh = r.pick([50, 200, 800]); const v = price * sh; return { stem: `A company has ${sh} million shares trading at $${price}. What is its market capitalization?`, opts: N(v, [v / 10, price + sh, v * 10], (x) => (x >= 1000 ? "$" + (x / 1000).toFixed(1) + " billion" : "$" + Math.round(x) + " million")), expl: `${sh} million × $${price} = $${v.toLocaleString("en-US")} million.` }; });

  /* ---- fin.bonds ---- */
  Q("fin.bonds", 1, "When interest rates rise, existing bond prices generally:", ["Fall", "Rise", "Stay the same", "Double"], "Old bonds with lower coupons become less attractive, so their prices drop.");
  Q("fin.bonds", 2, "A bond's coupon is:", ["The fixed interest payment it makes", "Its price today", "The fee to buy it", "Its credit rating"], "It is set at issue as a percentage of face value.");
  Q("fin.bonds", 2, "A bond with a duration of 6 will change in price by about how much if rates rise by 1 percentage point?", ["−6%", "+6%", "−1%", "−60%"], "Price change ≈ −duration × change in rates.");
  Q("fin.bonds", 2, "Why does a risky company's bond pay a higher yield than a government bond?", ["Investors demand compensation for the chance of default", "It has a longer name", "Governments pay no interest", "Regulations require it"], "The extra yield is the credit spread.");
  Q("fin.bonds", 3, "You buy a bond for less than its face value and hold it to maturity. Your yield is:", ["Higher than the coupon rate", "Lower than the coupon rate", "Equal to the coupon rate", "Zero"], "You earn the coupons plus the gain up to face value.");
  Q("fin.bonds", 3, "An inverted yield curve means:", ["Short-term rates are higher than long-term rates", "All yields are negative", "Bond prices equal stock prices", "Long-term rates are much higher"], "It has often preceded recessions, though not with precise timing.");
  G("fin.bonds", 2, (r) => { const d = r.pick([2, 5, 8, 12]), dr = r.pick([0.5, 1, 2]), up = r.pick([true, false]); const v = -d * dr * (up ? 1 : -1); return { stem: `A bond fund has a duration of ${d}. Interest rates ${up ? "rise" : "fall"} by ${dr} percentage point${dr === 1 ? "" : "s"}. Roughly how does its price change?`, opts: N(v, [-v, v / d, v * 2], (x) => (x > 0 ? "+" : "") + x.toFixed(1) + "%"), expl: `≈ −${d} × ${up ? "+" : "−"}${dr} = ${v > 0 ? "+" : ""}${v.toFixed(1)}%.` }; });

  /* ---- fin.diversify ---- */
  Q("fin.diversify", 1, "Diversification is called a 'free lunch' because it:", ["Lowers risk without necessarily lowering expected return", "Guarantees profits", "Removes all fees", "Doubles returns"], "Imperfectly correlated assets partly cancel each other's swings.");
  Q("fin.diversify", 2, "Two assets with a correlation of +1.0 provide:", ["No diversification benefit", "Maximum diversification", "A guaranteed profit", "Zero risk"], "They move in lockstep, so nothing cancels.");
  Q("fin.diversify", 2, "The expected return of a portfolio is:", ["The weighted average of its assets' expected returns", "The highest asset return", "Always zero", "The sum of all returns"], "Return averages linearly; risk does not.");
  Q("fin.diversify", 2, "Holding 30 stocks from different industries mostly eliminates:", ["Company-specific risk", "Market risk", "Inflation", "Taxes"], "Market-wide moves still hit the whole portfolio.");
  Q("fin.diversify", 3, "Rebalancing a 60/40 portfolio after stocks rally means:", ["Selling some stocks and buying bonds to return to 60/40", "Buying more stocks", "Selling everything", "Doing nothing"], "It keeps the risk level from drifting up.");
  Q("fin.diversify", 3, "Why can diversification disappoint in a crisis?", ["Correlations between risky assets tend to rise when markets fall", "Bonds stop existing", "Indexes are suspended", "Fees triple"], "Assets that looked unrelated can fall together under stress.");
  G("fin.diversify", 2, (r) => { const w = r.pick([0.5, 0.6, 0.7, 0.8]), a = r.pick([8, 9, 10]), b = r.pick([2, 3, 4]); const v = w * a + (1 - w) * b; return { stem: `A portfolio is ${w * 100}% stocks (expected return ${a}%) and ${Math.round((1 - w) * 100)}% bonds (expected return ${b}%). What is its expected return?`, opts: N(v, [(a + b) / 2, a, w * b + (1 - w) * a], (x) => x.toFixed(1) + "%"), expl: `${w} × ${a}% + ${f2(1 - w)} × ${b}% = ${v.toFixed(1)}%.` }; });

  /* ---- fin.capm ---- */
  Q("fin.capm", 1, "A stock with a beta of 1.5 is expected to:", ["Move about 50% more than the market, up and down", "Always beat the market", "Move opposite to the market", "Never fall"], "Beta is sensitivity, not a promise of outperformance.");
  Q("fin.capm", 2, "The Sharpe ratio measures:", ["Excess return per unit of volatility", "Total return", "Fees paid", "The number of holdings"], "(return − risk-free rate) / standard deviation.");
  Q("fin.capm", 2, "Alpha is:", ["Return beyond what market exposure (beta) explains", "The market's return", "The risk-free rate", "A measure of volatility"], "It is the part that might reflect skill.");
  Q("fin.capm", 2, "Fund A: 12% return, 20% volatility. Fund B: 9% return, 10% volatility. The risk-free rate is 2%. Which has the better risk-adjusted return?", ["B (Sharpe 0.7 vs 0.5)", "A (higher return)", "They are equal", "Neither can be computed"], "A: (12 − 2)/20 = 0.5. B: (9 − 2)/10 = 0.7.");
  Q("fin.capm", 3, "According to CAPM, investors are compensated for bearing:", ["Market (systematic) risk only", "All volatility", "Company-specific risk only", "No risk at all"], "Diversifiable risk earns no premium because it can be removed for free.");
  Q("fin.capm", 3, "A strategy shows a Sharpe ratio of 4 over six months. The best reaction is:", ["Skepticism: check for luck, hidden risk or a testing error", "Invest everything", "Assume it will continue", "Double the leverage"], "Sustained Sharpe ratios that high are extremely rare.");
  G("fin.capm", 2, (r) => { const ret = r.pick([8, 10, 12, 15]), rf = r.pick([2, 3]), vol = r.pick([10, 15, 20]); const v = (ret - rf) / vol; return { stem: `A fund returned ${ret}% with ${vol}% volatility. The risk-free rate was ${rf}%. What is its Sharpe ratio?`, opts: N(v, [ret / vol, (ret - rf) / 100, vol / (ret - rf)], f2), expl: `(${ret} − ${rf}) / ${vol} = ${f2(v)}.` }; });
  G("fin.capm", 3, (r) => { const rf = r.pick([2, 3]), mkt = r.pick([8, 9, 10]), beta = r.pick([0.5, 0.8, 1.2, 1.5]), act = r.pick([6, 9, 12, 14]); const exp = rf + beta * (mkt - rf), v = act - exp; return { stem: `Risk-free rate ${rf}%, market return ${mkt}%. A fund with beta ${beta} returned ${act}%. What was its alpha under CAPM?`, opts: N(v, [act - mkt, act - rf, -v + 0.5], (x) => (x > 0 ? "+" : "") + x.toFixed(1) + "%"), expl: `Expected = ${rf} + ${beta} × (${mkt} − ${rf}) = ${exp.toFixed(1)}%. Alpha = ${act} − ${exp.toFixed(1)} = ${v.toFixed(1)}%.` }; });

  /* ---- fin.costs ---- */
  Q("fin.costs", 1, "An expense ratio of 1% means:", ["The fund takes 1% of your invested money every year", "A one-time 1% fee", "1% of your gains only", "You earn 1% interest"], "It is charged annually on the whole balance, gain or loss.");
  Q("fin.costs", 2, "Why do most actively managed funds trail index funds over long periods?", ["Their higher costs outweigh whatever edge they have on average", "Managers are not allowed to buy good stocks", "Index funds use leverage", "Active funds hold only bonds"], "Before costs the average active dollar earns the market; after costs it earns less.");
  Q("fin.costs", 2, "Dollar-cost averaging means:", ["Investing a fixed amount at regular intervals regardless of price", "Buying only when prices fall", "Averaging your fees", "Selling at a fixed price"], "It automates the habit and removes timing decisions.");
  Q("fin.costs", 2, "Frequent trading tends to hurt returns mainly through:", ["Spreads, commissions and earlier taxes on gains", "Higher dividends", "Lower volatility", "Longer holding periods"], "Every trade pays a toll.");
  Q("fin.costs", 3, "Missing the market's 10 best days over 20 years typically:", ["Cuts the final value dramatically", "Makes no difference", "Improves returns", "Only affects taxes"], "The best days cluster near the worst ones, so jumping in and out tends to miss them.");
  G("fin.costs", 3, (r) => { const g = r.pick([0.06, 0.07, 0.08]), fee = r.pick([0.01, 0.015, 0.02]), n = r.pick([20, 30, 40]), lo = 0.001; const a = (1 + g - lo) ** n, b = (1 + g - fee) ** n, v = 1 - b / a; return { stem: `Two funds earn ${g * 100}% a year before fees. One charges 0.1% and the other ${fee * 100}%. After ${n} years, about how much smaller is the high-fee investor's balance?`, opts: N(v, [fee, fee * n * 0.3, Math.min(0.9, v + 0.25)], (x) => (x * 100).toFixed(0) + "%"), expl: `(1 + ${f2(g - fee)})^${n} ÷ (1 + ${(g - lo).toFixed(3)})^${n} ≈ ${f2(b / a)}, so about ${(v * 100).toFixed(0)}% less. Fees compound too.` }; });

  /* ---- fin.strategies ---- */
  Q("fin.strategies", 1, "A momentum strategy:", ["Buys assets that have been rising and sells those that have been falling", "Buys only bonds", "Buys whatever fell most yesterday", "Never trades"], "It bets that recent trends continue for a while.");
  Q("fin.strategies", 2, "A mean-reversion strategy bets that:", ["Prices that moved unusually far will move back toward normal", "Trends continue forever", "Dividends will rise", "Volume predicts earnings"], "It fades extremes.");
  Q("fin.strategies", 2, "A 50-day moving average crossing above a 200-day moving average is a classic signal for:", ["Trend following", "Mean reversion", "Options pricing", "Bond duration"], "A short-term average rising above a long-term one suggests an uptrend.");
  Q("fin.strategies", 2, "Pairs trading involves:", ["Going long one of two historically linked assets and short the other when they diverge", "Buying two stocks at random", "Trading only in pairs of days", "Holding two index funds"], "It bets on the spread between them closing.");
  Q("fin.strategies", 3, "The 'value' factor refers to stocks that are:", ["Cheap relative to fundamentals such as earnings or book value", "The most expensive", "The most volatile", "Recently listed"], "Value, momentum, size, quality and low volatility are the best-known factors.");
  Q("fin.strategies", 3, "A strategy earns 0.05% per trade on average before costs, and each trade costs 0.10%. It is:", ["Unprofitable: costs exceed the edge", "Highly profitable", "Risk-free", "Profitable if traded more often"], "Trading more only multiplies a negative expected value.");

  /* ---- fin.backtest ---- */
  Q("fin.backtest", 1, "A backtest is:", ["A simulation of a strategy on historical data", "A guarantee of future returns", "A regulatory filing", "A live trading account"], "It shows what would have happened, under your assumptions.");
  Q("fin.backtest", 2, "You try 500 parameter combinations and report the best one. The main risk is:", ["Overfitting: the winner may be a product of chance", "Too few trades", "Survivorship bias", "High fees"], "The best of many random tries looks good by construction.");
  Q("fin.backtest", 2, "Using a stock's closing price to decide a trade executed at that same day's open is:", ["Look-ahead bias", "Survivorship bias", "Diversification", "Slippage"], "The decision uses information that didn't exist yet.");
  Q("fin.backtest", 2, "Testing a strategy only on companies in today's index suffers from:", ["Survivorship bias", "Look-ahead bias only", "Low volatility", "No bias"], "Companies that failed or were removed are missing, which inflates results.");
  Q("fin.backtest", 3, "The correct use of an out-of-sample period is to:", ["Evaluate the final strategy once, after all tuning is done", "Tune parameters until it looks good", "Train on it first", "Ignore it"], "Tuning on it turns it into training data.");
  Q("fin.backtest", 3, "Which machine-learning idea is backtest overfitting most like?", ["A model that memorizes training data and fails on new data", "Underfitting", "Feature scaling", "Batch normalization"], "Same disease: too many degrees of freedom fitted to one sample of history.");
  Q("fin.backtest", 3, "Walk-forward testing means:", ["Repeatedly fitting on past data and testing on the next unseen slice", "Testing on the training data", "Running the strategy backward in time", "Testing once on all data"], "It mimics how the strategy would actually have been used.");

  /* ---- fin.options ---- */
  Q("fin.options", 1, "A call option gives the holder the right to:", ["Buy the asset at the strike price", "Sell the asset at the strike price", "Receive dividends", "Borrow shares"], "A put is the right to sell.");
  Q("fin.options", 2, "The most an option buyer can lose is:", ["The premium paid", "The strike price", "Unlimited", "Nothing"], "The buyer can simply let the option expire.");
  Q("fin.options", 2, "You own a stock and buy a put on it. You have:", ["Insurance that limits your downside", "Doubled your upside", "Sold the stock", "Removed all costs"], "The put gains value as the stock falls. You pay the premium for the protection.");
  Q("fin.options", 2, "All else equal, higher expected volatility makes options:", ["More expensive", "Cheaper", "Worthless", "Unaffected"], "Bigger swings raise the chance of a large payoff.");
  Q("fin.options", 3, "Time decay means that as expiration approaches, an option's time value:", ["Shrinks", "Grows", "Stays constant", "Becomes negative"], "There is less time for the price to move in the holder's favor.");
  Q("fin.options", 3, "Why is selling (writing) an uncovered call risky?", ["The loss is potentially unlimited if the price soars", "The seller pays the premium", "It can never be profitable", "It requires owning the stock"], "The seller must deliver at the strike however high the price goes.");
  G("fin.options", 2, (r) => { const k = r.pick([50, 100, 150]), s = k + r.pick([-20, -5, 8, 15, 30]), prem = r.pick([3, 5, 8]); const pay = Math.max(0, s - k), v = pay - prem; return { stem: `You buy a call with strike $${k} for a $${prem} premium. At expiration the stock is at $${s}. What is your profit per share?`, opts: N(v, [pay, s - k - prem === v ? -prem - 2 : s - k - prem, pay + prem], (x) => (x < 0 ? "−$" + Math.abs(x) : "$" + x)), expl: `Payoff = max(0, ${s} − ${k}) = $${pay}. Profit = ${pay} − ${prem} = ${v < 0 ? "−$" + Math.abs(v) : "$" + v}.` }; });
  G("fin.options", 2, (r) => { const k = r.pick([40, 80, 120]), s = k + r.pick([-25, -10, -4, 6, 20]), prem = r.pick([2, 4, 6]); const pay = Math.max(0, k - s), v = pay - prem; return { stem: `You buy a put with strike $${k} for a $${prem} premium. At expiration the stock is at $${s}. What is your profit per share?`, opts: N(v, [pay, k - s - prem === v ? -prem - 3 : k - s - prem, pay + prem], (x) => (x < 0 ? "−$" + Math.abs(x) : "$" + x)), expl: `Payoff = max(0, ${k} − ${s}) = $${pay}. Profit = ${pay} − ${prem} = ${v < 0 ? "−$" + Math.abs(v) : "$" + v}.` }; });

  /* ---- fin.riskmgmt ---- */
  Q("fin.riskmgmt", 1, "Position sizing decides:", ["How much capital to put at risk on a single trade", "Which broker to use", "The color of the chart", "The time of day to trade"], "It caps the damage from any one mistake.");
  Q("fin.riskmgmt", 2, "A strategy wins 40% of the time. Average win $300, average loss $100. Its expected value per trade is:", ["+$60", "−$60", "$0", "+$200"], "0.4 × 300 − 0.6 × 100 = 120 − 60 = +$60.");
  Q("fin.riskmgmt", 2, "Loss aversion leads investors to:", ["Hold losing positions too long and sell winners too early", "Trade less often", "Diversify more", "Ignore fees"], "Realizing a loss hurts, so people avoid it.");
  Q("fin.riskmgmt", 2, "Using 3× leverage, a 10% drop in the asset produces roughly:", ["A 30% loss", "A 10% loss", "A 3% loss", "No loss"], "Leverage multiplies losses as well as gains.");
  Q("fin.riskmgmt", 3, "Buying a stock because it has gone up for five straight days and everyone is talking about it reflects:", ["Recency bias and FOMO", "Value investing", "Diversification", "Hedging"], "Chasing recent performance is how people end up buying high.");
  Q("fin.riskmgmt", 3, "Why can a high win rate still lose money?", ["Rare losses can be much larger than the frequent small wins", "Win rate is the only thing that matters", "Brokers confiscate wins", "It can't"], "Expected value depends on the sizes as well as the frequencies.");
  G("fin.riskmgmt", 2, (r) => { const cap = r.pick([5000, 10000, 20000, 50000]), risk = r.pick([0.01, 0.02]), stop = r.pick([1, 2, 4, 5]); const v = Math.floor((cap * risk) / stop); return { stem: `You have ${usd(cap)} and risk ${risk * 100}% of it per trade. Your stop-loss is $${stop} below your entry price. How many shares can you buy?`, opts: N(v, [Math.floor(cap / stop), Math.floor(cap * risk), v * 10]), expl: `Risk budget = ${usd(cap * risk)}. Shares = ${cap * risk} / ${stop} = ${v}.` }; });
  G("fin.riskmgmt", 2, (r) => { const p = r.pick([0.3, 0.4, 0.5, 0.6]), w = r.pick([100, 200, 300]), l = r.pick([100, 150]); const v = p * w - (1 - p) * l; return { stem: `A strategy wins ${p * 100}% of the time with an average win of $${w} and an average loss of $${l}. What is its expected value per trade?`, opts: N(v, [p * w, w - l, -v || 15], (x) => (x < 0 ? "−$" + Math.abs(x).toFixed(0) : "$" + x.toFixed(0))), expl: `${p} × ${w} − ${f2(1 - p)} × ${l} = ${v < 0 ? "−$" + Math.abs(v).toFixed(0) : "$" + v.toFixed(0)}.` }; });

  S("fin.backtest", "The backtest that looked too good", {
    stim: `<p>A colleague shows you this result for a moving-average strategy on tech stocks:</p>` + T(["Item", "Detail"], [["Universe", "The 50 largest tech companies in today's index"], ["Period", "2012 to 2024"], ["Parameters", "Best of 400 short/long window combinations"], ["Costs", "None modeled"], ["Signal timing", "Uses each day's close to trade at that day's open"], ["Result", "Annual return 31%, Sharpe 3.2"]], "Backtest summary"),
    parts: [
      ["fin.backtest", 2, "Choosing the universe from today's index introduces:", ["Survivorship bias", "Look-ahead bias in prices", "Transaction costs", "Diversification"], "Only the winners that grew large enough to be in the index today are included."],
      ["fin.backtest", 2, "Picking the best of 400 parameter combinations mainly risks:", ["Overfitting to noise", "Too little data", "Higher fees", "Lower volatility"], "The best of 400 tries will look good even if no combination has real edge."],
      ["fin.backtest", 2, "The signal timing has which flaw?", ["Look-ahead bias: it trades on information from later in the day", "Survivorship bias", "It is too slow", "None"], "The close is not known at the open."],
      ["fin.strategies", 2, "How would realistic costs most likely change the result?", ["Lower it, possibly a lot, since moving-average strategies trade often", "Raise it", "No change", "Make the Sharpe infinite"], "Spreads and slippage scale with turnover."],
      ["fin.backtest", 3, "What is the most honest next step?", ["Fix the biases, then test once on a held-out period with a point-in-time universe and costs", "Trade it with leverage", "Try 4,000 more parameter combinations", "Report the Sharpe as is"], "Remove the known biases first; then judge on data the strategy has never seen."],
    ],
  });
  S("fin.costs", "Two investors, thirty years", (r) => {
    const m = r.pick([300, 500]), g = r.pick([0.06, 0.07]), fa = 0.001, fb = r.pick([0.015, 0.02]), yrs = 30;
    const fv = (rate) => { let v = 0; for (let y = 0; y < yrs; y++) v = (v + m * 12) * (1 + rate); return v; };
    const A = fv(g - fa), B = fv(g - fb), put = m * 12 * yrs, pts = (rate) => { const o = []; let v = 0; for (let y = 0; y < yrs; y++) { v = (v + m * 12) * (1 + rate); if ((y + 1) % 5 === 0) o.push(Math.round(v / 1000)); } return o; };
    return {
      stim: `<p>Two investors each put ${usd(m)} a month into funds that earn ${g * 100}% a year before fees, for ${yrs} years.</p>` + T(["", "Fund fee", "Balance after 30 years"], [["Investor A (index fund)", "0.1%", usd(A)], ["Investor B (active fund)", fb * 100 + "%", usd(B)]], "Outcome") + V.line({ labels: ["5", "10", "15", "20", "25", "30"], series: [{ name: "A: 0.1% fee", pts: pts(g - fa) }, { name: `B: ${fb * 100}% fee`, pts: pts(g - fb) }], w: 460, h: 210, yl: "$ thousands", title: "Balance by year" }),
      parts: [
        ["fin.tvm", 1, "How much did each investor contribute in total?", N(put, [m * yrs, put * 2, A], usd), `${usd(m)} × 12 × ${yrs} = ${usd(put)}.`],
        ["fin.costs", 2, "How much more does A end up with?", N(A - B, [A, B, (A - B) / 10], usd), `${usd(A)} − ${usd(B)} = ${usd(A - B)}.`],
        ["fin.costs", 2, "By what share is B's final balance smaller?", N(1 - B / A, [fb, fb * yrs, 0.5], (x) => (x * 100).toFixed(0) + "%"), `1 − ${usd(B)} / ${usd(A)} ≈ ${((1 - B / A) * 100).toFixed(0)}%. A fee that sounds small compounds into a large gap.`],
        ["fin.costs", 3, "For B's fund to be worth its fee, it would need to:", ["Beat the index by more than the fee difference, consistently, for 30 years", "Match the index", "Beat the index in one year", "Trade more often"], "It starts each year behind by the fee gap and has to make that up before adding anything."],
      ],
    };
  });
  S("fin.diversify", "Does adding a second asset help?", (r) => {
    const sa = 20, sb = r.pick([8, 10]), rho = r.pick([-0.2, 0, 0.3]), w = 0.6, ra = 9, rb = 4;
    const vol = Math.sqrt((w * sa) ** 2 + ((1 - w) * sb) ** 2 + 2 * w * (1 - w) * sa * sb * rho), ret = w * ra + (1 - w) * rb, wavg = w * sa + (1 - w) * sb;
    return {
      stim: T(["Asset", "Expected return", "Volatility"], [["Stock fund", ra + "%", sa + "%"], ["Bond fund", rb + "%", sb + "%"]], `Correlation between them: ${rho}`) + `<p>You hold 60% stocks and 40% bonds.</p>`,
      parts: [
        ["fin.diversify", 1, "What is the portfolio's expected return?", N(ret, [(ra + rb) / 2, ra, rb], (x) => x.toFixed(1) + "%"), `0.6 × ${ra}% + 0.4 × ${rb}% = ${ret.toFixed(1)}%.`],
        ["fin.diversify", 2, `The weighted average of the two volatilities is ${wavg.toFixed(1)}%. The portfolio's actual volatility is:`, [`Lower: about ${vol.toFixed(1)}%`, `Exactly ${wavg.toFixed(1)}%`, `Higher: about ${(wavg * 1.2).toFixed(1)}%`, `${sa}%, the same as stocks`], `With correlation ${rho}, √((0.6·${sa})² + (0.4·${sb})² + 2·0.6·0.4·${sa}·${sb}·${rho}) ≈ ${vol.toFixed(1)}%.`],
        ["fin.diversify", 2, "At what correlation would the portfolio's volatility equal the weighted average?", ["+1", "0", "−1", "0.5"], "Only perfectly correlated assets give no risk reduction."],
        ["fin.capm", 3, `With a 2% risk-free rate, the 100% stock fund has a Sharpe ratio of ${((ra - 2) / sa).toFixed(2)}. The 60/40 portfolio's is about:`, N((ret - 2) / vol, [(ra - 2) / sa, ret / wavg / 2, 1.5], f2), `(${ret.toFixed(1)} − 2) / ${vol.toFixed(1)} = ${((ret - 2) / vol).toFixed(2)}: lower return, but more return per unit of risk.`],
      ],
    };
  });
  S("fin.markets", "Reading an order book", (r) => {
    const mid = r.pick([50, 80, 120]), sp = r.pick([0.04, 0.1, 0.2]), bid = +(mid - sp / 2).toFixed(2), ask = +(mid + sp / 2).toFixed(2), q = r.pick([100, 200, 500]);
    return {
      stim: T(["Bids (buyers)", "Size", "Asks (sellers)", "Size"], [[bid.toFixed(2), 300, ask.toFixed(2), 200], [(bid - 0.05).toFixed(2), 500, (ask + 0.05).toFixed(2), 400], [(bid - 0.1).toFixed(2), 900, (ask + 0.1).toFixed(2), 800]], "Order book for ticker XYZ"),
      parts: [
        ["fin.markets", 1, "What is the bid-ask spread?", N(+(ask - bid).toFixed(2), [bid, ask, +((ask - bid) / 2).toFixed(2)], (x) => "$" + x.toFixed(2)), `${ask.toFixed(2)} − ${bid.toFixed(2)} = $${(ask - bid).toFixed(2)}.`],
        ["fin.markets", 2, "A market order to buy 100 shares fills at:", N(ask, [bid, mid, +(ask + 0.05).toFixed(2)], (x) => "$" + x.toFixed(2)), "Buyers pay the best ask. There are 200 shares available there."],
        ["fin.markets", 2, `You buy ${q} shares at the ask and sell them immediately at the bid, with no price change. Your loss is:`, N(q * (ask - bid), [q * ask, (ask - bid), q * (ask - bid) / 2], (x) => "$" + x.toFixed(2)), `${q} × $${(ask - bid).toFixed(2)} = $${(q * (ask - bid)).toFixed(2)}: the round-trip cost of the spread.`],
        ["fin.markets", 3, "A market order to buy 500 shares would:", ["Fill 200 at the best ask and the rest at higher prices (slippage)", "Fill entirely at the best ask", "Be rejected", "Fill at the bid"], "It walks up the book: only 200 shares are offered at the best price."],
        ["fin.markets", 2, `To buy at $${bid.toFixed(2)} instead, you would place:`, ["A limit order at that price, accepting that it may not fill", "A market order", "A stop order", "A short sale"], "A limit order sets the price but gives up certainty of execution."],
      ],
    };
  });
})();
