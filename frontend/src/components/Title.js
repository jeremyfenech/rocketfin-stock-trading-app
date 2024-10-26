import { useEffect } from 'react';

const Title = ({ title }) => {
  useEffect(() => {
    document.title = `RocketFin Stock Trader | ${title}`;
  }, [title]);

  return null; // This component doesn't render anything
};

export default Title;
