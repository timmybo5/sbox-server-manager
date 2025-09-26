import { Player } from '@components/playerlist/PlayerList';

/* Format to match
    'IsHost: True',
    'Socket 1: SteamIdSocket - steamid:90274654284276744',
    'Socket 2: SteamIpSocket - [::6835:8a52:902:0]:0',
    '1: Connected 9c024e60-6c7b-4e99-a153-f7b24b0713c3 76561198184584611 unknown [592/270]',
    '2: Connected 6f68c7f4-feac-49f9-9113-5abff1df94a9 76561198020804264 unknown [571/263]',
    'PLAYERS ----------',
    '9c024e60-6c7b-4e99-a153-f7b24b0713c3  76561198184584611       Connected               Gucci ????              9/25/2025 8:04:04 AM +00:00',
    '6f68c7f4-feac-49f9-9113-5abff1df94a9  76561198020804264       Connected               Zombie Extinguisher             9/25/2025 8:04:08 AM +00:00'
*/

const playerListRegex =
  /^(\S+)\s+(\d{17}|[0-9a-fA-F-]{36})\s+\S+\s+(.+?)\s+\d{1,2}\/\d{1,2}\/\d{4}/;
const parseStatusPlayerList = (data: string[]): Player[] => {
  //console.log('DEBUG', { data });
  const players: Player[] = [];

  for (let i = 0; i < data.length; i++) {
    const line = data[i];
    const matches = line.match(playerListRegex);
    if (!matches) continue;

    const id = matches[1];
    const steamID = matches[2];
    const name = matches[3];

    players.push({
      id,
      ping: '-',
      steamID,
      name,
    });
  }

  return players;
};

export default parseStatusPlayerList;
