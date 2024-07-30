import { useMemo } from 'react';
import './Me.css';

type Props = {
  username: string;
};

const getPfpColor = (username: string) => {
  const letter = username[0].toUpperCase();

  if (letter >= 'A' && letter <= 'H') {
    return 'hsl(0, 100%, 40%)';
  } else if (letter >= 'I' && letter <= 'L') {
    return 'hsl(30, 100%, 50%)';
  } else if (letter >= 'M' && letter <= 'P') {
    return 'hsl(60, 100%, 30%)';
  } else if (letter >= 'Q' && letter <= 'T') {
    return 'hsl(120, 100%, 40%)';
  } else if (letter >= 'U' && letter <= 'W') {
    return 'hsl(180, 100%, 30%)';
  } else {
    return 'hsl(240, 100%, 60%)';
  }
};

const ProfilePicture = ({ username }: Props) => {
  const color = useMemo(() => getPfpColor(username), [username]);

  return (
    <div className="profile-picture" style={{ backgroundColor: color }}>
      {username[0].toUpperCase()}
    </div>
  );
};

export default ProfilePicture;
