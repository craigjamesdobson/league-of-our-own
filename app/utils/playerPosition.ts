import { PlayerPosition } from '@/types/PlayerPosition';

const getPositionName = (position: number): string => {
  switch (position) {
    case PlayerPosition.GOALKEEPER: return 'GK';
    case PlayerPosition.DEFENDER: return 'DEF';
    case PlayerPosition.MIDFIELDER: return 'MID';
    case PlayerPosition.FORWARD: return 'FWD';
    default: return 'UNK';
  }
};

const getPositionInfo = (position: number) => {
  switch (position) {
    case PlayerPosition.GOALKEEPER:
      return { icon: 'tabler:hand-stop', label: 'Top Performing GK' };
    case PlayerPosition.DEFENDER:
      return { icon: 'oi:shield', label: 'Top Performing DEF' };
    case PlayerPosition.MIDFIELDER:
      return { icon: 'ph:brain-duotone', label: 'Top Performing MID' };
    case PlayerPosition.FORWARD:
      return { icon: 'mage:goals', label: 'Top Performing FWD' };
    default:
      return { icon: 'carbon:user', label: 'Top Performing' };
  }
};

export { getPositionName, getPositionInfo };
