import React, { useState, useEffect } from 'react';

const SUITS = ['♠', '♥', '♦', '♣'];
const VALUES = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2'];

const DaifugoGame = () => {
  const [deck, setDeck] = useState([]);
  const [players, setPlayers] = useState([
    { id: 1, name: 'Player 1', hand: [] },
    { id: 2, name: 'Player 2', hand: [] },
    { id: 3, name: 'Player 3', hand: [] },
    { id: 4, name: 'Player 4', hand: [] },
  ]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [playedCards, setPlayedCards] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const newDeck = createDeck();
    const shuffledDeck = shuffleDeck(newDeck);
    dealCards(shuffledDeck);
  };

  const createDeck = () => {
    return SUITS.flatMap(suit => VALUES.map(value => ({ suit, value })));
  };

  const shuffleDeck = (deck) => {
    return deck.sort(() => Math.random() - 0.5);
  };

  const dealCards = (deck) => {
    const newPlayers = [...players];
    deck.forEach((card, index) => {
      const playerIndex = index % players.length;
      newPlayers[playerIndex].hand.push(card);
    });
    setPlayers(newPlayers);
  };

  const handleCardSelect = (card) => {
    const index = selectedCards.findIndex(c => c.suit === card.suit && c.value === card.value);
    if (index === -1) {
      setSelectedCards([...selectedCards, card]);
    } else {
      const newSelectedCards = [...selectedCards];
      newSelectedCards.splice(index, 1);
      setSelectedCards(newSelectedCards);
    }
  };

  const handlePlayCards = () => {
    if (isValidPlay(selectedCards)) {
      const newPlayers = [...players];
      const currentPlayer = newPlayers[currentPlayerIndex];
      currentPlayer.hand = currentPlayer.hand.filter(card => 
        !selectedCards.some(sc => sc.suit === card.suit && sc.value === card.value)
      );
      setPlayers(newPlayers);
      setPlayedCards(selectedCards);
      setSelectedCards([]);
      setCurrentPlayerIndex((currentPlayerIndex + 1) % players.length);
    } else {
      alert('Invalid play!');
    }
  };

  const isValidPlay = (cards) => {
    // This is a simplified validation. In a real game, you'd need more complex rules.
    if (playedCards.length === 0) return true;
    if (cards.length !== playedCards.length) return false;
    const playedValue = VALUES.indexOf(playedCards[0].value);
    const selectedValue = VALUES.indexOf(cards[0].value);
    return selectedValue > playedValue;
  };

  const renderCard = (card) => {
    const isSelected = selectedCards.some(c => c.suit === card.suit && c.value === card.value);
    return (
      <div 
        key={`${card.suit}${card.value}`} 
        className={`inline-block m-1 p-2 border rounded cursor-pointer ${isSelected ? 'bg-blue-200' : 'bg-white'}`}
        onClick={() => handleCardSelect(card)}
      >
        {card.value}{card.suit}
      </div>
    );
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Daifugo Game</h1>
      <div className="mb-4">
        <h2 className="text-xl">Current Player: {players[currentPlayerIndex].name}</h2>
        <div className="mt-2">
          {players[currentPlayerIndex].hand.map(renderCard)}
        </div>
        <button 
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={handlePlayCards}
        >
          Play Selected Cards
        </button>
      </div>
      <div className="mb-4">
        <h2 className="text-xl">Played Cards:</h2>
        <div className="mt-2">
          {playedCards.map(renderCard)}
        </div>
      </div>
      <div>
        <h2 className="text-xl">All Players:</h2>
        {players.map(player => (
          <div key={player.id} className="mt-2">
            {player.name}: {player.hand.length} cards
          </div>
        ))}
      </div>
    </div>
  );
};

export default DaifugoGame;
