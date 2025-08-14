import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventEmitter } from './eventEmitter';

const AuthNavigator = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleUnauthorized = () => {
      navigate('/login');
    };

    const unsubscribe = eventEmitter.on('unauthorized', handleUnauthorized);

    return () => {
      unsubscribe();
    };
  }, [navigate]);

  return null;
};

export default AuthNavigator;
