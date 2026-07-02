import { useState, useEffect } from 'react';
import { useGameState } from '../hooks/useGameState';
import ProgressBar from '../components/ProgressBar';
import ModeSelect from '../screens/ModeSelect';
import Glossary from '../screens/Glossary';
import Deal from '../screens/Deal';
import MeetPartners from '../screens/MeetPartners';
import Trade from '../screens/Trade';
import Sort from '../screens/Sort';
import Debrief from '../screens/Debrief';
import Summary from '../screens/Summary';
import ResearcherView from '../screens/ResearcherView';

const PHASE_LABELS: Record<string, string> = {
  "glossary": "Overview",
  "deal": "Your Hand",
  "meet-partners": "Your Partners",
  "trade": "Trade",
  "sort": "Prioritize",
  "debrief": "Reflect",
  "summary": "Summary",
};

const Index = () => {
  const game = useGameState();
  const [showResearcher, setShowResearcher] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'R' || e.key === 'r')) {
        e.preventDefault();
        setShowResearcher(prev => !prev);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const renderScreen = () => {
    switch (game.phase) {
      case "mode-select":
        return (
          <ModeSelect
            deckSize={game.deckSize}
            setDeckSize={game.setDeckSize}
            onStart={() => game.advancePhase("glossary")}
          />
        );
      case "glossary":
        return <Glossary deckSize={game.deckSize} onContinue={() => game.dealCards()} />;
      case "deal":
        return <Deal playerHand={game.playerHand} onContinue={() => game.advancePhase("meet-partners")} />;
      case "meet-partners":
        return (
          <MeetPartners
            partners={game.partners}
            partnerProfiles={game.partnerProfiles}
            onContinue={() => game.advancePhase("trade")}
          />
        );
      case "trade":
        return (
          <Trade
            playerHand={game.playerHand}
            partners={game.partners}
            partnerProfiles={game.partnerProfiles}
            makeOffer={game.makeOffer}
            canFinishTrading={game.canFinishTrading}
            partnerMaxedOut={game.partnerMaxedOut}
            onContinue={() => game.advancePhase("sort")}
          />
        );
      case "sort":
        return (
          <Sort
            playerHand={game.playerHand}
            topN={game.topN}
            finalTop={game.finalTop}
            toggleTop={game.toggleTop}
            onContinue={() => game.advancePhase("debrief")}
          />
        );
      case "debrief":
        return (
          <Debrief
            dealtPlayerHand={game.dealtPlayerHand}
            debriefAnswers={game.debriefAnswers}
            setDebriefAnswers={game.setDebriefAnswers}
            onContinue={() => game.advancePhase("summary")}
          />
        );
      case "summary":
        return (
          <Summary
            dealtPlayerHand={game.dealtPlayerHand}
            finalPlayerHand={game.playerHand}
            finalTop={game.finalTop}
            topN={game.topN}
            partnerProfiles={game.partnerProfiles}
            trades={game.trades}
            debriefAnswers={game.debriefAnswers}
            onExport={game.exportData}
            onPlayAgain={game.resetGame}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {game.phase !== "mode-select" && (
        <ProgressBar
          currentPhase={game.phaseIndex}
          totalPhases={game.totalPhases}
          phaseLabel={PHASE_LABELS[game.phase] || game.phase}
        />
      )}
      {renderScreen()}
      {showResearcher && (
        <ResearcherView
          phase={game.phase}
          phaseTiming={game.phaseTiming}
          phaseStartTime={game.phaseStartTime}
          deckSize={game.deckSize}
          partners={game.partners}
          partnerProfiles={game.partnerProfiles}
          playerHand={game.playerHand}
          dealtPlayerHand={game.dealtPlayerHand}
          trades={game.trades}
          onClose={() => setShowResearcher(false)}
        />
      )}
    </div>
  );
};

export default Index;
