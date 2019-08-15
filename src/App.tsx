import React from 'react';

import 'react-bulma-components/dist/react-bulma-components.min.css';
import './App.scss';

import Game from './components/game';

const App: React.FC = () => {
  return (
    <div className="App">
      <Game />
    </div>
  );
}

export default App;
