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

  useEffect(() => {
    socket = io();
    socket.on("match", startPlaying);
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

  const startPlaying = ({ board }) => {
    setState("playing");
    setOpBoard(board);
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
  };

  const ViewBoard = () => {
    return (
      <div>
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
          <div>ここにプレイ画面</div>
        )}
      </header>
    </div>
  );
}

export default App;
