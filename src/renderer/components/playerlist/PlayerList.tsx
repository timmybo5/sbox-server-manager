import { dataSelector } from '@renderer/store/DataSlice';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import './PlayerList.scss';

export type Player = {
  id: string;
  ping: string;
  steamID: string;
  name: string;
};

const PlayerList = () => {
  const { players } = useSelector(dataSelector);
  const [isKicking, setKicking] = useState<boolean>(false);

  const kickPlayer = (id: string) => {
    const windowAny: any = window;
    windowAny.electronAPI.kickPlayer(id);
  };

  useEffect(() => {
    setKicking(false);
  }, [players]);

  return (
    <div id='playerList'>
      <div className='header'>
        <span className='id'>ID</span>
        <span className='ping'>Ping</span>
        <span className='steamID'>SteamID</span>
        <span className='name'>Name</span>
        <span className='count'>Players ({players.length})</span>
      </div>
      <div className='scrollWrapper'>
        <div className='players'>
          {(players as Player[]).map((player, key) => (
            <div key={key} className='player'>
              <span className='id'>{player.id}</span>
              <span className='ping'>{player.ping}</span>
              <span className='steamID'>{player.steamID}</span>
              <span className='name'>{player.name}</span>
              <button
                disabled={isKicking}
                className={'kick '}
                onClick={() => {
                  setKicking(true);
                  kickPlayer(player.id);
                }}
              >
                kick
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlayerList;
