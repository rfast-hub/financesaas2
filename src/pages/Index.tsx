import MarketStats from "@/components/MarketStats";
import CryptoChart from "@/components/CryptoChart";
import PortfolioCard from "@/components/PortfolioCard";
import CryptoList from "@/components/CryptoList";
import AIPredictions from "@/components/AIPredictions";
import SentimentAnalysis from "@/components/SentimentAnalysis";
import PriceAlerts from "@/components/PriceAlerts";

const Index = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Crypto Dashboard</h1>
          <p className="text-muted-foreground">Welcome back to your portfolio</p>
        </header>
        
        <MarketStats />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <CryptoChart />
          </div>
          <div>
            <PortfolioCard />
          </div>
        </div>
        
        <div className="mb-8">
          <PriceAlerts />
        </div>
        
        <SentimentAnalysis />
        <AIPredictions />
        <CryptoList />
      </div>
    </div>
  );
};

export default Index;