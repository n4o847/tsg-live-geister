import React, { useState, useEffect } from 'react';
import './App.css';
import io from 'socket.io-client';
import { range } from 'lodash';

let socket = null;

function App() {
  const [state, setState] = useState("home");
  const [myBoard, setMyBoard] = useState(() => range(6).map((i) => range(6).map((j) => 0)));
  const [opBoard, setOpBoard] = useState(() => range(6).map((i) => range(6).map((j) => 0)));
  const [selected, setSelected] = useState([]);
  const [myTurn, setMyTurn] = useState(false);

  useEffect(() => {
    socket = io();
    socket.on("match", startPlaying);
    socket.on("move", moveGhost);
    socket.on("hoge", (a) => console.log(a));
  }, []);

  const startSetting = () => {
    setState("setting");
    setMyBoard(board => {
      board[4] = [0, 1, 1, 1, 1, 0];
      board[5] = [0, 2, 2, 2, 2, 0];
      return board;
    });
    setOpBoard(board => {
      board[4] = [0, 1, 1, 1, 1, 0];
      board[5] = [0, 2, 2, 2, 2, 0];
      return board;
    });
  };

  const startWaiting = () => {
    setState("waiting");
    socket.emit("wait", { board: myBoard });
  };

  const startPlaying = ({ turn, board }) => {
    setState("playing");
    setOpBoard(board);
    setMyTurn(turn);
  };

  const ViewHome = () => {
    return (
      <div>
        <h1>Geister</h1>
        <button onClick={() => startSetting()}>Play</button>
      </div>
    );
  };

  const selectCell = (i, j) => {
    if (state === "setting") {
      if (myBoard[i][j] === 1 || myBoard[i][j] === 2) {
        if (!selected.length) {
          setSelected([i, j]);
        } else {
          const [si, sj] = selected;
          const [ti, tj] = [i, j];
          setMyBoard((board) => board.map((row, i) => (
            row.map((cell, j) => (
              i === si && j === sj ? myBoard[ti][tj] :
                i === ti && j === tj ? myBoard[si][sj] :
                  cell
            ))
          )));
          setSelected([]);
        }
      }
    }
    if (state === "playing" && myTurn) {
      if (!selected.length) {
        if (myBoard[i][j] === 1 || myBoard[i][j] === 2) {
          setSelected([i, j]);
        }
      } else {
        const [si, sj] = selected;
        const [ti, tj] = [i, j];
        if (Math.abs(si - ti) + Math.abs(sj - tj) === 1) {
          setMyBoard((board) => {
            const newMyBoard = board.map((row, i) => (
              row.map((cell, j) => (
                i === si && j === sj ? 0 :
                  i === ti && j === tj ? myBoard[si][sj] :
                    cell
              ))
            ));
            return newMyBoard;
          });
          setOpBoard((board) => {
            const newOpBoard = board.map((row, i) => (
              row.map((cell, j) => (
                5 - i === ti && 5 - j === tj ? 0 : cell
              ))
            ));
            return newOpBoard;
          });
          setMyTurn(false);
          socket.emit("move", { si, sj, ti, tj });
        }
        setSelected([]);
      }
    }
  };

  const moveGhost = ({ si, sj, ti, tj }) => {
    setMyBoard((board) => {
      const newMyBoard = board.map((row, i) => (
        row.map((cell, j) => (
          5 - i === ti && 5 - j === tj ? 0 : cell
        ))
      ));
      return newMyBoard;
    });
    setOpBoard((board) => {
      const newOpBoard = board.map((row, i) => (
        row.map((cell, j) => (
          i === si && j === sj ? 0 :
            i === ti && j === tj ? myBoard[si][sj] :
              cell
        ))
      ));
      return newOpBoard;
    });
    setMyTurn(true);
  };

  const ViewBoard = () => {
    return (
      <div>
        {state === "playing" && (
          myTurn ? "あなたのターン" : "あいてのターン"
        )}
        <div className="board">
          {
            myBoard.map((row, i) => (
              <div className="row" key={i}>
                {
                  row.map((cell, j) => (
                    <div
                      className={`cell ${selected[0] === i && selected[1] === j ? "selected" : ""}`}
                      key={j}
                      onClick={() => selectCell(i, j)}
                    >
                      <div className={`geister geister-${cell || (opBoard[5 - i][5 - j] ? 3 : 0)}`}></div>
                    </div>
                  ))
                }
              </div>
            ))
          }
        </div>
        {state === "setting" && (
          <button onClick={() => startWaiting()}>Start Matching</button>
        )}
      </div>
    );
  };

  return (
    <div className="App">
      <header className="App-header">
        {state === "home" && (
          <ViewHome />
        )}
        {state === "setting" && (
          <ViewBoard />
        )}
        {state === "waiting" && (
          <div>Waiting...</div>
        )}
        {state === "playing" && (
          <ViewBoard />
        )}
      </header>
    </div>
  );
}

export default App;
