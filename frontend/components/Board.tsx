interface Props {
  turn: number;
  data: number[];
  handlePitClick: (pitIndex: number) => void;
  isReversed?: boolean;
  selectedPit: number | null;
}

const Board = ({
  turn,
  data,
  handlePitClick,
  isReversed,
  selectedPit,
}: Props) => {
  const StoreLeft = data[0];
  const StoreRight = data[7];
  const PitPlayer1 = data.slice(1, 7);
  const PitPlayer2 = data.slice(8, 14);

  const renderPitRow = (
    pits: number[],
    startIndex: number,
    color: string,
    reverse: boolean,
    isPlayerSide: boolean
  ) => {
    const displayPits = reverse ? [...pits].reverse() : pits;
    return (
      <div className="pit-row">
        {displayPits.map((stone, index) => {
          const idx = reverse
            ? startIndex + (pits.length - 1 - index)
            : startIndex + index;

          const isTurn = isReversed ? turn === 1 : turn === 0;
          const canClick = isTurn && isPlayerSide && stone > 0;

          return (
            <div
              key={idx}
              className={`pit ${color} ${
                idx === selectedPit ? "highlight" : ""
              }`}
              onClick={() => {
                if (canClick) {
                  handlePitClick(idx);
                }
              }}
            >
              {stone}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div>
      <div className="turn-indicator">
        {(isReversed ? turn === 1 : turn === 0) ? (
          <h2 className="your-turn">あなたのターンです</h2>
        ) : (
          <h2 className="opponent-turn">相手のターンです</h2>
        )}
      </div>
      <div className="board-row">
        <div className="store">{isReversed ? StoreRight : StoreLeft}</div>
        <div className="pits">
          {isReversed ? (
            <>
              {renderPitRow(PitPlayer1, 1, "blue", true, false)}
              {renderPitRow(PitPlayer2, 8, "red", false, true)}
            </>
          ) : (
            <>
              {renderPitRow(PitPlayer2, 8, "red", true, false)}
              {renderPitRow(PitPlayer1, 1, "blue", false, true)}
            </>
          )}
        </div>
        <div className="store">{isReversed ? StoreLeft : StoreRight}</div>
      </div>
    </div>
  );
};

export default Board;
