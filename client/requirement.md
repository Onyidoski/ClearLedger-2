📄 Product Requirements Document (PRD)
Product Name (Working Title)
ClearLedger


Product Type
Crypto Wallet Analytics & Profit/Loss (P/L) Tracking Web Application
Author
Onyedika
Date
15/10/25

1. 📌 Overview
ClearLedger is a web-based crypto wallet analytics platform that helps users understand their actual financial performance in crypto by analyzing on-chain transaction data. The product calculates realized and unrealized profit/loss (P/L), tracks portfolio performance, and generates data-driven insights based on user behavior — without providing investment advice.
Users interact with the platform by entering a public wallet address. No private keys, exchange logins, or custody of funds are required.

2. 🎯 Problem Statement
Most crypto users struggle to accurately answer a simple question:
“Am I making money or losing money?”
Key problems:
Assets are spread across multiple tokens and wallets


No clear view of profit/loss per token


Gas fees and hidden costs reduce real profits


Existing tools are either too complex or focused on trading signals rather than performance clarity



3. 💡 Solution
ClearLedger converts raw blockchain transaction data into:
Clear portfolio summaries


Token-level P/L calculations


Historical performance metrics


Personalized behavioral insights


The platform focuses on transparency and education, not predictions or trading advice.

4. 👥 Target Users
Primary Users
Retail crypto traders


DeFi users


Long-term crypto holders


Secondary Users
Freelancers and professionals earning in crypto


Crypto tax-conscious users


Crypto communities and DAO members



5. 🎯 Goals & Success Metrics
Product Goals
Provide accurate and understandable P/L tracking


Help users identify profitable vs unprofitable behaviors


Build trust through transparency and simplicity


Success Metrics (KPIs)
Monthly Active Users (MAU)


Free → Paid conversion rate


Average session duration


Churn rate


Wallets analyzed per user



6. 🧩 Core Features (MVP)
6.1 Wallet Input & Validation
Description
Users enter a public wallet address


System validates address format and supported network


Requirements
Support Ethereum mainnet (Phase 1)


Show error for unsupported or invalid addresses



6.2 Portfolio Overview Dashboard
Description
 High-level summary of wallet performance
Metrics Displayed
Current portfolio value (USD)


Total invested amount


Total P/L (USD and %)


Total gas fees paid


Best and worst performing tokens



6.3 Transaction History Processing
Description
Fetch and parse historical transactions


Identify buy, sell, transfer, and swap actions


Requirements
Map transaction timestamps to historical token prices


Handle partial sells and multiple buys



6.4 Profit & Loss (P/L) Calculation
Description
 Calculate realized and unrealized P/L
Definitions
Realized P/L: Profit or loss from completed trades


Unrealized P/L: Profit or loss on current holdings


Method
FIFO (First-In-First-Out) accounting (default)



6.5 Token-Level Performance
Description
 Detailed breakdown per token
Data Shown
Total bought vs sold


Average buy price


Current price


P/L per token


Holding duration



6.6 Smart Insights Engine
Description
 Rule-based insights generated from user behavior
Examples
“You are profitable in 65% of your trades.”


“You lose more on short-term holds than long-term holds.”


“Gas fees have reduced your profits by 18%.”


Note
 No buy/sell recommendations.

7. 🔐 Security & Privacy
No private keys or signing requests


Read-only blockchain access


Wallet addresses stored hashed (optional)


GDPR-compliant data handling



8. 💰 Monetization
Freemium Model
Free Tier
Portfolio overview


Total P/L


Premium Tier
Token-level P/L


Smart insights


CSV export


Wallet comparison


Tax summary


Pricing: $5–$20/month

9. ⚠️ Constraints & Assumptions
Constraints
Dependent on third-party blockchain APIs


Historical price accuracy may vary by source


Assumptions
Users are willing to pay for clarity and insights


Ethereum users are the initial market



10. 🛠 Technical Requirements
Frontend
React / Next.js


Chart.js or TradingView widgets


Backend
Node.js / Express


Blockchain API (Etherscan, Alchemy, Moralis)


Price data API (CoinGecko)


Database
PostgreSQL or MongoDB



11. 🚀 Non-Goals (Out of Scope for MVP)
Trading execution


Wallet connection or custody


Investment advice or predictions


Automated trading bots



12. 📅 Roadmap
Phase 1 (MVP)
ETH wallet tracking


P/L calculation


Portfolio dashboard


Phase 2
Multi-wallet support


Alerts


Wallet comparison


Phase 3
Multi-chain support


Advanced insights


Tax integrations



13. ⚖️ Legal & Compliance
Clear disclaimer: “Not financial advice”


Educational and analytical use only


No investment recommendations



14. ✅ Acceptance Criteria (MVP)
User can input ETH wallet address


Portfolio loads within 5 seconds


P/L calculations are accurate within API tolerance


Dashboard renders correctly on mobile and desktop



15. 📎 Appendix
Key Terms
P/L: Profit / Loss


FIFO: First In, First Out


On-chain: Data recorded on the blockchain





