import { useGameState } from '../hooks/useGameState';
import ProgressBar from '../components/ProgressBar';
import ModeSelect from '../screens/ModeSelect';
import Glossary from '../screens/Glossary';
import Deal from '../screens/Deal';
import Prioritize from '../screens/Prioritize';
import Want from '../screens/Want';
import MeetPartner from '../screens/MeetPartner';
import Negotiate from '../screens/Negotiate';
import Resolution from '../screens/Resolution';
import Debrief from '../screens/Debrief';
import Summary from '../screens/Summary';

const PHASE_LABELS: Record<string, string> = {
  "glossary": "Overview",
  "deal": "Your Deal",
  "prioritize": "Prioritize",
  "want": "What You Want",
  "meet-partner": "Meet Partner",
  "negotiate": "Negotiate",
  "resolution": "Resolution",
  "debrief": "Reflect",
  "summary": "Summary",
};

const Index = () => {
  const game = useGameState();

  const renderScreen = () => {
    switch (game.phase) {
      case "mode-select":
        return (
          <ModeSelect
            deckSize={game.deckSize}
            setDeckSize={game.setDeckSize}
            onStart={() => {
              game.setPhase("glossary");
            }}
          />
        );
      case "glossary":
        return (
          <Glossary
            deckSize={game.deckSize}
            onContinue={() => {
              game.dealCards();
            }}
          />
        );
      case "deal":
        return (
          <Deal
            playerHand={game.playerHand}
            onContinue={() => game.setPhase("prioritize")}
          />
        );
      case "prioritize":
        return (
          <Prioritize
            playerHand={game.playerHand}
            playerTop2={game.playerTop2}
            setPlayerTop2={game.setPlayerTop2}
            playerTop2Reason={game.playerTop2Reason}
            setPlayerTop2Reason={game.setPlayerTop2Reason}
            onContinue={() => game.setPhase("want")}
          />
        );
      case "want":
        return (
          <Want
            playerHand={game.playerHand}
            playerTop2={game.playerTop2}
            deckSize={game.deckSize}
            playerWants={game.playerWants}
            setPlayerWants={game.setPlayerWants}
            playerWantReason={game.playerWantReason}
            setPlayerWantReason={game.setPlayerWantReason}
            onContinue={() => game.setPhase("meet-partner")}
          />
        );
      case "meet-partner":
        return (
          <MeetPartner
            npcProfile={game.npcProfile}
            npcHand={game.npcHand}
            onContinue={() => game.setPhase("negotiate")}
          />
        );
      case "negotiate":
        return (
          <Negotiate
            playerHand={game.playerHand}
            playerTop2={game.playerTop2}
            playerWants={game.playerWants}
            npcProfile={game.npcProfile}
            npcHand={game.npcHand}
            npcTop2={game.npcTop2}
            npcWants={game.npcWants}
            evaluateOffer={game.evaluateOffer}
            addNegotiationRound={game.addNegotiationRound}
            resolveTradeSuccess={game.resolveTradeSuccess}
            resolveTradePartial={game.resolveTradePartial}
            resolveTradeFailed={game.resolveTradeFailed}
            onContinue={() => game.setPhase("resolution")}
          />
        );
      case "resolution":
        return (
          <Resolution
            playerHand={game.playerHand}
            npcHand={game.npcHand}
            finalPlayerHand={game.finalPlayerHand}
            finalNpcHand={game.finalNpcHand}
            npcProfile={game.npcProfile}
            tradeOutcome={game.tradeOutcome}
            cardsLost={game.cardsLost}
            cardsGained={game.cardsGained}
            onContinue={() => game.setPhase("debrief")}
          />
        );
      case "debrief":
        return (
          <Debrief
            playerHand={game.playerHand}
            debriefAnswers={game.debriefAnswers}
            setDebriefAnswers={game.setDebriefAnswers}
            onContinue={() => game.setPhase("summary")}
          />
        );
      case "summary":
        return (
          <Summary
            playerHand={game.playerHand}
            playerTop2={game.playerTop2}
            playerWants={game.playerWants}
            finalPlayerHand={game.finalPlayerHand.length ? game.finalPlayerHand : game.playerHand}
            npcProfile={game.npcProfile}
            npcTop2={game.npcTop2}
            tradeOutcome={game.tradeOutcome}
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
    </div>
  );
};

export default Index;
