import { calculateInvestmentResults } from "../util/investment"

export default function Results({ userInput }) {
  const resultsData = calculateInvestmentResults(...userInput)

  console.log();
  


  return <p>Results...</p>
}
