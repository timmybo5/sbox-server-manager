import { Player } from '@components/playerlist/PlayerList';

/* Format to match
const data = "id     time ping loss      state   rate adr name \n \
   1      BOT    0    0     active      0 'Seymour' \n \
   2      BOT    0    0     active      0 'Clancy' \n \
   3      BOT    0    0     active      0 'Kearney' \n \
   4      BOT    0    0     active      0 'Patty' \n \
   5      BOT    0    0     active      0 'Selma' \n \
   6    00:05   16    0     active  80000 [U:1:60538536]:0 'Zombie Extinguisher' \n \
#end"
*/

const playerListRegex =
  /id[\s]+time[\s]+ping[\s]+loss[\s]+state[\s]+rate[\s]+adr[\s]+name([\S\s]*?)#end$/gm;
const parseStatusPlayerList = (data: string): Player[] => {
  const matches = data.match(playerListRegex);

  // Split match per newline
  const newLineSplit = matches[0].split(/\r?\n/).filter((e) => e.trim());
  const players: Player[] = [];

  newLineSplit.forEach((match) => {
    // Removes all whitespace characters from the line
    const stringOnlyArr = match.split(/(\s+)/).filter((e) => e.trim());
    const firstVal = stringOnlyArr[0];
    let [id, ping, steamID, name] = ['', '', '', ''];

    // Skip start and end
    if (firstVal != 'id' && firstVal != '#end') {
      id = stringOnlyArr[0];
      ping = stringOnlyArr[2];

      if (stringOnlyArr[1] == 'BOT') {
        steamID = 'BOT';

        // Slice in case name had spaces
        name = stringOnlyArr.slice(6).join(' ');
      } else {
        steamID = stringOnlyArr[6];
        name = stringOnlyArr.slice(7).join(' ');
      }

      players.push({
        id,
        ping,
        steamID,

        // Remove quotes
        name: name.substring(1, name.length - 1),
      });
    }

    //console.log(`->id:${id} steamID:${steamID} name:${name}`);
  });
  return players;
};

export default parseStatusPlayerList;
